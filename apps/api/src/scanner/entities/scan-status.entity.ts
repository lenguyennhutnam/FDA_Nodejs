import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('scan_status')
export class ScanStatus {
  @PrimaryColumn({ default: 1 })
  id: number = 1;

  @Column({ default: false })
  isScanning!: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  lastRun!: string | null;

  @Column({ default: 0 })
  lastAdded!: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  lastError!: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  currentTarget!: string | null;
}
