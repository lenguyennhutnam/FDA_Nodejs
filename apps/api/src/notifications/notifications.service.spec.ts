import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import { TargetsService } from '../targets/targets.service';
import { Notification } from './entities/notification.entity';
import { NotificationRecord } from './interfaces/notification.interface';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function rec(over: Partial<NotificationRecord>): NotificationRecord {
  return {
    timestamp: hoursAgo(1),
    target_name: 'A',
    title: 't',
    url: 'http://x/' + Math.random(),
    news_kind: 'hoatdong',
    ...over,
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<Repository<Notification>>;
  let targets: { findAll: jest.Mock };
  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    };

    targets = { findAll: jest.fn().mockResolvedValue([{ name: 'A' }, { name: 'B' }]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            clear: jest.fn(),
            create: jest.fn((r) => r),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
        {
          provide: TargetsService,
          useValue: targets,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRecent', () => {
    it('returns recent records', async () => {
      const mockNotifs = [
        { title: 'new', timestamp: hoursAgo(1), url: 'u2', news_kind: 'biendong' },
        { title: 'old', timestamp: hoursAgo(10), url: 'u1', news_kind: 'hoatdong' },
      ];
      repo.find.mockResolvedValue(mockNotifs as any);
      const recent = await service.getRecent();
      expect(recent[0].title).toBe('new');
      expect(recent[1].title).toBe('old');
    });
  });

  describe('summarize', () => {
    it('builds a card per target with status', async () => {
      const mockNotifs = [
        { target_name: 'A', timestamp: hoursAgo(2), news_kind: 'hoatdong', user_label: null },
      ];
      queryBuilder.getMany.mockResolvedValue(mockNotifs as any);
      const cards = await service.summarize(24);
      expect(cards).toHaveLength(2);
      const a = cards.find((c) => c.target_name === 'A')!;
      expect(a.status).toBe('stable_activity');
      expect(a.activity_count).toBe(1);
    });
  });
});
