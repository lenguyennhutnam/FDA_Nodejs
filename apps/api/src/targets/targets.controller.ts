import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  // GET không gắn @Roles → mọi user đã đăng nhập đều xem được (cả viewer)
  @Get()
  findAll() {
    return this.targetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.targetsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateTargetDto) {
    return this.targetsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateTargetDto) {
    return this.targetsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.targetsService.remove(id);
  }
}
