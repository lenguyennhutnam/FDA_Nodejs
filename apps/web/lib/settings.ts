import { apiGet } from './api';
import { getAccessToken } from './auth';

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

export async function fetchSettings(): Promise<PublicSettings | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiGet<PublicSettings>('/settings', token);
  } catch {
    return null;
  }
}

export async function fetchDataStats(): Promise<DataStats | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiGet<DataStats>('/data/stats', token);
  } catch {
    return null;
  }
}
