import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { TargetsModule } from '../targets/targets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { ScanStatus } from './entities/scan-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanStatus]),
    TargetsModule,
    NotificationsModule,
    SettingsModule,
  ],
  controllers: [ScannerController],
  providers: [ScannerService],
})
export class ScannerModule {}
