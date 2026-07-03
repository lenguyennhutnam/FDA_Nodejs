export type SearchMatchMode =
  | 'related'
  | 'related_position'
  | 'exact_name'
  | 'exact_position'
  | 'exact';

export interface TelegramSettings {
  enabled: boolean;
  notify_role_change_only: boolean;
  notify_on_empty: boolean;
  bot_token: string;
  chat_id: string;
}

export interface PressSource {
  name: string;
  homepage_url: string;
}

export interface AppSettings {
  search_match_mode: SearchMatchMode;
  max_results_per_target: number;
  scan_lookback_days: number;
  require_name_in_title: boolean;
  auto_scan_enabled: boolean;
  scan_interval_minutes: number;
  ui_refresh_seconds: number;
  filter_chinh_thong_only: boolean;
  telegram: TelegramSettings;
  press_sources: PressSource[];
}

export interface PublicSettings
  extends Omit<AppSettings, 'telegram'> {
  telegram: {
    enabled: boolean;
    notify_role_change_only: boolean;
    notify_on_empty: boolean;
    bot_token_configured: boolean;
    chat_id_configured: boolean;
  };
}

export const SEARCH_MATCH_MODES: SearchMatchMode[] = [
  'related',
  'related_position',
  'exact_name',
  'exact_position',
  'exact',
];

export const DEFAULT_SETTINGS: AppSettings = {
  search_match_mode: 'exact_name',
  max_results_per_target: 20,
  scan_lookback_days: 30,
  require_name_in_title: true,
  auto_scan_enabled: false,
  scan_interval_minutes: 30,
  ui_refresh_seconds: 30,
  filter_chinh_thong_only: false,
  telegram: {
    enabled: false,
    notify_role_change_only: false,
    notify_on_empty: false,
    bot_token: '',
    chat_id: '',
  },
  press_sources: [],
};
