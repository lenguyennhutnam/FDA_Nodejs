import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TargetsService } from '../modules/targets/targets.service';
import { NotificationsService } from '../modules/notifications/notifications.service';
import {
  NotificationRecord,
} from '../modules/notifications/interfaces/notification.interface';

/** Dev seed: tạo vài mục tiêu demo + tin mẫu để xem dashboard/chi tiết. */

const DEMO_TARGETS = [
  { name: 'Tô Lâm', position: 'Tổng bí thư, Chủ tịch nước', bio: 'Lãnh đạo cấp cao.' },
  { name: 'Phạm Minh Chính', position: 'Thủ tướng Chính phủ', bio: '' },
  { name: 'Phan Văn Giang', position: 'Bộ trưởng Bộ Quốc phòng', bio: '' },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600 * 1000).toISOString();
}

function activity(
  name: string,
  title: string,
  hAgo: number,
  press: string,
  summary: string,
): NotificationRecord {
  return {
    timestamp: hoursAgo(hAgo),
    target_name: name,
    title,
    description: summary,
    url: `https://news.google.com/demo/${encodeURIComponent(title)}`,
    resolved_url: `https://${press}/bai-viet-demo`,
    published: hoursAgo(hAgo),
    news_kind: 'hoatdong',
    press_name: press,
    press_domain: press,
    ai_result: {
      Matched_Target: true,
      Is_Activity: true,
      Is_Change: false,
      Summary: summary,
      Confidence: 80,
      Activity_Bullets: [summary],
    },
  };
}

function roleChange(
  name: string,
  title: string,
  hAgo: number,
  press: string,
  from: string,
  to: string,
): NotificationRecord {
  return {
    timestamp: hoursAgo(hAgo),
    target_name: name,
    title,
    url: `https://news.google.com/demo/${encodeURIComponent(title)}`,
    resolved_url: `https://${press}/bo-nhiem-demo`,
    published: hoursAgo(hAgo),
    news_kind: 'biendong',
    press_name: press,
    press_domain: press,
    ai_result: {
      Matched_Target: true,
      Is_Change: true,
      Summary: title,
      Confidence: 90,
      From_Position: from,
      To_Position: to,
      Position_Full_Official: to,
      Change_Date: hoursAgo(hAgo).slice(0, 10),
    },
  };
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const targets = app.get(TargetsService);
  const notifications = app.get(NotificationsService);

  for (const t of DEMO_TARGETS) {
    try {
      await targets.create(t);
      console.log(`Target created: ${t.name}`);
    } catch {
      console.log(`Target exists, skip: ${t.name}`);
    }
  }

  const records: NotificationRecord[] = [
    activity('Tô Lâm', 'Tổng Bí thư Tô Lâm chủ trì họp Bộ Chính trị', 2, 'vnexpress.net', 'Chủ trì cuộc họp về phát triển kinh tế - xã hội.'),
    activity('Tô Lâm', 'Tổng Bí thư tiếp đoàn đại biểu quốc tế', 8, 'tuoitre.vn', 'Tiếp đoàn đại biểu cấp cao.'),
    activity('Tô Lâm', 'Bài viết của Tổng Bí thư về báo chí cách mạng', 20, 'qdnd.vn', 'Bài viết nhân ngày Báo chí cách mạng Việt Nam.'),
    activity('Phạm Minh Chính', 'Thủ tướng kiểm tra dự án cao tốc Bắc - Nam', 3, 'vnexpress.net', 'Kiểm tra tiến độ thi công cao tốc.'),
    activity('Phạm Minh Chính', 'Thủ tướng dự hội nghị xúc tiến đầu tư', 12, 'thanhnien.vn', 'Phát biểu tại hội nghị xúc tiến đầu tư.'),
    activity('Phan Văn Giang', 'Bộ trưởng Quốc phòng thăm đơn vị biên phòng', 30, 'qdnd.vn', 'Thăm và làm việc với lực lượng biên phòng.'),
    roleChange('Phạm Minh Chính', 'Kiện toàn nhân sự Chính phủ nhiệm kỳ mới', 5, 'vnexpress.net', 'Phó Thủ tướng', 'Thủ tướng Chính phủ'),
  ];

  await notifications.addRecords(records);
  console.log(
    `Notifications seeded: ${records.length} bản ghi`,
  );

  await app.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
