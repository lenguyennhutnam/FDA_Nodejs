import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly settingsService: SettingsService) {}

  async sendMessage(token: string, chatId: string, text: string): Promise<boolean> {
    if (!token || !chatId) {
      throw new BadRequestException('Thiếu bot token hoặc chat ID');
    }
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
    } catch (e: any) {
      throw new BadRequestException(`Không gọi được Telegram: ${e.message}`);
    }
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new BadRequestException(data.description || `Telegram trả lỗi HTTP ${res.status}`);
    }
    return true;
  }

  async sendTest(botToken?: string, chatId?: string): Promise<boolean> {
    const s = await this.settingsService.get();
    const token = (botToken || '').trim() || s.telegram.bot_token;
    const chat = (chatId || '').trim() || s.telegram.chat_id;
    return this.sendMessage(
      token,
      chat,
      '✅ <b>FDA</b> — tin nhắn thử. Cấu hình Telegram hoạt động.',
    );
  }
}
