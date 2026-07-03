import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  const config = app.get(ConfigService);
  const usersService = app.get(UsersService);

  // Tự động khởi tạo tài khoản Admin đầu tiên nếu chưa tồn tại
  const adminEmail = config.get<string>('ADMIN_EMAIL') ?? 'admin@fda.local';
  const adminPassword = config.get<string>('ADMIN_PASSWORD') ?? 'Admin@12345';
  try {
    const existing = await usersService.findByEmail(adminEmail);
    if (!existing) {
      await usersService.create({
        email: adminEmail,
        password: adminPassword,
        role: UserRole.ADMIN,
      });
      console.log(`[Auto-Seed] Khoi tao tai khoan Admin mac dinh thanh cong: ${adminEmail}`);
    }
  } catch (err: any) {
    console.warn(`[Auto-Seed] Khong the kiem tra hoac khoi tao Admin: ${err.message}`);
  }

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
