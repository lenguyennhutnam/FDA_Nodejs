import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

const mockUser = {
  _id: 'some-id',
  email: 'admin@test.com',
  password: 'hashed',
  role: UserRole.ADMIN,
  refreshToken: null,
};

describe('UsersService', () => {
  let service: UsersService;
  let model: jest.Mocked<Model<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) } as any);
      const result = await service.findByEmail('admin@test.com');
      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'admin@test.com' });
    });

    it('returns null when not found', async () => {
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      const result = await service.findByEmail('nobody@test.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('hashes password before saving', async () => {
      const safeUser = { _id: mockUser._id, email: mockUser.email, role: mockUser.role };
      model.create.mockResolvedValue(mockUser as any);
      model.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(safeUser) }),
      } as any);
      await service.create({ email: 'admin@test.com', password: 'plaintext' });
      const callArg = (model.create as jest.Mock).mock.calls[0][0];
      expect(callArg.password).not.toBe('plaintext');
      const isHashed = await bcrypt.compare('plaintext', callArg.password);
      expect(isHashed).toBe(true);
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) } as any);
      const result = await service.findById('some-id');
      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith('some-id');
    });

    it('returns null when not found', async () => {
      model.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) } as any);
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('stores hashed token when token provided', async () => {
      model.findByIdAndUpdate.mockResolvedValue(mockUser as any);
      await service.updateRefreshToken('some-id', 'raw-refresh-token');
      const callArg = (model.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
      expect(callArg.refreshToken).not.toBe('raw-refresh-token');
      const isHashed = await bcrypt.compare('raw-refresh-token', callArg.refreshToken);
      expect(isHashed).toBe(true);
    });

    it('stores null when token is null', async () => {
      model.findByIdAndUpdate.mockResolvedValue(mockUser as any);
      await service.updateRefreshToken('some-id', null);
      const callArg = (model.findByIdAndUpdate as jest.Mock).mock.calls[0][1];
      expect(callArg.refreshToken).toBeNull();
    });
  });
});
