# FDA_Nodejs — Project Setup + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold NestJS API + MongoDB + JWT authentication với role-based access control (admin/viewer), sẵn sàng để build các module nghiệp vụ tiếp theo.

**Architecture:** NestJS API trong `apps/api/`, Next.js UI trong `apps/web/` (task cuối). MongoDB qua Mongoose. JWT access token (15m) + refresh token (7d) lưu trong DB. Mọi route mặc định yêu cầu JWT; route public đánh dấu `@Public()`.

**Tech Stack:** NestJS v10, MongoDB + Mongoose, @nestjs/passport + passport-jwt + passport-local, class-validator, class-transformer, @nestjs/config, bcrypt, @nestjs/jwt

## Global Constraints

- Node.js >= 18 (hiện tại: v20.12.1)
- TypeScript strict mode bật
- Tất cả env vars qua `.env` — không hardcode bất kỳ secret nào
- Password hash bằng bcrypt, saltRounds = 12
- JWT access token TTL: 15 phút; refresh token TTL: 7 ngày
- Role enum: `admin` | `viewer` (lưu trong DB)
- `apps/api/` — NestJS; `apps/web/` — Next.js
- Base code tham khảo nằm ở `../../followDirectorActivities/` — **tuyệt đối không sửa**

---

### Task 1: Scaffold NestJS + kết nối MongoDB + Config module

**Files:**
- Create: `apps/api/` (NestJS project qua `nest new`)
- Create: `apps/api/.env` (gitignored)
- Create: `apps/api/.env.example`
- Modify: `apps/api/src/app.module.ts`
- Create: `apps/api/src/config/env.validation.ts`

**Interfaces:**
- Produces: `AppModule` với `MongooseModule` và `ConfigModule` sẵn sàng cho các module sau dùng

- [ ] **Step 1: Scaffold NestJS project**

Chạy trong `e:\TT186\working_branch\FDA_Nodejs\`:

```bash
npx @nestjs/cli new apps/api --package-manager npm --strict --skip-git
```

Khi hỏi package manager → chọn `npm`.

Expected output: thư mục `apps/api/` xuất hiện với `src/`, `package.json`, `tsconfig.json`.

- [ ] **Step 2: Cài dependencies**

```bash
cd apps/api
npm install @nestjs/mongoose mongoose @nestjs/config joi @nestjs/passport passport passport-local passport-jwt @nestjs/jwt bcrypt class-validator class-transformer
npm install -D @types/passport-local @types/passport-jwt @types/bcrypt
```

- [ ] **Step 3: Tạo file `.env.example`**

Tạo `apps/api/.env.example`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/fda

# JWT
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me_to_another_long_random_string
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=development
```

- [ ] **Step 4: Tạo file `.env` thực tế**

Copy `.env.example` thành `.env`, điền giá trị thực:

```bash
cp .env.example .env
```

Sinh JWT secrets (chạy trong terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Chạy 2 lần — một cho `JWT_SECRET`, một cho `JWT_REFRESH_SECRET`.

Thêm `.env` vào `.gitignore`:
```bash
echo ".env" >> .gitignore
```

- [ ] **Step 5: Tạo env validation**

Tạo `apps/api/src/config/env.validation.ts`:

```typescript
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});
```

- [ ] **Step 6: Cập nhật AppModule**

Sửa `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 7: Cập nhật main.ts**

Sửa `apps/api/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
```

- [ ] **Step 8: Viết test kết nối MongoDB**

Tạo `apps/api/src/app.e2e-spec.ts` (thay thế file e2e mặc định trong `test/`):

```typescript
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('AppModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect to MongoDB without error', () => {
    expect(app).toBeDefined();
  });
});
```

- [ ] **Step 9: Chạy app, kiểm tra kết nối**

Đảm bảo MongoDB đang chạy (local hoặc Atlas), sau đó:

```bash
npm run start:dev
```

Expected: `API running on http://localhost:3001/api` và không có lỗi Mongoose connection.

- [ ] **Step 10: Commit**

```bash
cd e:/TT186/working_branch/FDA_Nodejs
git add apps/api/
git commit -m "feat: scaffold NestJS API with MongoDB and config module"
```

---

### Task 2: Users module — schema + service

**Files:**
- Create: `apps/api/src/users/schemas/user.schema.ts`
- Create: `apps/api/src/users/users.service.ts`
- Create: `apps/api/src/users/users.module.ts`
- Create: `apps/api/src/users/dto/create-user.dto.ts`
- Create: `apps/api/src/users/users.service.spec.ts`

**Interfaces:**
- Produces:
  - `UserDocument` (Mongoose document với fields: email, password, role, refreshToken)
  - `UsersService.create(dto)` → `Promise<UserDocument>`
  - `UsersService.findByEmail(email: string)` → `Promise<UserDocument | null>`
  - `UsersService.findById(id: string)` → `Promise<UserDocument | null>`
  - `UsersService.updateRefreshToken(id: string, token: string | null)` → `Promise<void>`

- [ ] **Step 1: Tạo User schema**

Tạo `apps/api/src/users/schemas/user.schema.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.VIEWER })
  role: UserRole;

  @Prop({ type: String, default: null })
  refreshToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

- [ ] **Step 2: Tạo CreateUserDto**

Tạo `apps/api/src/users/dto/create-user.dto.ts`:

```typescript
import { IsEmail, IsEnum, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
```

- [ ] **Step 3: Viết test cho UsersService trước khi implement**

Tạo `apps/api/src/users/users.service.spec.ts`:

```typescript
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
```

- [ ] **Step 4: Chạy test — xác nhận FAIL**

```bash
cd apps/api
npx jest users.service.spec.ts --no-coverage
```

Expected: FAIL — `UsersService` chưa tồn tại.

- [ ] **Step 5: Implement UsersService**

Tạo `apps/api/src/users/users.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

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
}
```

- [ ] **Step 6: Tạo UsersModule**

Tạo `apps/api/src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 7: Import UsersModule vào AppModule**

Sửa `apps/api/src/app.module.ts`, thêm vào `imports`:

```typescript
import { UsersModule } from './users/users.module';
// ... trong @Module imports:
UsersModule,
```

- [ ] **Step 8: Chạy test — xác nhận PASS**

```bash
npx jest users.service.spec.ts --no-coverage
```

Expected: PASS tất cả test.

- [ ] **Step 9: Commit**

```bash
cd e:/TT186/working_branch/FDA_Nodejs
git add apps/api/src/users/
git commit -m "feat: add Users module with schema and service"
```

---

### Task 3: Auth module — Login + JWT access/refresh

**Files:**
- Create: `apps/api/src/auth/auth.service.ts`
- Create: `apps/api/src/auth/auth.controller.ts`
- Create: `apps/api/src/auth/auth.module.ts`
- Create: `apps/api/src/auth/strategies/local.strategy.ts`
- Create: `apps/api/src/auth/strategies/jwt.strategy.ts`
- Create: `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`
- Create: `apps/api/src/auth/dto/login.dto.ts`
- Create: `apps/api/src/auth/dto/auth-response.dto.ts`
- Create: `apps/api/src/auth/auth.service.spec.ts`

**Interfaces:**
- Consumes: `UsersService.findByEmail`, `UsersService.findById`, `UsersService.updateRefreshToken`
- Produces:
  - `POST /api/auth/login` → `{ accessToken, refreshToken, user: { id, email, role } }`
  - `POST /api/auth/refresh` → `{ accessToken, refreshToken }`
  - `POST /api/auth/logout` → `{ message: 'ok' }`
  - `GET /api/auth/me` → `{ id, email, role }`
  - `JwtAuthGuard` (global default guard)
  - `@Public()` decorator

- [ ] **Step 1: Tạo DTOs**

Tạo `apps/api/src/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

- [ ] **Step 2: Viết test AuthService trước khi implement**

Tạo `apps/api/src/auth/auth.service.spec.ts`:

```typescript
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
```

- [ ] **Step 3: Chạy test — xác nhận FAIL**

```bash
npx jest auth.service.spec.ts --no-coverage
```

Expected: FAIL — `AuthService` chưa tồn tại.

- [ ] **Step 4: Implement AuthService**

Tạo `apps/api/src/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }

  async login(user: UserDocument) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      user: { id: user._id.toString(), email: user.email, role: user.role },
    };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.refreshToken) throw new UnauthorizedException();
    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) throw new UnauthorizedException();
    return this.login(user);
  }
}
```

- [ ] **Step 5: Tạo LocalStrategy**

Tạo `apps/api/src/auth/strategies/local.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    return user;
  }
}
```

- [ ] **Step 6: Tạo JwtStrategy**

Tạo `apps/api/src/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: { sub: string; email: string; role: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

- [ ] **Step 7: Tạo JwtRefreshStrategy**

Tạo `apps/api/src/auth/strategies/jwt-refresh.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: { sub: string; email: string; role: string }) {
    const refreshToken = req.body?.refreshToken as string;
    return { ...payload, id: payload.sub, refreshToken };
  }
}
```

- [ ] **Step 8: Tạo AuthController**

Tạo `apps/api/src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, UseGuards, Get, Req, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(200)
  async refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentUser('id') userId: string) {
    await this.authService.logout(userId);
    return { message: 'ok' };
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return user;
  }
}
```

- [ ] **Step 9: Tạo decorators**

Tạo `apps/api/src/auth/decorators/public.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Tạo `apps/api/src/auth/decorators/current-user.decorator.ts`:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
```

- [ ] **Step 10: Tạo JwtAuthGuard toàn cục**

Tạo `apps/api/src/auth/guards/jwt-auth.guard.ts`:

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

- [ ] **Step 11: Tạo AuthModule**

Tạo `apps/api/src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

- [ ] **Step 12: Đăng ký JwtAuthGuard global + AuthModule vào AppModule**

Sửa `apps/api/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envValidationSchema } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({ uri: config.get<string>('MONGODB_URI') }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 13: Chạy test AuthService — xác nhận PASS**

```bash
npx jest auth.service.spec.ts --no-coverage
```

Expected: PASS tất cả test.

- [ ] **Step 14: Chạy app và test endpoint thủ công**

```bash
npm run start:dev
```

Nhưng trước tiên cần có user trong DB. Chạy script seed (xem Task 4).

- [ ] **Step 15: Commit**

```bash
cd e:/TT186/working_branch/FDA_Nodejs
git add apps/api/src/auth/
git commit -m "feat: add Auth module with JWT login, refresh, and global JWT guard"
```

---

### Task 4: RBAC — Roles Guard + seed admin user

**Files:**
- Create: `apps/api/src/auth/guards/roles.guard.ts`
- Create: `apps/api/src/auth/decorators/roles.decorator.ts`
- Create: `apps/api/src/users/users.controller.ts`
- Create: `apps/api/src/users/dto/update-user.dto.ts`
- Create: `apps/api/src/scripts/seed-admin.ts`

**Interfaces:**
- Consumes: `JwtAuthGuard`, `UserRole`, `UsersService`
- Produces:
  - `@Roles(UserRole.ADMIN)` decorator
  - `RolesGuard` (kiểm tra role từ JWT payload)
  - `GET /api/users` — admin only
  - `POST /api/users` — admin only
  - `PATCH /api/users/:id` — admin only
  - `DELETE /api/users/:id` — admin only
  - Script seed tạo admin user lần đầu

- [ ] **Step 1: Tạo Roles decorator**

Tạo `apps/api/src/auth/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 2: Tạo RolesGuard**

Tạo `apps/api/src/auth/guards/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!required.includes(user?.role)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
```

- [ ] **Step 3: Đăng ký RolesGuard global vào AppModule**

Sửa `apps/api/src/app.module.ts`, thêm vào `providers`:

```typescript
import { RolesGuard } from './auth/guards/roles.guard';

// trong providers:
{ provide: APP_GUARD, useClass: JwtAuthGuard },
{ provide: APP_GUARD, useClass: RolesGuard },
```

- [ ] **Step 4: Tạo UpdateUserDto**

Tạo `apps/api/src/users/dto/update-user.dto.ts`:

```typescript
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
```

- [ ] **Step 5: Tạo UsersController**

Tạo `apps/api/src/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

- [ ] **Step 6: Thêm các methods còn thiếu vào UsersService**

Sửa `apps/api/src/users/users.service.ts`, thêm:

```typescript
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
```

Import thêm `UpdateUserDto` ở đầu file:
```typescript
import { UpdateUserDto } from './dto/update-user.dto';
```

- [ ] **Step 7: Đăng ký UsersController vào UsersModule**

Sửa `apps/api/src/users/users.module.ts`:

```typescript
import { UsersController } from './users.controller';

@Module({
  // ...
  controllers: [UsersController],
})
```

- [ ] **Step 8: Tạo script seed admin**

Tạo `apps/api/src/scripts/seed-admin.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = process.env.ADMIN_EMAIL ?? 'admin@fda.local';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@12345';

  const existing = await usersService.findByEmail(email);
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    await usersService.create({ email, password, role: UserRole.ADMIN });
    console.log(`Admin user created: ${email}`);
  }

  await app.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
```

Thêm script vào `apps/api/package.json`:

```json
"scripts": {
  "seed:admin": "ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts"
}
```

Cài thêm: `npm install -D ts-node tsconfig-paths`

- [ ] **Step 9: Chạy seed**

```bash
cd apps/api
npm run seed:admin
```

Expected: `Admin user created: admin@fda.local`

- [ ] **Step 10: Test thủ công các endpoint**

App phải đang chạy (`npm run start:dev`).

Test login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fda.local","password":"Admin@12345"}'
```
Expected: `{ "accessToken": "...", "refreshToken": "...", "user": { "role": "admin" } }`

Test `/api/auth/me` với token:
```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <accessToken>"
```
Expected: `{ "id": "...", "email": "admin@fda.local", "role": "admin" }`

Test unauthorized (không token):
```bash
curl http://localhost:3001/api/users
```
Expected: `401 Unauthorized`

- [ ] **Step 11: Commit**

```bash
cd e:/TT186/working_branch/FDA_Nodejs
git add apps/api/src/
git commit -m "feat: add RBAC roles guard, users CRUD endpoints, and seed script"
```

---

### Task 5: Next.js setup + Login page

**Files:**
- Create: `apps/web/` (Next.js project)
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/login/actions.ts`
- Create: `apps/web/src/middleware.ts`
- Create: `apps/web/.env.local`

**Interfaces:**
- Consumes: `POST /api/auth/login` từ NestJS
- Produces: Login page hoạt động, redirect về `/dashboard` sau login, middleware bảo vệ route

- [ ] **Step 1: Scaffold Next.js**

Chạy trong `e:\TT186\working_branch\FDA_Nodejs\`:

```bash
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Khi hỏi → chọn các option phù hợp (TypeScript: Yes, Tailwind: Yes, App Router: Yes).

- [ ] **Step 2: Tạo `.env.local`**

Tạo `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=same_as_jwt_secret_from_api
```

- [ ] **Step 3: Tạo API client**

Tạo `apps/web/src/lib/api.ts`:

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
```

- [ ] **Step 4: Tạo cookie helpers và token storage**

Tạo `apps/web/src/lib/auth.ts`:

```typescript
import { cookies } from 'next/headers';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 phút
    path: '/',
  });
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
    path: '/',
  });
}

export function getAccessToken(): string | undefined {
  return cookies().get(ACCESS_TOKEN_KEY)?.value;
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}
```

- [ ] **Step 5: Tạo Server Action cho login**

Tạo `apps/web/src/app/login/actions.ts`:

```typescript
'use server';

import { redirect } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { setAuthCookies } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const result = await apiPost<{ accessToken: string; refreshToken: string }>(
      '/auth/login',
      { email, password },
    );
    setAuthCookies(result.accessToken, result.refreshToken);
  } catch (e: any) {
    return { error: e.message ?? 'Đăng nhập thất bại' };
  }

  redirect('/dashboard');
}
```

- [ ] **Step 6: Tạo Login page**

Tạo `apps/web/src/app/login/page.tsx`:

```tsx
import { loginAction } from './actions';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">FDA — Đăng nhập</h1>
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Tạo middleware bảo vệ route**

Tạo `apps/web/src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_KEY } from '@/lib/auth';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

- [ ] **Step 8: Tạo dashboard placeholder**

Tạo `apps/web/src/app/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-500 mt-2">FDA — Theo dõi hoạt động lãnh đạo</p>
    </main>
  );
}
```

- [ ] **Step 9: Chạy Next.js và test thủ công**

```bash
cd apps/web
npm run dev
```

Mở trình duyệt: `http://localhost:3000`
Expected: Redirect về `/login`

Nhập email `admin@fda.local`, password `Admin@12345`
Expected: Redirect về `/dashboard`, thấy "Dashboard"

- [ ] **Step 10: Commit**

```bash
cd e:/TT186/working_branch/FDA_Nodejs
git add apps/web/
git commit -m "feat: add Next.js frontend with login page, auth cookies, and route middleware"
```

---

## Self-Review

### Spec coverage

| Yêu cầu từ CLAUDE.md | Task | Trạng thái |
|---|---|---|
| NestJS + MongoDB + Config | Task 1 | ✅ |
| User schema, bcrypt | Task 2 | ✅ |
| JWT login + refresh + logout + me | Task 3 | ✅ |
| JwtAuthGuard global | Task 3 | ✅ |
| `@Public()` decorator | Task 3 | ✅ |
| RBAC admin/viewer | Task 4 | ✅ |
| Users CRUD (admin only) | Task 4 | ✅ |
| Seed admin | Task 4 | ✅ |
| Next.js setup | Task 5 | ✅ |
| Login page | Task 5 | ✅ |
| Middleware bảo vệ route | Task 5 | ✅ |
| `.env` không commit | Tất cả | ✅ (gitignore) |

### Placeholder scan

Không có TBD, TODO, hoặc "similar to task N" trong plan.

### Type consistency

- `UserRole` định nghĩa Task 2, dùng nhất quán ở Task 3, 4
- `UserDocument` định nghĩa Task 2, dùng ở Task 3
- `UsersService` methods (`findByEmail`, `findById`, `updateRefreshToken`, `findAll`, `update`, `remove`) định nghĩa và implement trong Task 2+4, dùng đúng tên ở Task 3+4
- `JwtAuthGuard` tạo Task 3, đăng ký global Task 3 — đúng thứ tự
- `RolesGuard` tạo Task 4, đăng ký sau `JwtAuthGuard` — đúng thứ tự (JWT phải chạy trước Roles)
