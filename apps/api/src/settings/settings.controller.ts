import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { TelegramService } from './telegram.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly telegramService: TelegramService,
  ) {}

  @Get()
  get() {
    return this.settingsService.getPublic();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  update(@Body() body: Record<string, any>) {
    return this.settingsService.update(body ?? {});
  }

  @Post('telegram-test')
  @Roles(UserRole.ADMIN)
  async telegramTest(@Body() body: { bot_token?: string; chat_id?: string }) {
    await this.telegramService.sendTest(body?.bot_token, body?.chat_id);
    return { success: true, message: 'Đã gửi tin nhắn thử' };
  }
}
