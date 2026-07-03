import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole } from '../modules/database/entities/user.entity';

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
