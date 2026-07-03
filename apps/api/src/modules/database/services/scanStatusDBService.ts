import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanStatus } from '../entities/scan-status.entity';
import { BaseDBService } from './base';

@Injectable()
export class ScanStatusDBService extends BaseDBService<ScanStatus> {
  constructor(
    @InjectRepository(ScanStatus)
    private readonly scanStatusRepository: Repository<ScanStatus>,
  ) {
    super(scanStatusRepository);
  }

  async getStatus(): Promise<ScanStatus> {
    let status = await this.scanStatusRepository.findOne({ where: { id: 1 } });
    if (!status) {
      status = this.scanStatusRepository.create({ id: 1, isScanning: false, lastAdded: 0 });
      status = await this.scanStatusRepository.save(status);
    }
    return status;
  }
}
