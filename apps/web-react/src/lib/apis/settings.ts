import createApiServices from './make-api-request';

const api = createApiServices();

export type PressSource = { name: string; homepage_url: string };

export type PublicSettings = {
  search_match_mode: string;
  max_results_per_target: number;
  scan_lookback_days: number;
  require_name_in_title: boolean;
  auto_scan_enabled: boolean;
  scan_interval_minutes: number;
  ui_refresh_seconds: number;
  filter_chinh_thong_only: boolean;
  press_sources: PressSource[];
  telegram: {
    enabled: boolean;
    notify_role_change_only: boolean;
    notify_on_empty: boolean;
    bot_token_configured: boolean;
    chat_id_configured: boolean;
  };
};

export type DataStats = {
  hoatdong: number;
  biendong: number;
  total: number;
  bytes: number;
};

export const SEARCH_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'related', label: 'Liên quan tên — Tên' },
  { value: 'related_position', label: 'Liên quan chức vụ — Chức vụ' },
  { value: 'exact_name', label: 'Chính xác tên — "Tên"' },
  { value: 'exact_position', label: 'Chính xác chức vụ — "Chức vụ"' },
  { value: 'exact', label: 'Chính xác tên + chức vụ — "Tên" "Chức vụ"' },
];

export const SettingService = {
  fetchSettings: async (token: string): Promise<PublicSettings | null> => {
    if (!token) return null;
    try {
      return await api.makeAuthRequest({
        url: '/settings',
        method: 'GET',
        token,
      });
    } catch {
      return null;
    }
  },

  fetchDataStats: async (token: string): Promise<DataStats | null> => {
    if (!token) return null;
    try {
      return await api.makeAuthRequest({
        url: '/data/stats',
        method: 'GET',
        token,
      });
    } catch {
      return null;
    }
  },

  saveSettings: async (patch: Record<string, unknown>, token: string): Promise<void> => {
    return api.makeAuthRequest({
      url: '/settings',
      method: 'POST',
      data: patch,
      token,
    });
  },

  testTelegram: async (botToken: string, chatId: string, token: string): Promise<void> => {
    return api.makeAuthRequest({
      url: '/settings/telegram-test',
      method: 'POST',
      data: { bot_token: botToken, chat_id: chatId },
      token,
    });
  },

  clearData: async (range: string, token: string): Promise<{ removed: number }> => {
    return api.makeAuthRequest({
      url: '/data/clear',
      method: 'POST',
      data: { range },
      token,
    });
  },
};
