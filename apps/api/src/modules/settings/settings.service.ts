import { Injectable } from '@nestjs/common';
import { Settings as SettingsEntity } from '../database/entities/settings.entity';
import { SettingsDBService } from '../database/services/settingsDBService';
import {
  AppSettings,
  PublicSettings,
  DEFAULT_SETTINGS,
  SEARCH_MATCH_MODES,
  PressSource,
} from './interfaces/settings.interface';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsDBService: SettingsDBService,
  ) {}

  async get(): Promise<AppSettings> {
    const s = await this.settingsDBService.getSettings();

    // If settings are not fully set (e.g. fresh database record created without defaults)
    // we can save defaults or just read from it.
    let parsedSources: PressSource[] = [];
    try {
      parsedSources = s.press_sources ? JSON.parse(s.press_sources) : [];
    } catch (e) {
      parsedSources = DEFAULT_SETTINGS.press_sources;
    }

    return {
      search_match_mode: (s.search_match_mode || DEFAULT_SETTINGS.search_match_mode) as any,
      max_results_per_target: s.max_results_per_target ?? DEFAULT_SETTINGS.max_results_per_target,
      scan_lookback_days: s.scan_lookback_days ?? DEFAULT_SETTINGS.scan_lookback_days,
      require_name_in_title: s.require_name_in_title ?? DEFAULT_SETTINGS.require_name_in_title,
      auto_scan_enabled: s.auto_scan_enabled ?? DEFAULT_SETTINGS.auto_scan_enabled,
      scan_interval_minutes: s.scan_interval_minutes ?? DEFAULT_SETTINGS.scan_interval_minutes,
      ui_refresh_seconds: s.ui_refresh_seconds ?? DEFAULT_SETTINGS.ui_refresh_seconds,
      filter_chinh_thong_only: s.filter_chinh_thong_only ?? DEFAULT_SETTINGS.filter_chinh_thong_only,
      telegram: {
        enabled: s.telegram_enabled ?? DEFAULT_SETTINGS.telegram.enabled,
        notify_role_change_only: s.telegram_notify_role_change_only ?? DEFAULT_SETTINGS.telegram.notify_role_change_only,
        notify_on_empty: s.telegram_notify_on_empty ?? DEFAULT_SETTINGS.telegram.notify_on_empty,
        bot_token: s.telegram_bot_token ?? DEFAULT_SETTINGS.telegram.bot_token,
        chat_id: s.telegram_chat_id ?? DEFAULT_SETTINGS.telegram.chat_id,
      },
      press_sources: parsedSources,
    };
  }

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

  private clampInt(v: unknown, min: number, max: number, fallback: number): number {
    const n = Math.round(Number(v));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  async update(patch: Record<string, any>): Promise<PublicSettings> {
    const s = await this.settingsDBService.getSettings();

    if (patch.search_match_mode !== undefined) {
      const m = String(patch.search_match_mode);
      if (SEARCH_MATCH_MODES.includes(m as any)) s.search_match_mode = m;
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
      if (tg.enabled !== undefined) s.telegram_enabled = !!tg.enabled;
      if (tg.notify_role_change_only !== undefined)
        s.telegram_notify_role_change_only = !!tg.notify_role_change_only;
      if (tg.notify_on_empty !== undefined) s.telegram_notify_on_empty = !!tg.notify_on_empty;
      if (typeof tg.bot_token === 'string' && tg.bot_token.trim()) {
        s.telegram_bot_token = tg.bot_token.trim();
      }
      if (typeof tg.chat_id === 'string' && tg.chat_id.trim()) {
        s.telegram_chat_id = tg.chat_id.trim();
      }
    }

    if (Array.isArray(patch.press_sources)) {
      const parsedSources = patch.press_sources
        .filter((p: any) => p && typeof p === 'object')
        .map((p: any): PressSource => ({
          name: String(p.name ?? '').trim(),
          homepage_url: String(p.homepage_url ?? p.url ?? '').trim(),
        }))
        .filter((p: PressSource) => p.name && p.homepage_url);
      s.press_sources = JSON.stringify(parsedSources);
    }

    await this.settingsDBService.updateItem(s.id, s);
    return this.getPublic();
  }
}
