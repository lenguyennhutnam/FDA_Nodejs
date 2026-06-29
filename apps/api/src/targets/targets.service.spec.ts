import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TargetsService } from './targets.service';

describe('TargetsService', () => {
  let service: TargetsService;
  let tmpFile: string;

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'targets-test-'));
    tmpFile = path.join(dir, 'targets.json');
    process.env.TARGETS_FILE = tmpFile;
    service = new TargetsService();
  });

  afterEach(async () => {
    delete process.env.TARGETS_FILE;
    await fs.rm(path.dirname(tmpFile), { recursive: true, force: true });
  });

  describe('findAll', () => {
    it('returns empty array when file does not exist yet', async () => {
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('create', () => {
    it('persists a target with generated id and timestamps', async () => {
      const t = await service.create({ name: 'Tô Lâm', position: 'TBT', bio: 'x' });
      expect(t.id).toBeTruthy();
      expect(t.name).toBe('Tô Lâm');
      expect(t.position).toBe('TBT');
      expect(t.createdAt).toBeTruthy();

      const all = await service.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(t.id);
    });

    it('trims fields and defaults optional ones to empty string', async () => {
      const t = await service.create({ name: '  A  ' });
      expect(t.name).toBe('A');
      expect(t.position).toBe('');
      expect(t.bio).toBe('');
    });

    it('throws ConflictException on duplicate name (case-insensitive)', async () => {
      await service.create({ name: 'Tô Lâm' });
      await expect(service.create({ name: 'tô lâm' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns the target by id', async () => {
      const t = await service.create({ name: 'A' });
      expect((await service.findOne(t.id)).name).toBe('A');
    });

    it('throws NotFoundException for unknown id', async () => {
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates provided fields and bumps updatedAt', async () => {
      const t = await service.create({ name: 'A', position: 'P' });
      const updated = await service.update(t.id, { position: 'Q' });
      expect(updated.position).toBe('Q');
      expect(updated.name).toBe('A');
    });

    it('throws NotFoundException for unknown id', async () => {
      await expect(service.update('nope', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when renaming to an existing name', async () => {
      await service.create({ name: 'A' });
      const b = await service.create({ name: 'B' });
      await expect(service.update(b.id, { name: 'A' })).rejects.toThrow(ConflictException);
    });

    it('allows keeping the same name on update', async () => {
      const a = await service.create({ name: 'A' });
      const updated = await service.update(a.id, { name: 'A', bio: 'new bio' });
      expect(updated.bio).toBe('new bio');
    });
  });

  describe('remove', () => {
    it('deletes an existing target', async () => {
      const t = await service.create({ name: 'A' });
      await service.remove(t.id);
      expect(await service.findAll()).toHaveLength(0);
    });

    it('throws NotFoundException for unknown id', async () => {
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
