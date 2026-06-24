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
      model.create.mockResolvedValue(mockUser as any);
      await service.create({ email: 'admin@test.com', password: 'plaintext' });
      const callArg = (model.create as jest.Mock).mock.calls[0][0];
      expect(callArg.password).not.toBe('plaintext');
      const isHashed = await bcrypt.compare('plaintext', callArg.password);
      expect(isHashed).toBe(true);
    });
  });
});
