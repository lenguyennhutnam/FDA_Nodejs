import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Target } from '../entities/target.entity';
import { BaseDBService } from './base';

@Injectable()
export class TargetDBService extends BaseDBService<Target> {
  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
  ) {
    super(targetRepository);
  }

  async findByName(name: string): Promise<Target | null> {
    return this.targetRepository.findOne({ where: { name } });
  }

  async findByNameIgnoreCase(name: string): Promise<Target | null> {
    return this.targetRepository
      .createQueryBuilder('target')
      .where('LOWER(target.name) = LOWER(:name)', { name: name.trim() })
      .getOne();
  }

  async findByNameIgnoreCaseExcludeId(name: string, excludeId: string): Promise<Target | null> {
    return this.targetRepository
      .createQueryBuilder('target')
      .where('LOWER(target.name) = LOWER(:name) AND target.id != :excludeId', {
        name: name.trim(),
        excludeId,
      })
      .getOne();
  }
}
