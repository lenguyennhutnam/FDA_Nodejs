import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('data')
@Roles(UserRole.ADMIN)
export class DataController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('stats')
  stats() {
    return this.notificationsService.getStats();
  }

  @Post('clear')
  clear(@Body() body: { range?: string }) {
    const range = String(body?.range ?? 'all').trim().toLowerCase();
    return this.notificationsService.clear(range);
  }
}
