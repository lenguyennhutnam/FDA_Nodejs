import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const hashed = await bcrypt.hash(dto.password, 12);
    return this.userModel.create({ ...dto, password: hashed });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    const hashed = token ? await bcrypt.hash(token, 12) : null;
    await this.userModel.findByIdAndUpdate(id, { refreshToken: hashed });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password -refreshToken').exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    const update: Partial<User> = {};
    if (dto.role) update.role = dto.role;
    if (dto.password) update.password = await bcrypt.hash(dto.password, 12);
    return this.userModel.findByIdAndUpdate(id, update, { new: true }).select('-password -refreshToken').exec();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }
}
