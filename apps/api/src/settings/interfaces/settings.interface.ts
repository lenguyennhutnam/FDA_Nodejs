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
  /** Chỉ lấy tin đăng trong N ngày gần nhất (Google News `when:Nd`). */
  scan_lookback_days: number;
  /** Chỉ giữ bài có tên mục tiêu trong tiêu đề (loại bài chỉ khớp ở thân bài). */
  require_name_in_title: boolean;
  auto_scan_enabled: boolean;
  scan_interval_minutes: number;
  ui_refresh_seconds: number;
  filter_chinh_thong_only: boolean;
  telegram: TelegramSettings;
  press_sources: PressSource[];
}

/** Bản công khai: ẩn token/chat_id, chỉ báo đã cấu hình hay chưa. */
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
  // Mặc định tìm chính xác theo TÊN (không lẫn bài về chức vụ của người khác)
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
