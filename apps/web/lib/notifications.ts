import { apiGet } from './api';
import { getAccessToken } from './auth';

export type AiResult = {
  Summary?: string;
  Confidence?: number;
  Is_Change?: boolean;
  From_Position?: string;
  To_Position?: string;
  Position_Full_Official?: string;
  Change_Date?: string;
  Activity_Bullets?: string[];
  [k: string]: unknown;
};

export type NotificationRecord = {
  timestamp: string;
  target_name: string;
  target_position?: string;
  title: string;
  description?: string;
  url: string;
  resolved_url?: string;
  article_url?: string;
  press_name?: string;
  press_domain?: string;
  ai_result?: AiResult;
  target_bio?: string;
  user_label?: string;
};

export type TargetSummary = {
  target_name: string;
  status: 'change' | 'stable_activity' | 'no_data';
  headline: string;
  activity_count: number;
  change_count: number;
  since_hours: number;
  confidence_avg: number | null;
  sources: string[];
  latest_timestamp: string | null;
  is_new: boolean;
  article_total: number;
};

export type TargetDetail = {
  target_name: string;
  since_hours: number;
  summary: TargetSummary;
  records_hoatdong: NotificationRecord[];
  records_hoatdong_irrelevant: NotificationRecord[];
  records_biendong: NotificationRecord[];
};

export async function fetchSummary(hours: number): Promise<TargetSummary[]> {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    return await apiGet<TargetSummary[]>(`/notifications/summary?hours=${hours}`, token);
  } catch {
    return [];
  }
}

export async function fetchRecent(limit = 15): Promise<NotificationRecord[]> {
  const token = await getAccessToken();
  if (!token) return [];
  try {
    return await apiGet<NotificationRecord[]>(`/notifications?limit=${limit}`, token);
  } catch {
    return [];
  }
}

export async function fetchDetail(name: string, hours: number): Promise<TargetDetail | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await apiGet<TargetDetail>(
      `/notifications/detail?name=${encodeURIComponent(name)}&hours=${hours}`,
      token,
    );
  } catch {
    return null;
  }
}
