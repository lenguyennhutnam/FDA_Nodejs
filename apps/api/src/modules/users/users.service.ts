import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { UserDBService } from '../database/services/userDBService';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userDBService: UserDBService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 12);
    const saved = await this.userDBService.insertItem({ ...dto, password: hashed });
    const { password, refreshToken, ...rest } = saved;
    return rest as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userDBService.findByEmail(email);
  }

  async findById(id: string | number): Promise<User | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(numericId)) return null;
    return this.userDBService.getItemById(numericId);
  }

  async updateRefreshToken(id: string | number, token: string | null): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const hashed = token ? await bcrypt.hash(token, 12) : null;
    await this.userDBService.updateItem(numericId, { refreshToken: hashed });
  }

  async findAll(): Promise<User[]> {
    // Vfan style might use getItems, but we can do a direct select search here
    const result = await this.userDBService.getItems({
      skip: 0,
      limit: 100000,
    });
    return result.items.map(({ password, refreshToken, ...rest }) => rest as User);
  }

  async update(id: string | number, dto: UpdateUserDto): Promise<User> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const user = await this.userDBService.getItemById(numericId);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.role !== undefined) user.role = dto.role as any;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 12);

    const saved = await this.userDBService.updateItem(numericId, user);
    const { password, refreshToken, ...rest } = saved;
    return rest as User;
  }

  async changePassword(id: string | number, dto: ChangePasswordDto): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(numericId)) throw new BadRequestException('Mã người dùng không hợp lệ');

    const user = await this.userDBService.getItemById(numericId);
    if (!user) throw new NotFoundException(`Không tìm thấy người dùng`);

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new BadRequestException('Mật khẩu hiện tại không chính xác');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.userDBService.updateItem(numericId, user);
  }

  async remove(id: string | number): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const success = await this.userDBService.removeItem(numericId);
    if (!success) throw new NotFoundException(`User ${id} not found`);
  }
}
