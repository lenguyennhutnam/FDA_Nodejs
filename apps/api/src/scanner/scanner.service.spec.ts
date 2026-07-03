import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { TargetsService } from '../targets/targets.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { DEFAULT_SETTINGS } from '../settings/interfaces/settings.interface';
import { NotificationRecord } from '../notifications/interfaces/notification.interface';
import { TelegramService } from '../settings/telegram.service';
import { ScanStatus } from './entities/scan-status.entity';

describe('ScannerService', () => {
  let service: ScannerService;
  let targets: { findAll: jest.Mock };
  let notifications: { addRecords: jest.Mock; addRecordsAndGetAdded: jest.Mock };
  let settings: { get: jest.Mock; update: jest.Mock };
  let telegram: { sendMessage: jest.Mock };
  let scanStatusRepo: jest.Mocked<Repository<ScanStatus>>;
  let captured: NotificationRecord[];

  beforeEach(async () => {
    captured = [];
    targets = {
      findAll: jest.fn().mockResolvedValue([{ name: 'A', position: 'P', bio: '' }]),
    };
    notifications = {
      addRecords: jest.fn(async (recs: NotificationRecord[]) => {
        captured = recs;
        return recs.length;
      }),
      addRecordsAndGetAdded: jest.fn(async (recs: NotificationRecord[]) => {
        captured = recs;
        return recs;
      }),
    };
    settings = {
      get: jest.fn().mockResolvedValue({ ...DEFAULT_SETTINGS }),
      update: jest.fn().mockResolvedValue(undefined),
    };
    telegram = {
      sendMessage: jest.fn().mockResolvedValue(true),
    };

    const mockScanStatus = {
      id: 1,
      isScanning: false,
      lastRun: null,
      lastAdded: 0,
      lastError: null,
      currentTarget: null,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerService,
        {
          provide: getRepositoryToken(ScanStatus),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockScanStatus),
            create: jest.fn().mockReturnValue(mockScanStatus),
            save: jest.fn().mockResolvedValue(mockScanStatus),
            update: jest.fn(),
          },
        },
        {
          provide: TargetsService,
          useValue: targets,
        },
        {
          provide: NotificationsService,
          useValue: notifications,
        },
        {
          provide: SettingsService,
          useValue: settings,
        },
        {
          provide: TelegramService,
          useValue: telegram,
        },
      ],
    }).compile();

    service = module.get<ScannerService>(ScannerService);
    scanStatusRepo = module.get(getRepositoryToken(ScanStatus));
  });

  function mockFeed(items: any[]) {
    (service as any).parser.parseURL = jest.fn().mockResolvedValue({ items });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('classifies role-change vs activity by keyword and extracts press', async () => {
    mockFeed([
      { title: 'Ông A được bổ nhiệm giữ chức Bộ trưởng - Báo X', link: 'http://x/1' },
      { title: 'Ông A dự hội nghị xúc tiến - Báo Y', link: 'http://y/2' },
    ]);

    const res = await service.run();
    expect(res).toEqual({ added: 2, scanned: 1 });
    expect(captured[0].news_kind).toBe('biendong');
    expect(captured[0].press_name).toBe('Báo X');
    expect(captured[1].news_kind).toBe('hoatdong');
    expect(captured[1].press_name).toBe('Báo Y');
    expect(captured[0].ai_result?.Source).toBe('keyword_scan');
  });

  it('respects max_results_per_target from settings', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, max_results_per_target: 1 });
    mockFeed([
      { title: 'A một - Báo X', link: 'http://x/1' },
      { title: 'A hai - Báo Y', link: 'http://y/2' },
    ]);
    const res = await service.run();
    expect(res.added).toBe(1);
  });

  it('builds exact-mode query with quotes', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, search_match_mode: 'exact' });
    const spy = jest.fn().mockResolvedValue({ items: [] });
    (service as any).parser.parseURL = spy;
    await service.run();
    const calledUrl = spy.mock.calls[0][0] as string;
    expect(decodeURIComponent(calledUrl)).toContain('"A" "P"');
  });

  it('appends when:Nd recency filter from settings', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, scan_lookback_days: 7 });
    const spy = jest.fn().mockResolvedValue({ items: [] });
    (service as any).parser.parseURL = spy;
    await service.run();
    expect(decodeURIComponent(spy.mock.calls[0][0] as string)).toContain('when:7d');
  });

  it('stores pubDate in timestamp for display, scan_time for window filtering', async () => {
    mockFeed([{ title: 'Bài cũ - Báo X', link: 'http://x/1', pubDate: 'Mon, 01 Jan 2024 00:00:00 GMT' }]);
    const before = Date.now();
    await service.run();
    expect(captured[0].timestamp).toBe(new Date('Mon, 01 Jan 2024 00:00:00 GMT').toISOString());
    const scanTs = Date.parse(captured[0].scan_time!);
    expect(scanTs).toBeGreaterThanOrEqual(before - 1000);
  });

  it('falls back to now in timestamp when pubDate is missing/invalid', async () => {
    mockFeed([{ title: 'No date - Báo X', link: 'http://x/1' }]);
    const before = Date.now();
    await service.run();
    const ts = Date.parse(captured[0].timestamp);
    expect(ts).toBeGreaterThanOrEqual(before - 1000);
  });

  it('drops articles whose title lacks the target name when required', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, require_name_in_title: true });
    mockFeed([
      { title: 'Thủ tướng Phạm Minh Chính dự hội nghị - Báo X', link: 'http://x/1' },
      { title: 'Trung ương đồng ý để 4 cán bộ thôi tham gia - Báo Y', link: 'http://y/2' },
    ]);
    targets.findAll.mockResolvedValue([{ name: 'Phạm Minh Chính', position: '', bio: '' }]);
    const res = await service.run();
    expect(res.added).toBe(1);
    expect(captured[0].title).toContain('Phạm Minh Chính');
  });

  it('keeps body-only matches when require_name_in_title is off', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, require_name_in_title: false });
    mockFeed([
      { title: 'Thủ tướng Phạm Minh Chính dự hội nghị - Báo X', link: 'http://x/1' },
      { title: 'Trung ương đồng ý để 4 cán bộ thôi tham gia - Báo Y', link: 'http://y/2' },
    ]);
    targets.findAll.mockResolvedValue([{ name: 'Phạm Minh Chính', position: '', bio: '' }]);
    const res = await service.run();
    expect(res.added).toBe(2);
  });

  it('skips items without a valid http link', async () => {
    mockFeed([
      { title: 'No link A', link: '' },
      { title: 'Bản tin A hợp lệ - Báo Z', link: 'http://z/1' },
    ]);
    const res = await service.run();
    expect(res.added).toBe(1);
  });

  it('getStatus reflects auto_scan_enabled from settings', async () => {
    settings.get.mockResolvedValue({ ...DEFAULT_SETTINGS, auto_scan_enabled: true });
    expect((await service.getStatus()).autoScanEnabled).toBe(true);
  });

  it('setAutoScan persists to settings', async () => {
    await service.setAutoScan(true);
    expect(settings.update).toHaveBeenCalledWith({ auto_scan_enabled: true });
  });

  it('autoScanTick does nothing when disabled', async () => {
    const spy = jest.spyOn(service, 'run');
    await service.autoScanTick();
    expect(spy).not.toHaveBeenCalled();
  });
});
