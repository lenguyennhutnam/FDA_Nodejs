import { Module } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScannerController } from './scanner.controller';
import { TargetsModule } from '../targets/targets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TargetsModule, NotificationsModule, SettingsModule],
  controllers: [ScannerController],
  providers: [ScannerService],
})
export class ScannerModule {}
