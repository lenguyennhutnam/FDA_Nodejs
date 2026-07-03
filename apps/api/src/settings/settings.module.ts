import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { TelegramService } from './telegram.service';
import { SettingsController } from './settings.controller';
import { DataController } from './data.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { Settings } from './entities/settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settings]), NotificationsModule],
  controllers: [SettingsController, DataController],
  providers: [SettingsService, TelegramService],
  exports: [SettingsService, TelegramService],
})
export class SettingsModule {}
