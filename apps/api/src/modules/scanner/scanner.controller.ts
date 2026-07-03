import { Controller, Get, Post, Body } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@Controller('monitor')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get('status')
  async status() {
    return { status: await this.scannerService.getStatus() };
  }

  @Post('run')
  @Roles(UserRole.ADMIN)
  async run(@Body() body: { target_name?: string }) {
    const result = await this.scannerService.run(body?.target_name?.trim() || undefined);
    return { success: true, ...result, status: await this.scannerService.getStatus() };
  }

  @Post('cancel')
  @Roles(UserRole.ADMIN)
  cancel() {
    const cancelled = this.scannerService.requestCancel();
    return { success: cancelled };
  }

  @Post('auto')
  @Roles(UserRole.ADMIN)
  async auto(@Body() body: { enabled: boolean }) {
    return { success: true, status: await this.scannerService.setAutoScan(!!body?.enabled) };
  }
}
