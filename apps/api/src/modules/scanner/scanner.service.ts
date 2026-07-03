import { Injectable, Logger, ConflictException, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Parser = require('rss-parser');
import { TargetsService } from '../targets/targets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { SearchMatchMode } from '../settings/interfaces/settings.interface';
import { NotificationRecord } from '../notifications/interfaces/notification.interface';
import { TelegramService } from '../settings/telegram.service';
import { ScanStatus } from '../database/entities/scan-status.entity';
import { ScanStatusDBService } from '../database/services/scanStatusDBService';

const ROLE_CHANGE_RE =
  /bổ\s*nhiệm|miễn\s*nhiệm|bãi\s*nhiệm|điều\s*động|luân\s*chuyển|giữ\s*chức|phân\s*công|tân\s*nhiệm|được\s*giao\s*giữ|thôi\s*giữ|cách\s*chức/i;

@Injectable()
export class ScannerService implements OnModuleInit {
  private readonly logger = new Logger(ScannerService.name);
  private readonly parser = new Parser({ timeout: 15000 });
  private cancelRequested = false;

  constructor(
    private readonly scanStatusDBService: ScanStatusDBService,
    private readonly targetsService: TargetsService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
    private readonly telegramService: TelegramService,
  ) {}

  async onModuleInit() {
    await this.getStatus();
  }

  async getStatus(): Promise<ScanStatus & { autoScanEnabled: boolean }> {
    const s = await this.scanStatusDBService.getStatus();
    const settings = await this.settingsService.get();
    return { ...s, autoScanEnabled: settings.auto_scan_enabled };
  }

  async setAutoScan(enabled: boolean): Promise<ScanStatus & { autoScanEnabled: boolean }> {
    await this.settingsService.update({ auto_scan_enabled: enabled });
    if (enabled) {
      this.autoScanTick().catch((err) => {
        this.logger.warn(`Lỗi khi kích hoạt quét tự động: ${err.message}`);
      });
    }
    return this.getStatus();
  }

  requestCancel(): boolean {
    this.cancelRequested = true;
    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async autoScanTick(): Promise<void> {
    const status = await this.getStatus();
    if (status.isScanning) return;
    if (!status.autoScanEnabled) return;

    const settings = await this.settingsService.get();
    const intervalMs = settings.scan_interval_minutes * 60 * 1000;
    const lastMs = status.lastRun ? Date.parse(status.lastRun) : 0;
    if (lastMs && Date.now() - lastMs < intervalMs) return;

    this.logger.log('Auto-scan: tới chu kỳ → quét');
    try {
      await this.run();
    } catch (e: any) {
      this.logger.warn(`Auto-scan lỗi: ${e.message}`);
    }
  }

  async run(targetName?: string): Promise<{ added: number; scanned: number }> {
    const status = await this.getStatus();
    if (status.isScanning) {
      throw new ConflictException('Đang quét — vui lòng đợi lượt hiện tại xong');
    }

    await this.scanStatusDBService.updateItem(1, {
      isScanning: true,
      lastError: null,
      currentTarget: targetName || 'Tất cả mục tiêu',
    });
    this.cancelRequested = false;

    let added = 0;
    let scanned = 0;
    try {
      const settings = await this.settingsService.get();
      const all = await this.targetsService.findAll();
      const targets = targetName ? all.filter((t) => t.name === targetName) : all;

      const collected: NotificationRecord[] = [];
      for (const t of targets) {
        if (this.cancelRequested) break;
        await this.scanStatusDBService.updateItem(1, { currentTarget: t.name });
        try {
          const recs = await this.scanTarget(
            t.name,
            t.position,
            t.bio,
            settings.search_match_mode,
            settings.max_results_per_target,
            settings.scan_lookback_days,
            settings.require_name_in_title,
          );
          collected.push(...recs);
        } catch (e: any) {
          this.logger.warn(`Quét lỗi cho "${t.name}": ${e.message}`);
        }
        scanned++;
      }

      const addedRecords = await this.notificationsService.addRecordsAndGetAdded(collected);
      added = addedRecords.length;

      await this.scanStatusDBService.updateItem(1, {
        isScanning: false,
        lastRun: new Date().toISOString(),
        lastAdded: added,
        currentTarget: null,
      });

      this.logger.log(`Quét xong: ${scanned} mục tiêu, +${added} tin mới`);

      if (settings.telegram?.enabled) {
        const botToken = settings.telegram.bot_token;
        const chatId = settings.telegram.chat_id;
        if (botToken && chatId) {
          let notifyRecords = addedRecords;
          if (settings.telegram.notify_role_change_only) {
            notifyRecords = addedRecords.filter((r) => r.news_kind === 'biendong');
          }

          if (notifyRecords.length > 0) {
            const text = this.formatTelegramMessage(notifyRecords);
            await this.telegramService.sendMessage(botToken, chatId, text).catch((err) => {
              this.logger.warn(`Không gửi được thông báo Telegram: ${err.message}`);
            });
          } else if (settings.telegram.notify_on_empty) {
            const text = `🔔 <b>FDA — BÁO CÁO KẾT QUẢ QUÉT TIN</b>\n\nKhông có tin mới nào được tìm thấy.`;
            await this.telegramService.sendMessage(botToken, chatId, text).catch((err) => {
              this.logger.warn(`Không gửi được thông báo Telegram: ${err.message}`);
            });
          }
        }
      }
    } catch (e: any) {
      const errorMsg = e.message ?? String(e);
      await this.scanStatusDBService.updateItem(1, {
        isScanning: false,
        lastError: errorMsg,
        currentTarget: null,
      });
      this.logger.error(`Quét thất bại: ${errorMsg}`);
      throw e;
    }

    return { added, scanned };
  }

  private async scanTarget(
    name: string,
    position = '',
    bio = '',
    matchMode: SearchMatchMode = 'related',
    maxResults = 20,
    lookbackDays = 30,
    requireNameInTitle = true,
  ): Promise<NotificationRecord[]> {
    let query = this.composeQuery(name, position, matchMode);
    if (!query) return [];
    if (lookbackDays > 0) query += ` when:${lookbackDays}d`;
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      query,
    )}&hl=vi&gl=VN&ceid=VN:vi`;

    const feed = await this.parser.parseURL(url);
    const now = new Date().toISOString();
    const out: NotificationRecord[] = [];

    for (const item of (feed.items ?? []).slice(0, Math.max(1, maxResults))) {
      const link = (item.link ?? '').trim();
      const title = (item.title ?? '').trim();
      if (!link.startsWith('http') || !title) continue;

      if (requireNameInTitle && !this.titleHasName(title, name)) continue;

      const press = this.extractPress(title, item);
      const text = `${title} ${item.contentSnippet ?? ''}`;
      const isChange = ROLE_CHANGE_RE.test(text);

      const pubMs = item.pubDate ? Date.parse(item.pubDate) : NaN;
      const ts = Number.isFinite(pubMs) ? new Date(pubMs).toISOString() : now;

      out.push({
        timestamp: ts,
        scan_time: now,
        target_name: name,
        target_position: position,
        target_bio: bio,
        title,
        description: (item.contentSnippet ?? '').slice(0, 2000),
        url: link,
        resolved_url: '',
        published: item.pubDate ?? '',
        news_kind: isChange ? 'biendong' : 'hoatdong',
        press_name: press,
        press_domain: '',
        ai_result: {
          Matched_Target: true,
          Is_Activity: !isChange,
          Is_Change: isChange,
          Summary: title,
          AI_Disabled: true,
          Source: 'keyword_scan',
        },
      });
    }
    return out;
  }

  private titleHasName(title: string, name: string): boolean {
    const norm = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
    return norm(title).includes(norm(name.trim()));
  }

  private composeQuery(name: string, position: string, mode: SearchMatchMode): string {
    const nm = name.trim();
    const pos = position.trim();
    const q = (s: string) => `"${s}"`;
    switch (mode) {
      case 'related_position':
        return pos || nm;
      case 'exact_name':
        return q(nm);
      case 'exact_position':
        return pos ? q(pos) : q(nm);
      case 'exact':
        return pos ? `${q(nm)} ${q(pos)}` : q(nm);
      default:
        return nm;
    }
  }

  private extractPress(title: string, item: Record<string, any>): string {
    const src = item?.source?.title ?? item?.creator ?? '';
    if (src) return String(src).trim();
    const idx = title.lastIndexOf(' - ');
    return idx > 0 ? title.slice(idx + 3).trim() : '';
  }

  private formatTimestamp(tsString: string): string {
    try {
      const d = new Date(tsString);
      const localTime = new Date(d.getTime() + 7 * 60 * 60 * 1000); // UTC+7 Vietnam
      const dd = String(localTime.getUTCDate()).padStart(2, '0');
      const mm = String(localTime.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = localTime.getUTCFullYear();
      const hh = String(localTime.getUTCHours()).padStart(2, '0');
      const min = String(localTime.getUTCMinutes()).padStart(2, '0');
      return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
    } catch {
      return '';
    }
  }

  private formatTelegramMessage(records: NotificationRecord[]): string {
    const header = `🔔 <b>FDA — PHÁT HIỆN TIN MỚI</b>\n\nTìm thấy <b>${records.length}</b> tin mới:\n\n`;
    
    const grouped = new Map<string, NotificationRecord[]>();
    for (const r of records) {
      const name = r.target_name.trim();
      const list = grouped.get(name) ?? [];
      list.push(r);
      grouped.set(name, list);
    }

    let body = '';
    let leaderIdx = 1;
    let limitReached = false;

    for (const [name, list] of grouped.entries()) {
      if (limitReached) break;

      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const position = list[0].target_position ? ` - ${list[0].target_position}` : '';
      const leaderSectionHeader = `${leaderIdx}. <b>${name}${position}</b>\n`;

      if (header.length + body.length + leaderSectionHeader.length + 30 > 4000) {
        body += `... và một số tin khác.`;
        limitReached = true;
        break;
      }
      
      body += leaderSectionHeader;
      
      let articleIdx = 1;
      for (const r of list) {
        const timeStr = this.formatTimestamp(r.timestamp);
        const press = r.press_name || 'Báo điện tử';
        
        let articleLine = '';
        if (r.news_kind === 'biendong') {
          articleLine = `<b>- Bài viết ${articleIdx}: <a href="${r.url}">${r.title}</a> --- [${timeStr}] --- [${press}]</b>\n`;
        } else {
          articleLine = `- Bài viết ${articleIdx}: <a href="${r.url}">${r.title}</a> --- [${timeStr}] --- [${press}]\n`;
        }

        if (header.length + body.length + articleLine.length + 30 > 4000) {
          body += `... và một số tin khác.`;
          limitReached = true;
          break;
        }

        body += articleLine;
        articleIdx++;
      }

      body += '\n';
      leaderIdx++;
    }

    return (header + body).trim();
  }
}
