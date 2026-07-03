export interface SystemSetting {
  key: string;
  value: string;
  default_value: string;
  created_date: number;
  last_update: number;
}

export interface SystemSettingMetadata {
  key: string;
  data_type: 'cron' | 'boolean' | 'number' | 'string' | 'url';
  description: string;
}

export interface SystemSettingWithMetadata extends SystemSetting {
  data_type: string;
  description: string;
}

export enum SystemSettingCategory {
  NOTIFICATION_SCHEDULE = 'notification_schedule',
  BACKUP = 'backup',
  QISMS = 'qisms',
}

export interface SettingsByCategory {
  [SystemSettingCategory.NOTIFICATION_SCHEDULE]: SystemSettingWithMetadata[];
  [SystemSettingCategory.BACKUP]: SystemSettingWithMetadata[];
  [SystemSettingCategory.QISMS]: SystemSettingWithMetadata[];
}

