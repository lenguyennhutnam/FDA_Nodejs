import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TargetsService } from '../targets/targets.service';
import {
  NotificationsStore,
  NotificationRecord,
  TargetSummary,
} from './interfaces/notification.interface';

const CHANNELS = ['channel_hoatdong', 'channel_biendong'] as const;

/**
 * Đọc/ghi & tổng hợp tin tức. Lưu tạm bằng file JSON.
 * Phase 3 chỉ lọc theo cửa sổ thời gian + tách relevant/irrelevant theo user_label;
 * lọc theo chế độ AI / báo chính thống để dành Phase 5 (Settings).
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly targetsService: TargetsService) {}

  private get filePath(): string {
    return (
      process.env.NOTIFICATIONS_FILE ||
      path.join(process.cwd(), 'data', 'notifications.json')
    );
  }

  async loadAll(): Promise<NotificationsStore> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      return {
        channel_hoatdong: Array.isArray(data?.channel_hoatdong) ? data.channel_hoatdong : [],
        channel_biendong: Array.isArray(data?.channel_biendong) ? data.channel_biendong : [],
      };
    } catch (e: any) {
      if (e.code === 'ENOENT') return { channel_hoatdong: [], channel_biendong: [] };
      throw e;
    }
  }

  async saveAll(store: NotificationsStore): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(store, null, 2), 'utf-8');
  }

  /**
   * Thêm các tin mới quét được, bỏ qua tin trùng (theo khóa target_name|url).
   * Trả về số tin thực sự được thêm.
   */
  async addRecords(records: NotificationRecord[]): Promise<number> {
    if (!records.length) return 0;
    const store = await this.loadAll();

    const seenUrl = new Set<string>();
    const tokensByTarget = new Map<string, Set<string>[]>();
    const remember = (name: string, toks: Set<string>) => {
      const list = tokensByTarget.get(name) ?? [];
      list.push(toks);
      tokensByTarget.set(name, list);
    };
    for (const ch of CHANNELS) {
      for (const r of store[ch]) {
        seenUrl.add(this.key(r.target_name, r.url));
        remember((r.target_name || '').trim(), this.titleTokens(r.title));
      }
    }

    let added = 0;
    for (const r of records) {
      const k = this.key(r.target_name, r.url);
      if (seenUrl.has(k)) continue; // trùng URL
      const name = (r.target_name || '').trim();
      const toks = this.titleTokens(r.title);
      const existing = tokensByTarget.get(name) ?? [];
      // Bỏ qua bài có tiêu đề giống/gần giống (báo đăng lại cùng nội dung)
      if (existing.some((t) => this.jaccard(t, toks) >= 0.6)) continue;

      seenUrl.add(k);
      remember(name, toks);
      const ch = r.news_kind === 'biendong' ? 'channel_biendong' : 'channel_hoatdong';
      store[ch].push(r);
      added++;
    }
    if (added) await this.saveAll(store);
    return added;
  }

  private key(name?: string, url?: string): string {
    return `${(name || '').trim()}|${(url || '').trim()}`;
  }

  /** Tập từ khóa của tiêu đề (bỏ " - Tên báo", bỏ dấu, bỏ ký tự đặc biệt). */
  private titleTokens(title?: string): Set<string> {
    const raw = (title || '').replace(/\s+-\s+[^-]+$/, '');
    const norm = raw
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ');
    return new Set(norm.split(/\s+/).filter((w) => w.length >= 2));
  }

  /** Độ tương đồng Jaccard giữa 2 tập từ. */
  private jaccard(a: Set<string>, b: Set<string>): number {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter);
  }

  /** Thống kê dữ liệu tin (số lượng + dung lượng file). */
  async getStats(): Promise<{ hoatdong: number; biendong: number; total: number; bytes: number }> {
    const store = await this.loadAll();
    const hd = store.channel_hoatdong.length;
    const bd = store.channel_biendong.length;
    let bytes = 0;
    try {
      bytes = (await fs.stat(this.filePath)).size;
    } catch {
      bytes = 0;
    }
    return { hoatdong: hd, biendong: bd, total: hd + bd, bytes };
  }

  /** Xóa tin theo khoảng thời gian (1h/24h/7d/4w/all). Trả số tin đã xóa. */
  async clear(range: string): Promise<{ removed: number }> {
    const store = await this.loadAll();
    const before = store.channel_hoatdong.length + store.channel_biendong.length;

    if (range === 'all') {
      await this.saveAll({ channel_hoatdong: [], channel_biendong: [] });
      return { removed: before };
    }

    const hoursMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '4w': 672 };
    const hrs = hoursMap[range];
    if (!hrs) return { removed: 0 };
    const cutoff = Date.now() - hrs * 3600 * 1000;

    for (const ch of CHANNELS) {
      store[ch] = store[ch].filter((r) => {
        const t = r.scan_time ? this.ts(r.scan_time) : this.ts(r.timestamp);
        return t < cutoff;
      });
    }
    await this.saveAll(store);
    const after = store.channel_hoatdong.length + store.channel_biendong.length;
    return { removed: before - after };
  }

  /** Tin mới nhất (gộp 2 kênh), sắp xếp giảm dần theo thời gian. */
  async getRecent(limit = 20): Promise<NotificationRecord[]> {
    const store = await this.loadAll();
    const all = [...store.channel_hoatdong, ...store.channel_biendong];
    all.sort((a, b) => this.ts(b.timestamp) - this.ts(a.timestamp));
    return all.slice(0, limit).map((r) => this.enrich(r));
  }

  /** Thẻ tóm tắt cho từng mục tiêu trong danh sách. */
  async summarize(hours: number): Promise<TargetSummary[]> {
    const store = await this.loadAll();
    const targets = await this.targetsService.findAll();
    return targets.map((t) => this.buildSummary(t.name, hours, store));
  }

  /** Chi tiết 1 mục tiêu: tóm tắt + danh sách tin (relevant / irrelevant / đổi chức vụ). */
  async getDetail(name: string, hours: number) {
    const store = await this.loadAll();
    const target = name.trim();
    const rowsHd = this.rowsInWindow(store.channel_hoatdong, target, hours);
    const rowsBd = this.rowsInWindow(store.channel_biendong, target, hours);
    const rel = rowsHd.filter((r) => r.user_label !== 'irrelevant');
    const irrel = rowsHd.filter((r) => r.user_label === 'irrelevant');
    return {
      target_name: target,
      since_hours: hours,
      summary: this.buildSummary(target, hours, store),
      records_hoatdong: rel.map((r) => this.enrich(r)),
      records_hoatdong_irrelevant: irrel.map((r) => this.enrich(r)),
      records_biendong: rowsBd.map((r) => this.enrich(r)),
    };
  }

  /** Gán/xóa user_label cho các bài theo url (khớp url hoặc resolved_url). */
  async label(urls: string[], label: string): Promise<{ labeled: number }> {
    const store = await this.loadAll();
    const urlSet = new Set(urls.map((u) => String(u)));
    const value = (label || '').trim();
    let count = 0;
    for (const ch of CHANNELS) {
      for (const item of store[ch]) {
        if (urlSet.has(item.url) || (item.resolved_url && urlSet.has(item.resolved_url))) {
          if (value) item.user_label = value;
          else delete item.user_label;
          count++;
        }
      }
    }
    await this.saveAll(store);
    return { labeled: count };
  }

  // ── Helpers ────────────────────────────────────────────────────

  private ts(value?: string): number {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  private rowsInWindow(
    rows: NotificationRecord[],
    name: string,
    hours: number,
  ): NotificationRecord[] {
    const cutoff = Date.now() - Math.max(0.1, hours) * 3600 * 1000;
    // Dùng scan_time (lúc quét) cho cửa sổ lọc; fallback timestamp (pubDate) cho bản ghi cũ
    const filterTs = (r: NotificationRecord) =>
      r.scan_time ? this.ts(r.scan_time) : this.ts(r.timestamp);
    return rows
      .filter((r) => (r.target_name || '').trim() === name && filterTs(r) >= cutoff)
      .sort((a, b) => this.ts(b.timestamp) - this.ts(a.timestamp));
  }

  private enrich(row: NotificationRecord): NotificationRecord & { article_url: string } {
    return { ...row, article_url: row.resolved_url || row.url || '' };
  }

  private buildSummary(
    name: string,
    hours: number,
    store: NotificationsStore,
  ): TargetSummary {
    const rowsHd = this.rowsInWindow(store.channel_hoatdong, name, hours).filter(
      (r) => r.user_label !== 'irrelevant',
    );
    const rowsBd = this.rowsInWindow(store.channel_biendong, name, hours);
    const nHd = rowsHd.length;
    const nBd = rowsBd.length;

    let status: TargetSummary['status'];
    let headline: string;
    if (nBd > 0) {
      status = 'change';
      headline = `${name} — có tin biến động chức vụ (${nBd})`;
    } else if (nHd > 0) {
      status = 'stable_activity';
      headline = `${name} — ${nHd} tin hoạt động, chưa thấy đổi chức vụ`;
    } else {
      status = 'no_data';
      headline = `${name} — chưa có tin`;
    }

    const all = [...rowsHd, ...rowsBd];
    const confidences: number[] = [];
    const sources: string[] = [];
    let latest = 0;
    for (const row of all) {
      const ai = (row.ai_result || {}) as Record<string, unknown>;
      const c = Number(ai.Confidence);
      if (!Number.isNaN(c) && c > 0) {
        confidences.push(Math.min(100, Math.max(0, c <= 1 ? c * 100 : c)));
      }
      const press = (row.press_name || row.press_domain || '').trim();
      if (press && !sources.includes(press)) sources.push(press);
      const t = this.ts(row.timestamp);
      if (t > latest) latest = t;
    }

    const confidenceAvg = confidences.length
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : null;
    const isNew = latest > 0 && Date.now() - latest < 6 * 3600 * 1000;

    return {
      target_name: name,
      status,
      headline,
      activity_count: nHd,
      change_count: nBd,
      since_hours: hours,
      confidence_avg: confidenceAvg,
      sources: sources.slice(0, 8),
      latest_timestamp: latest > 0 ? new Date(latest).toISOString() : null,
      is_new: isNew,
      article_total: all.length,
    };
  }
}
