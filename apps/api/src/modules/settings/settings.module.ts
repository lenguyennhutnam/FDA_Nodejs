import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsService } from './settings.service';
import { TelegramService } from './telegram.service';
import { SettingsController } from './settings.controller';
import { DataController } from './data.controller';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [SettingsController, DataController],
  providers: [SettingsService, TelegramService],
  exports: [SettingsService, TelegramService],
})
export class SettingsModule {}
