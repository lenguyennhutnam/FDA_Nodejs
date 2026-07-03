import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Target } from './entities/target.entity';
import { Notification } from './entities/notification.entity';
import { ScanStatus } from './entities/scan-status.entity';
import { Settings } from './entities/settings.entity';

import { UserDBService } from './services/userDBService';
import { TargetDBService } from './services/targetDBService';
import { NotificationDBService } from './services/notificationDBService';
import { ScanStatusDBService } from './services/scanStatusDBService';
import { SettingsDBService } from './services/settingsDBService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Target,
      Notification,
      ScanStatus,
      Settings,
    ]),
  ],
  providers: [
    UserDBService,
    TargetDBService,
    NotificationDBService,
    ScanStatusDBService,
    SettingsDBService,
  ],
  exports: [
    TypeOrmModule,
    UserDBService,
    TargetDBService,
    NotificationDBService,
    ScanStatusDBService,
    SettingsDBService,
  ],
})
export class DatabaseModule {}
