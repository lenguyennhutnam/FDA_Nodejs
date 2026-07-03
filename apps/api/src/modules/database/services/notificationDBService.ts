import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { BaseDBService } from './base';

@Injectable()
export class NotificationDBService extends BaseDBService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository);
  }

  async findByUrlAndTarget(url: string, targetName: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({ where: { url, target_name: targetName } });
  }
}
