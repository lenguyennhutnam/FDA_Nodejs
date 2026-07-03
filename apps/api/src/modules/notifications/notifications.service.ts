import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TargetsService } from '../targets/targets.service';
import { Notification } from '../database/entities/notification.entity';
import { NotificationDBService } from '../database/services/notificationDBService';
import {
  NotificationRecord,
  TargetSummary,
} from './interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationDBService: NotificationDBService,
    private readonly targetsService: TargetsService,
  ) {}

  private mapEntityToRecord(item: Notification): NotificationRecord {
    let aiResultParsed = null;
    try {
      aiResultParsed = item.ai_result ? JSON.parse(item.ai_result) : null;
    } catch (e) {}

    return {
      timestamp: item.timestamp,
      scan_time: item.scan_time ?? undefined,
      target_name: item.target_name,
      target_position: item.target_position,
      target_bio: item.target_bio,
      title: item.title,
      description: item.description,
      url: item.url,
      resolved_url: item.resolved_url,
      published: item.published,
      news_kind: item.news_kind as any,
      press_name: item.press_name,
      press_domain: item.press_domain,
      ai_result: aiResultParsed,
      user_label: item.user_label as any,
    };
  }

  async addRecords(records: NotificationRecord[]): Promise<number> {
    const added = await this.addRecordsAndGetAdded(records);
    return added.length;
  }

  async addRecordsAndGetAdded(records: NotificationRecord[]): Promise<NotificationRecord[]> {
    if (!records.length) return [];
    
    const targetNames = [...new Set(records.map((r) => r.target_name))];
    const existingRows = await this.notificationDBService.repo.find({
      where: { target_name: In(targetNames) },
    });

    const seenUrl = new Set<string>();
    const tokensByTarget = new Map<string, Set<string>[]>();
    const remember = (name: string, toks: Set<string>) => {
      const list = tokensByTarget.get(name) ?? [];
      list.push(toks);
      tokensByTarget.set(name, list);
    };

    for (const r of existingRows) {
      seenUrl.add(this.key(r.target_name, r.url));
      remember((r.target_name || '').trim(), this.titleTokens(r.title));
    }

    const added: Notification[] = [];
    for (const r of records) {
      const k = this.key(r.target_name, r.url);
      if (seenUrl.has(k)) continue;
      
      const name = (r.target_name || '').trim();
      const toks = this.titleTokens(r.title);
      const existing = tokensByTarget.get(name) ?? [];
      if (existing.some((t) => this.jaccard(t, toks) >= 0.6)) continue;

      seenUrl.add(k);
      remember(name, toks);

      const entity = this.notificationDBService.repo.create({
        timestamp: r.timestamp,
        scan_time: r.scan_time,
        target_name: r.target_name,
        target_position: r.target_position ?? '',
        target_bio: r.target_bio ?? '',
        title: r.title,
        description: r.description ?? '',
        url: r.url,
        resolved_url: r.resolved_url ?? '',
        published: r.published ?? '',
        news_kind: r.news_kind,
        press_name: r.press_name ?? '',
        press_domain: r.press_domain ?? '',
        ai_result: r.ai_result ? JSON.stringify(r.ai_result) : null,
        user_label: r.user_label ?? null,
      });
      added.push(entity);
    }

    if (added.length) {
      await this.notificationDBService.repo.save(added);
    }

    return added.map(item => this.mapEntityToRecord(item));
  }

  private key(name?: string, url?: string): string {
    return `${(name || '').trim()}|${(url || '').trim()}`;
  }

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

  private jaccard(a: Set<string>, b: Set<string>): number {
    if (!a.size || !b.size) return 0;
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter);
  }

  async getStats(): Promise<{ hoatdong: number; biendong: number; total: number; bytes: number }> {
    const hd = await this.notificationDBService.repo.count({ where: { news_kind: 'hoatdong' } });
    const bd = await this.notificationDBService.repo.count({ where: { news_kind: 'biendong' } });
    let bytes = 0;
    try {
      const dbFile = path.join(process.cwd(), 'data', 'fda.db');
      bytes = (await fs.stat(dbFile)).size;
    } catch {
      bytes = 0;
    }
    return { hoatdong: hd, biendong: bd, total: hd + bd, bytes };
  }

  async clear(range: string): Promise<{ removed: number }> {
    if (range === 'all') {
      const count = await this.notificationDBService.repo.count();
      await this.notificationDBService.repo.clear();
      return { removed: count };
    }

    const hoursMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '4w': 672 };
    const hrs = hoursMap[range];
    if (!hrs) return { removed: 0 };
    const cutoff = new Date(Date.now() - hrs * 3600 * 1000).toISOString();

    const qb = this.notificationDBService.repo.createQueryBuilder()
      .delete()
      .from(Notification)
      .where('COALESCE(scan_time, timestamp) >= :cutoff', { cutoff });
    
    const result = await qb.execute();
    return { removed: result.affected ?? 0 };
  }

  async getRecent(limit = 20): Promise<NotificationRecord[]> {
    const list = await this.notificationDBService.repo.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
    return list.map((item) => this.enrich(this.mapEntityToRecord(item)));
  }

  async summarize(hours: number): Promise<TargetSummary[]> {
    const targets = await this.targetsService.findAll();
    const cutoff = new Date(Date.now() - Math.max(0.1, hours) * 3600 * 1000).toISOString();
    
    const list = await this.notificationDBService.repo
      .createQueryBuilder('n')
      .where('COALESCE(n.scan_time, n.timestamp) >= :cutoff', { cutoff })
      .getMany();

    const records = list.map(item => this.mapEntityToRecord(item));

    return targets.map((t) => {
      const rowsHd = records.filter(
        (r) =>
          r.target_name === t.name &&
          r.news_kind === 'hoatdong' &&
          r.user_label !== 'irrelevant',
      );
      const rowsBd = records.filter(
        (r) => r.target_name === t.name && r.news_kind === 'biendong',
      );
      return this.buildSummaryFromRows(t.name, hours, rowsHd, rowsBd);
    });
  }

  async getDetail(name: string, hours: number) {
    const target = name.trim();
    const cutoff = new Date(Date.now() - Math.max(0.1, hours) * 3600 * 1000).toISOString();

    const list = await this.notificationDBService.repo
      .createQueryBuilder('n')
      .where('n.target_name = :target', { target })
      .andWhere('COALESCE(n.scan_time, n.timestamp) >= :cutoff', { cutoff })
      .getMany();

    const records = list.map(item => this.enrich(this.mapEntityToRecord(item)));

    const rowsHd = records.filter((r) => r.news_kind === 'hoatdong');
    const rowsBd = records.filter((r) => r.news_kind === 'biendong');

    const rel = rowsHd.filter((r) => r.user_label !== 'irrelevant');
    const irrel = rowsHd.filter((r) => r.user_label === 'irrelevant');

    const sortDesc = (a: any, b: any) => this.ts(b.timestamp) - this.ts(a.timestamp);
    rel.sort(sortDesc);
    irrel.sort(sortDesc);
    rowsBd.sort(sortDesc);

    const summary = this.buildSummaryFromRows(target, hours, rel, rowsBd);

    return {
      target_name: target,
      since_hours: hours,
      summary,
      records_hoatdong: rel,
      records_hoatdong_irrelevant: irrel,
      records_biendong: rowsBd,
    };
  }

  async label(urls: string[], label: string): Promise<{ labeled: number }> {
    if (!urls.length) return { labeled: 0 };
    const value = label.trim() || null;
    
    const result = await this.notificationDBService.repo.createQueryBuilder()
      .update(Notification)
      .set({ user_label: value })
      .where('url IN (:...urls) OR (resolved_url IS NOT NULL AND resolved_url IN (:...urls))', { urls })
      .execute();
    
    return { labeled: result.affected ?? 0 };
  }

  private ts(value?: string): number {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  private enrich(row: NotificationRecord): NotificationRecord & { article_url: string } {
    return { ...row, article_url: row.resolved_url || row.url || '' };
  }

  private buildSummaryFromRows(
    name: string,
    hours: number,
    rowsHd: NotificationRecord[],
    rowsBd: NotificationRecord[],
  ): TargetSummary {
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
