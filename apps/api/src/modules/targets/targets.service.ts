import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Target } from '../database/entities/target.entity';
import { TargetDBService } from '../database/services/targetDBService';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

@Injectable()
export class TargetsService {
  constructor(
    private readonly targetDBService: TargetDBService,
  ) {}

  async findAll(): Promise<Target[]> {
    const res = await this.targetDBService.getItems({
      skip: 0,
      limit: 100000,
      sort: { name: 'ASC' },
    });
    return res.items;
  }

  async findOne(id: string): Promise<Target> {
    const found = await this.targetDBService.getItemById(id);
    if (!found) throw new NotFoundException('Target not found');
    return found;
  }

  async create(dto: CreateTargetDto): Promise<Target> {
    const name = dto.name.trim();
    const existing = await this.targetDBService.findByNameIgnoreCase(name);
    if (existing) {
      throw new ConflictException('Target with this name already exists');
    }

    const target = await this.targetDBService.insertItem({
      id: randomUUID(),
      name,
      position: (dto.position ?? '').trim(),
      bio: (dto.bio ?? '').trim(),
    });

    return target;
  }

  async update(id: string, dto: UpdateTargetDto): Promise<Target> {
    const target = await this.targetDBService.getItemById(id);
    if (!target) throw new NotFoundException('Target not found');

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.targetDBService.findByNameIgnoreCaseExcludeId(name, id);
      if (existing) {
        throw new ConflictException('Target with this name already exists');
      }
      target.name = name;
    }
    if (dto.position !== undefined) target.position = dto.position.trim();
    if (dto.bio !== undefined) target.bio = dto.bio.trim();

    return this.targetDBService.updateItem(id, target);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const success = await this.targetDBService.removeItem(id);
    if (!success) throw new NotFoundException('Target not found');
    return { deleted: true };
  }
}
