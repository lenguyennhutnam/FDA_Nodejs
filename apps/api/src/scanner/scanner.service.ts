import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Parser = require('rss-parser');
import { TargetsService } from '../targets/targets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { SearchMatchMode } from '../settings/interfaces/settings.interface';
import { NotificationRecord } from '../notifications/interfaces/notification.interface';

/** Từ khóa nhận diện tin thay đổi chức vụ (không cần AI). */
const ROLE_CHANGE_RE =
  /bổ\s*nhiệm|miễn\s*nhiệm|bãi\s*nhiệm|điều\s*động|luân\s*chuyển|giữ\s*chức|phân\s*công|tân\s*nhiệm|được\s*giao\s*giữ|thôi\s*giữ|cách\s*chức/i;

export interface ScanStatus {
  isScanning: boolean;
  lastRun: string | null;
  lastAdded: number;
  lastError: string | null;
  currentTarget: string | null;
  autoScanEnabled: boolean;
}

@Injectable()
export class ScannerService {
  private readonly logger = new Logger(ScannerService.name);
  private readonly parser = new Parser({ timeout: 15000 });

  // Trạng thái runtime (autoScanEnabled lấy từ settings, không lưu ở đây)
  private status = {
    isScanning: false,
    lastRun: null as string | null,
    lastAdded: 0,
    lastError: null as string | null,
    currentTarget: null as string | null,
  };
  private cancelRequested = false;

  constructor(
    private readonly targetsService: TargetsService,
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: SettingsService,
  ) {}

  async getStatus(): Promise<ScanStatus> {
    const s = await this.settingsService.get();
    return { ...this.status, autoScanEnabled: s.auto_scan_enabled };
  }

  async setAutoScan(enabled: boolean): Promise<ScanStatus> {
    await this.settingsService.update({ auto_scan_enabled: enabled });
    return this.getStatus();
  }

  requestCancel(): boolean {
    if (!this.status.isScanning) return false;
    this.cancelRequested = true;
    return true;
  }

  /** Quét nền: tick mỗi phút, chạy khi bật auto-scan và đã đủ chu kỳ. */
  @Cron(CronExpression.EVERY_MINUTE)
  async autoScanTick(): Promise<void> {
    if (this.status.isScanning) return;
    const s = await this.settingsService.get();
    if (!s.auto_scan_enabled) return;
    const intervalMs = s.scan_interval_minutes * 60 * 1000;
    const lastMs = this.status.lastRun ? Date.parse(this.status.lastRun) : 0;
    if (lastMs && Date.now() - lastMs < intervalMs) return;
    this.logger.log('Auto-scan: tới chu kỳ → quét');
    try {
      await this.run();
    } catch (e: any) {
      this.logger.warn(`Auto-scan lỗi: ${e.message}`);
    }
  }

  /** Quét tất cả mục tiêu (hoặc 1 mục tiêu nếu truyền tên). Trả về số tin mới thêm. */
  async run(targetName?: string): Promise<{ added: number; scanned: number }> {
    if (this.status.isScanning) {
      throw new ConflictException('Đang quét — vui lòng đợi lượt hiện tại xong');
    }

    this.status.isScanning = true;
    this.status.lastError = null;
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
        this.status.currentTarget = t.name;
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

      added = await this.notificationsService.addRecords(collected);
      this.status.lastAdded = added;
      this.status.lastRun = new Date().toISOString();
      this.logger.log(`Quét xong: ${scanned} mục tiêu, +${added} tin mới`);
    } catch (e: any) {
      this.status.lastError = e.message ?? String(e);
      this.logger.error(`Quét thất bại: ${this.status.lastError}`);
      throw e;
    } finally {
      this.status.isScanning = false;
      this.status.currentTarget = null;
      this.cancelRequested = false;
    }

    return { added, scanned };
  }

  /** Quét Google News RSS cho 1 mục tiêu, trả về danh sách bản ghi (chưa dedup). */
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
    // Giới hạn tin trong N ngày gần nhất để loại bài cũ (Google News `when:Nd`)
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

      // Loại bài chỉ khớp tên ở thân bài (tiêu đề không có tên) nếu bật tùy chọn
      if (requireNameInTitle && !this.titleHasName(title, name)) continue;

      const press = this.extractPress(title, item);
      const text = `${title} ${item.contentSnippet ?? ''}`;
      const isChange = ROLE_CHANGE_RE.test(text);

      // timestamp = NGÀY ĐĂNG THẬT của bài (pubDate), không phải lúc quét —
      // để bộ lọc cửa sổ thời gian loại đúng bài cũ.
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

  /** Tiêu đề có chứa tên mục tiêu không (bỏ dấu, không phân biệt hoa thường). */
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

  /** Tạo truy vấn Google News theo chế độ tìm kiếm. */
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
        return nm; // related
    }
  }

  /** Lấy tên báo từ tiêu đề Google News ("Tiêu đề - Tên báo") hoặc field source. */
  private extractPress(title: string, item: Record<string, any>): string {
    const src = item?.source?.title ?? item?.creator ?? '';
    if (src) return String(src).trim();
    const idx = title.lastIndexOf(' - ');
    return idx > 0 ? title.slice(idx + 3).trim() : '';
  }
}
