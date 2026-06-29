import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { LabelDto } from './dto/label.dto';

function parseHours(raw?: string): number {
  const h = Number(String(raw ?? '24').replace(',', '.'));
  return Number.isFinite(h) && h > 0 ? h : 24;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Tin mới nhất (gộp 2 kênh)
  @Get()
  getRecent(@Query('limit') limit?: string) {
    const n = Number(limit);
    return this.notificationsService.getRecent(Number.isFinite(n) && n > 0 ? n : 20);
  }

  // Thẻ tóm tắt từng mục tiêu
  @Get('summary')
  summary(@Query('hours') hours?: string) {
    return this.notificationsService.summarize(parseHours(hours));
  }

  // Chi tiết 1 mục tiêu
  @Get('detail')
  detail(@Query('name') name: string, @Query('hours') hours?: string) {
    return this.notificationsService.getDetail((name ?? '').trim(), parseHours(hours));
  }

  // Gán/xóa nhãn — mọi user đăng nhập (không gắn @Roles)
  @Post('label')
  label(@Body() dto: LabelDto) {
    return this.notificationsService.label(dto.urls, dto.label ?? '');
  }
}
