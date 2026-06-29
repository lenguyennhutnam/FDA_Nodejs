import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  AppSettings,
  PublicSettings,
  DEFAULT_SETTINGS,
  SEARCH_MATCH_MODES,
  PressSource,
} from './interfaces/settings.interface';

/** Lưu cấu hình hệ thống bằng file JSON. */
@Injectable()
export class SettingsService {
  private get filePath(): string {
    return process.env.SETTINGS_FILE || path.join(process.cwd(), 'data', 'settings.json');
  }

  /** Cấu hình đầy đủ (gồm token Telegram) — dùng nội bộ (scanner, telegram). */
  async get(): Promise<AppSettings> {
    let stored: Partial<AppSettings> = {};
    try {
      stored = JSON.parse(await fs.readFile(this.filePath, 'utf-8'));
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      telegram: { ...DEFAULT_SETTINGS.telegram, ...(stored.telegram ?? {}) },
      press_sources: Array.isArray(stored.press_sources)
        ? stored.press_sources
        : DEFAULT_SETTINGS.press_sources,
    };
  }

  /** Bản công khai trả ra API — ẩn token/chat_id. */
  async getPublic(): Promise<PublicSettings> {
    const s = await this.get();
    const { telegram, ...rest } = s;
    return {
      ...rest,
      telegram: {
        enabled: telegram.enabled,
        notify_role_change_only: telegram.notify_role_change_only,
        notify_on_empty: telegram.notify_on_empty,
        bot_token_configured: !!telegram.bot_token,
        chat_id_configured: !!telegram.chat_id,
      },
    };
  }

  private async save(s: AppSettings): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(s, null, 2), 'utf-8');
  }

  private clampInt(v: unknown, min: number, max: number, fallback: number): number {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  /** Cập nhật một phần cấu hình; trả về bản công khai sau khi lưu. */
  async update(patch: Record<string, any>): Promise<PublicSettings> {
    const s = await this.get();

    if (patch.search_match_mode !== undefined) {
      const m = String(patch.search_match_mode);
      if (SEARCH_MATCH_MODES.includes(m as any)) s.search_match_mode = m as any;
    }
    if (patch.max_results_per_target !== undefined) {
      s.max_results_per_target = this.clampInt(patch.max_results_per_target, 1, 100, s.max_results_per_target);
    }
    if (patch.scan_lookback_days !== undefined) {
      s.scan_lookback_days = this.clampInt(patch.scan_lookback_days, 1, 90, s.scan_lookback_days);
    }
    if (patch.require_name_in_title !== undefined) {
      s.require_name_in_title = !!patch.require_name_in_title;
    }
    if (patch.auto_scan_enabled !== undefined) {
      s.auto_scan_enabled = !!patch.auto_scan_enabled;
    }
    if (patch.scan_interval_minutes !== undefined) {
      s.scan_interval_minutes = this.clampInt(patch.scan_interval_minutes, 5, 1440, s.scan_interval_minutes);
    }
    if (patch.ui_refresh_seconds !== undefined) {
      s.ui_refresh_seconds = this.clampInt(patch.ui_refresh_seconds, 10, 300, s.ui_refresh_seconds);
    }
    if (patch.filter_chinh_thong_only !== undefined) {
      s.filter_chinh_thong_only = !!patch.filter_chinh_thong_only;
    }

    const tg = patch.telegram;
    if (tg && typeof tg === 'object') {
      if (tg.enabled !== undefined) s.telegram.enabled = !!tg.enabled;
      if (tg.notify_role_change_only !== undefined)
        s.telegram.notify_role_change_only = !!tg.notify_role_change_only;
      if (tg.notify_on_empty !== undefined) s.telegram.notify_on_empty = !!tg.notify_on_empty;
      // Chỉ ghi đè token/chat_id khi có giá trị mới (chuỗi rỗng = giữ nguyên)
      if (typeof tg.bot_token === 'string' && tg.bot_token.trim()) {
        s.telegram.bot_token = tg.bot_token.trim();
      }
      if (typeof tg.chat_id === 'string' && tg.chat_id.trim()) {
        s.telegram.chat_id = tg.chat_id.trim();
      }
    }

    if (Array.isArray(patch.press_sources)) {
      s.press_sources = patch.press_sources
        .filter((p: any) => p && typeof p === 'object')
        .map((p: any): PressSource => ({
          name: String(p.name ?? '').trim(),
          homepage_url: String(p.homepage_url ?? p.url ?? '').trim(),
        }))
        .filter((p: PressSource) => p.name && p.homepage_url);
    }

    await this.save(s);
    return this.getPublic();
  }
}
