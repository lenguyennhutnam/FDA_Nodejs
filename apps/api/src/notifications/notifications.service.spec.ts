import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { NotificationsService } from './notifications.service';
import { TargetsService } from '../targets/targets.service';
import { NotificationRecord, NotificationsStore } from './interfaces/notification.interface';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function rec(over: Partial<NotificationRecord>): NotificationRecord {
  return {
    timestamp: hoursAgo(1),
    target_name: 'A',
    title: 't',
    url: 'http://x/' + Math.random(),
    ...over,
  };
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let tmpFile: string;
  let targets: { findAll: jest.Mock };

  async function writeStore(store: NotificationsStore) {
    await fs.writeFile(tmpFile, JSON.stringify(store), 'utf-8');
  }

  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'notifs-test-'));
    tmpFile = path.join(dir, 'notifications.json');
    process.env.NOTIFICATIONS_FILE = tmpFile;
    targets = { findAll: jest.fn().mockResolvedValue([{ name: 'A' }, { name: 'B' }]) };
    service = new NotificationsService(targets as unknown as TargetsService);
  });

  afterEach(async () => {
    delete process.env.NOTIFICATIONS_FILE;
    await fs.rm(path.dirname(tmpFile), { recursive: true, force: true });
  });

  describe('loadAll', () => {
    it('returns empty channels when file missing', async () => {
      expect(await service.loadAll()).toEqual({ channel_hoatdong: [], channel_biendong: [] });
    });
  });

  describe('getRecent', () => {
    it('merges channels and sorts by timestamp desc', async () => {
      await writeStore({
        channel_hoatdong: [rec({ title: 'old', timestamp: hoursAgo(10), url: 'u1' })],
        channel_biendong: [rec({ title: 'new', timestamp: hoursAgo(1), url: 'u2' })],
      });
      const recent = await service.getRecent();
      expect(recent[0].title).toBe('new');
      expect(recent[1].title).toBe('old');
      expect(recent[0]).toHaveProperty('article_url');
    });
  });

  describe('summarize', () => {
    it('builds a card per target with status', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', timestamp: hoursAgo(2) })],
        channel_biendong: [],
      });
      const cards = await service.summarize(24);
      expect(cards).toHaveLength(2);
      const a = cards.find((c) => c.target_name === 'A')!;
      expect(a.status).toBe('stable_activity');
      expect(a.activity_count).toBe(1);
      const b = cards.find((c) => c.target_name === 'B')!;
      expect(b.status).toBe('no_data');
    });

    it('marks change status when role-change rows exist', async () => {
      await writeStore({
        channel_hoatdong: [],
        channel_biendong: [rec({ target_name: 'A', timestamp: hoursAgo(2) })],
      });
      const a = (await service.summarize(24)).find((c) => c.target_name === 'A')!;
      expect(a.status).toBe('change');
      expect(a.change_count).toBe(1);
    });

    it('excludes rows outside the time window', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', timestamp: hoursAgo(48) })],
        channel_biendong: [],
      });
      const a = (await service.summarize(24)).find((c) => c.target_name === 'A')!;
      expect(a.activity_count).toBe(0);
      expect(a.status).toBe('no_data');
    });

    it('excludes irrelevant-labeled rows from activity count', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', user_label: 'irrelevant' })],
        channel_biendong: [],
      });
      const a = (await service.summarize(24)).find((c) => c.target_name === 'A')!;
      expect(a.activity_count).toBe(0);
    });
  });

  describe('getDetail', () => {
    it('splits relevant and irrelevant activity rows', async () => {
      await writeStore({
        channel_hoatdong: [
          rec({ target_name: 'A', url: 'rel', title: 'relevant' }),
          rec({ target_name: 'A', url: 'irr', title: 'irrelevant', user_label: 'irrelevant' }),
        ],
        channel_biendong: [],
      });
      const detail = await service.getDetail('A', 24);
      expect(detail.records_hoatdong).toHaveLength(1);
      expect(detail.records_hoatdong[0].title).toBe('relevant');
      expect(detail.records_hoatdong_irrelevant).toHaveLength(1);
    });
  });

  describe('addRecords (dedup)', () => {
    it('skips records with duplicate url for same target', async () => {
      await writeStore({ channel_hoatdong: [rec({ target_name: 'A', url: 'u1', title: 'Tin một' })], channel_biendong: [] });
      const n = await service.addRecords([rec({ target_name: 'A', url: 'u1', title: 'Tin một khác tiêu đề' })]);
      expect(n).toBe(0);
    });

    it('skips near-duplicate titles from different press for same target', async () => {
      await writeStore({ channel_hoatdong: [], channel_biendong: [] });
      const first = await service.addRecords([
        rec({ target_name: 'A', url: 'u1', title: 'Thủ tướng dự lễ công bố quy hoạch tỉnh Đắk Lắk - Báo X', news_kind: 'hoatdong' }),
      ]);
      const second = await service.addRecords([
        rec({ target_name: 'A', url: 'u2', title: 'Thủ tướng dự lễ công bố quy hoạch tỉnh Đắk Lắk - Báo Y', news_kind: 'hoatdong' }),
      ]);
      expect(first).toBe(1);
      expect(second).toBe(0);
    });

    it('keeps genuinely different titles', async () => {
      await writeStore({ channel_hoatdong: [], channel_biendong: [] });
      const n = await service.addRecords([
        rec({ target_name: 'A', url: 'u1', title: 'Thủ tướng họp Chính phủ thường kỳ tháng 6 - Báo X', news_kind: 'hoatdong' }),
        rec({ target_name: 'A', url: 'u2', title: 'Bộ Ngoại giao tổ chức hội thi tuyên truyền viên giỏi - Báo Y', news_kind: 'hoatdong' }),
      ]);
      expect(n).toBe(2);
    });

    it('does not dedup same title across different targets', async () => {
      await writeStore({ channel_hoatdong: [], channel_biendong: [] });
      const n = await service.addRecords([
        rec({ target_name: 'A', url: 'u1', title: 'Cùng một tiêu đề sự kiện chung - Báo X', news_kind: 'hoatdong' }),
        rec({ target_name: 'B', url: 'u2', title: 'Cùng một tiêu đề sự kiện chung - Báo X', news_kind: 'hoatdong' }),
      ]);
      expect(n).toBe(2);
    });
  });

  describe('label', () => {
    it('sets user_label on matching urls', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', url: 'match-me' })],
        channel_biendong: [],
      });
      const res = await service.label(['match-me'], 'irrelevant');
      expect(res.labeled).toBe(1);
      const store = await service.loadAll();
      expect(store.channel_hoatdong[0].user_label).toBe('irrelevant');
    });

    it('clears user_label when label is empty', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', url: 'match-me', user_label: 'irrelevant' })],
        channel_biendong: [],
      });
      await service.label(['match-me'], '');
      const store = await service.loadAll();
      expect(store.channel_hoatdong[0].user_label).toBeUndefined();
    });

    it('matches on resolved_url too', async () => {
      await writeStore({
        channel_hoatdong: [rec({ target_name: 'A', url: 'raw', resolved_url: 'final' })],
        channel_biendong: [],
      });
      const res = await service.label(['final'], 'irrelevant');
      expect(res.labeled).toBe(1);
    });
  });
});
