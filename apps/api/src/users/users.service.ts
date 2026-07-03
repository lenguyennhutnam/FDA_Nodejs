import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({ ...dto, password: hashed });
    const saved = await this.userRepository.save(user);
    const { password, refreshToken, ...rest } = saved;
    return rest as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string | number): Promise<User | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (Number.isNaN(numericId)) return null;
    return this.userRepository.findOne({ where: { id: numericId } });
  }

  async updateRefreshToken(id: string | number, token: string | null): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const hashed = token ? await bcrypt.hash(token, 12) : null;
    await this.userRepository.update(numericId, { refreshToken: hashed });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: { id: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: string | number, dto: UpdateUserDto): Promise<User> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const user = await this.userRepository.findOne({ where: { id: numericId } });
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (dto.role !== undefined) user.role = dto.role as any;
    if (dto.password) user.password = await bcrypt.hash(dto.password, 12);

    const saved = await this.userRepository.save(user);
    const { password, refreshToken, ...rest } = saved;
    return rest as User;
  }

  async remove(id: string | number): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const result = await this.userRepository.delete(numericId);
    if (result.affected === 0) throw new NotFoundException(`User ${id} not found`);
  }
}
