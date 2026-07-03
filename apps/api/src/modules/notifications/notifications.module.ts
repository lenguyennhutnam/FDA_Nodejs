import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TargetsModule } from '../targets/targets.module';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule, TargetsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
