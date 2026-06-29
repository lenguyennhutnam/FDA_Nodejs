import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TelegramService } from './telegram.service';
import { SettingsController } from './settings.controller';
import { DataController } from './data.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SettingsController, DataController],
  providers: [SettingsService, TelegramService],
  exports: [SettingsService, TelegramService],
})
export class SettingsModule {}
