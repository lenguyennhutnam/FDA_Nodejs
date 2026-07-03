import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

const mockUser = {
  id: 1,
  email: 'admin@test.com',
  password: 'hashed',
  role: UserRole.ADMIN,
  refreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({ ...mockUser, ...dto })),
            save: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('returns user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser as any);
      const result = await service.findByEmail('admin@test.com');
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { email: 'admin@test.com' } });
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('nobody@test.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('hashes password before saving', async () => {
      repo.save.mockImplementation(async (user: any) => user);
      await service.create({ email: 'admin@test.com', password: 'plaintext' });
      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.password).not.toBe('plaintext');
      const isHashed = await bcrypt.compare('plaintext', savedUser.password || '');
      expect(isHashed).toBe(true);
    });
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      repo.findOne.mockResolvedValue(mockUser as any);
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('returns null when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('stores hashed token when token provided', async () => {
      await service.updateRefreshToken(1, 'raw-refresh-token');
      const updateArg = repo.update.mock.calls[0][1] as any;
      expect(updateArg.refreshToken).not.toBe('raw-refresh-token');
      const isHashed = await bcrypt.compare('raw-refresh-token', updateArg.refreshToken);
      expect(isHashed).toBe(true);
    });

    it('stores null when token is null', async () => {
      await service.updateRefreshToken(1, null);
      const updateArg = repo.update.mock.calls[0][1] as any;
      expect(updateArg.refreshToken).toBeNull();
    });
  });
});
