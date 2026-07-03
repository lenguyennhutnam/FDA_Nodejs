import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { Target } from './entities/target.entity';

describe('TargetsService', () => {
  let service: TargetsService;
  let repo: jest.Mocked<Repository<Target>>;
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TargetsService,
        {
          provide: getRepositoryToken(Target),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<TargetsService>(TargetsService);
    repo = module.get(getRepositoryToken(Target));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns empty array when no targets', async () => {
      repo.find.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });
  });

  describe('create', () => {
    it('persists a target', async () => {
      const mockTarget = { id: 'uuid-1', name: 'Tô Lâm', position: 'TBT', bio: 'x' };
      queryBuilder.getOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockTarget as any);
      repo.save.mockResolvedValue(mockTarget as any);

      const t = await service.create({ name: 'Tô Lâm', position: 'TBT', bio: 'x' });
      expect(t.id).toBe('uuid-1');
      expect(t.name).toBe('Tô Lâm');
    });

    it('throws ConflictException on duplicate name', async () => {
      queryBuilder.getOne.mockResolvedValue({ id: 'uuid-1', name: 'Tô Lâm' });
      await expect(service.create({ name: 'Tô Lâm' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('returns the target by id', async () => {
      const mockTarget = { id: 'uuid-1', name: 'A' };
      repo.findOne.mockResolvedValue(mockTarget as any);
      expect((await service.findOne('uuid-1')).name).toBe('A');
    });

    it('throws NotFoundException for unknown id', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates provided fields', async () => {
      const mockTarget = { id: 'uuid-1', name: 'A', position: 'P' };
      repo.findOne.mockResolvedValue(mockTarget as any);
      repo.save.mockResolvedValue({ ...mockTarget, position: 'Q' } as any);

      const updated = await service.update('uuid-1', { position: 'Q' });
      expect(updated.position).toBe('Q');
    });
  });

  describe('remove', () => {
    it('deletes an existing target', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as any);
      const res = await service.remove('uuid-1');
      expect(res.deleted).toBe(true);
    });

    it('throws NotFoundException for unknown id', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as any);
      await expect(service.remove('nope')).rejects.toThrow(NotFoundException);
    });
  });
});
