import createApiServices from './make-api-request';

const api = createApiServices();

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

export const NotificationService = {
  fetchSummary: async (hours: number, token: string): Promise<TargetSummary[]> => {
    if (!token) return [];
    try {
      return await api.makeAuthRequest({
        url: `/notifications/summary?hours=${hours}`,
        method: 'GET',
        token,
      });
    } catch {
      return [];
    }
  },

  fetchRecent: async (limit = 15, token: string): Promise<NotificationRecord[]> => {
    if (!token) return [];
    try {
      return await api.makeAuthRequest({
        url: `/notifications?limit=${limit}`,
        method: 'GET',
        token,
      });
    } catch {
      return [];
    }
  },

  fetchDetail: async (name: string, hours: number, token: string): Promise<TargetDetail | null> => {
    if (!token) return null;
    try {
      return await api.makeAuthRequest({
        url: `/notifications/detail?name=${encodeURIComponent(name)}&hours=${hours}`,
        method: 'GET',
        token,
      });
    } catch {
      return null;
    }
  },

  label: async (urls: string[], label: string, token: string): Promise<{ labeled: number }> => {
    return api.makeAuthRequest({
      url: '/notifications/label',
      method: 'POST',
      data: { urls, label },
      token,
    });
  },
};
