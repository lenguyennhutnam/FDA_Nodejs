/** Kết quả phân tích AI cho 1 bài báo (Phase 4 scanner sẽ điền đầy đủ). */
export interface AiResult {
  Matched_Target?: boolean;
  Is_Activity?: boolean;
  Is_Change?: boolean;
  Summary?: string;
  Confidence?: number;
  From_Position?: string;
  To_Position?: string;
  Position_Full_Official?: string;
  Change_Date?: string;
  Activity_Bullets?: string[];
  [k: string]: unknown;
}

/** 1 bản ghi tin tức đã lưu. */
export interface NotificationRecord {
  timestamp: string;     // pubDate bài báo — để hiển thị & sort
  scan_time?: string;    // thời điểm quét — để lọc cửa sổ dashboard
  target_name: string;
  target_position?: string;
  title: string;
  description?: string;
  url: string;
  published?: string;
  news_kind?: string;
  resolved_url?: string;
  press_name?: string;
  press_domain?: string;
  ai_result?: AiResult;
  target_bio?: string;
  user_label?: string;
}

/** Kho tin: 2 kênh hoạt động & đổi chức vụ. */
export interface NotificationsStore {
  channel_hoatdong: NotificationRecord[];
  channel_biendong: NotificationRecord[];
}

/** Thẻ tóm tắt 1 mục tiêu trong cửa sổ thời gian. */
export interface TargetSummary {
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
}
