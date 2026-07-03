import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Target } from './entities/target.entity';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

@Injectable()
export class TargetsService {
  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: Repository<Target>,
  ) {}

  async findAll(): Promise<Target[]> {
    return this.targetRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Target> {
    const found = await this.targetRepository.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Target not found');
    return found;
  }

  async create(dto: CreateTargetDto): Promise<Target> {
    const name = dto.name.trim();
    const existing = await this.targetRepository
      .createQueryBuilder('target')
      .where('LOWER(target.name) = LOWER(:name)', { name })
      .getOne();

    if (existing) {
      throw new ConflictException('Target with this name already exists');
    }

    const target = this.targetRepository.create({
      id: randomUUID(),
      name,
      position: (dto.position ?? '').trim(),
      bio: (dto.bio ?? '').trim(),
    });

    return this.targetRepository.save(target);
  }

  async update(id: string, dto: UpdateTargetDto): Promise<Target> {
    const target = await this.targetRepository.findOne({ where: { id } });
    if (!target) throw new NotFoundException('Target not found');

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const existing = await this.targetRepository
        .createQueryBuilder('target')
        .where('LOWER(target.name) = LOWER(:name) AND target.id != :id', { name, id })
        .getOne();
      if (existing) {
        throw new ConflictException('Target with this name already exists');
      }
      target.name = name;
    }
    if (dto.position !== undefined) target.position = dto.position.trim();
    if (dto.bio !== undefined) target.bio = dto.bio.trim();

    return this.targetRepository.save(target);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.targetRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Target not found');
    return { deleted: true };
  }
}
