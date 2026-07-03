import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryColumn({ default: 1 })
  id: number = 1;

  @Column({ default: 'exact_name' })
  search_match_mode!: string;

  @Column({ default: 20 })
  max_results_per_target!: number;

  @Column({ default: 30 })
  scan_lookback_days!: number;

  @Column({ default: true })
  require_name_in_title!: boolean;

  @Column({ default: false })
  auto_scan_enabled!: boolean;

  @Column({ default: 30 })
  scan_interval_minutes!: number;

  @Column({ default: 30 })
  ui_refresh_seconds!: number;

  @Column({ default: false })
  filter_chinh_thong_only!: boolean;

  // Telegram fields flattened
  @Column({ default: false })
  telegram_enabled!: boolean;

  @Column({ default: false })
  telegram_notify_role_change_only!: boolean;

  @Column({ default: false })
  telegram_notify_on_empty!: boolean;

  @Column({ default: '' })
  telegram_bot_token!: string;

  @Column({ default: '' })
  telegram_chat_id!: string;

  // Stored as JSON string of PressSource[]
  @Column({ type: 'text', default: '[]' })
  press_sources!: string;
}
