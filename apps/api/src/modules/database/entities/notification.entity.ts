import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('notifications')
@Index(['url', 'target_name'], { unique: true })
export class Notification {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  timestamp!: string;

  @Column({ type: 'varchar', nullable: true })
  scan_time!: string;

  @Column()
  target_name!: string;

  @Column({ default: '' })
  target_position!: string;

  @Column({ default: '' })
  target_bio!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column()
  url!: string;

  @Column({ default: '' })
  resolved_url!: string;

  @Column({ default: '' })
  published!: string;

  @Column()
  news_kind!: string; // 'hoatdong' or 'biendong'

  @Column({ default: '' })
  press_name!: string;

  @Column({ default: '' })
  press_domain!: string;

  // Stored as JSON string
  @Column({ type: 'text', nullable: true })
  ai_result!: string | null;

  @Column({ type: 'varchar', nullable: true })
  user_label!: string | null; // 'relevant' or 'irrelevant'
}
