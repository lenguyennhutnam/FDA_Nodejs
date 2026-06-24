import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const hashedPassword = bcrypt.hashSync('password123', 12);
  const mockUser: any = {
    _id: 'user-id-1',
    email: 'admin@test.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    refreshToken: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('returns user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.validateUser('admin@test.com', 'password123');
      expect(result).toMatchObject({ email: 'admin@test.com' });
    });

    it('returns null when password is wrong', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      const result = await service.validateUser('admin@test.com', 'wrong');
      expect(result).toBeNull();
    });

    it('returns null when user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('nobody@test.com', 'password123');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('returns access and refresh tokens', async () => {
      jwtService.signAsync.mockResolvedValue('signed-token');
      usersService.updateRefreshToken.mockResolvedValue(undefined);
      const result = await service.login(mockUser);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toMatchObject({ email: 'admin@test.com', role: UserRole.ADMIN });
    });
  });
});
