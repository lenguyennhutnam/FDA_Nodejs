import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Target } from './interfaces/target.interface';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

/**
 * Quản lý mục tiêu bảo vệ. Lưu tạm bằng file JSON.
 * Method signatures giữ ổn định để sau thay ruột bằng Mongoose mà không đổi controller.
 */
@Injectable()
export class TargetsService {
  /** Đường dẫn file JSON; cho phép override qua TARGETS_FILE (dùng cho test). */
  private get filePath(): string {
    return process.env.TARGETS_FILE || path.join(process.cwd(), 'data', 'targets.json');
  }

  private async readAll(): Promise<Target[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e: any) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }

  private async writeAll(targets: Target[]): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(targets, null, 2), 'utf-8');
  }

  async findAll(): Promise<Target[]> {
    return this.readAll();
  }

  async findOne(id: string): Promise<Target> {
    const targets = await this.readAll();
    const found = targets.find((t) => t.id === id);
    if (!found) throw new NotFoundException('Target not found');
    return found;
  }

  async create(dto: CreateTargetDto): Promise<Target> {
    const targets = await this.readAll();
    const name = dto.name.trim();
    if (targets.some((t) => t.name.trim().toLowerCase() === name.toLowerCase())) {
      throw new ConflictException('Target with this name already exists');
    }
    const now = new Date().toISOString();
    const target: Target = {
      id: randomUUID(),
      name,
      position: (dto.position ?? '').trim(),
      bio: (dto.bio ?? '').trim(),
      createdAt: now,
      updatedAt: now,
    };
    targets.push(target);
    await this.writeAll(targets);
    return target;
  }

  async update(id: string, dto: UpdateTargetDto): Promise<Target> {
    const targets = await this.readAll();
    const idx = targets.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException('Target not found');

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const dup = targets.some(
        (t, i) => i !== idx && t.name.trim().toLowerCase() === name.toLowerCase(),
      );
      if (dup) throw new ConflictException('Target with this name already exists');
      targets[idx].name = name;
    }
    if (dto.position !== undefined) targets[idx].position = dto.position.trim();
    if (dto.bio !== undefined) targets[idx].bio = dto.bio.trim();
    targets[idx].updatedAt = new Date().toISOString();

    await this.writeAll(targets);
    return targets[idx];
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const targets = await this.readAll();
    const idx = targets.findIndex((t) => t.id === id);
    if (idx === -1) throw new NotFoundException('Target not found');
    targets.splice(idx, 1);
    await this.writeAll(targets);
    return { deleted: true };
  }
}
