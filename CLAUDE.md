# CLAUDE.md — FDA_Nodejs Project

## Tổng quan dự án

**Tên:** followDirectorActivities (FDA) — phiên bản Node.js  
**Mục tiêu:** Rebuild từ Flask sang Node.js, bổ sung đăng nhập và phân quyền  
**Base code gốc:** `../followDirectorActivities/` — **TUYỆT ĐỐI KHÔNG CHỈNH SỬA** thư mục này, chỉ đọc để tham khảo logic

---

## Stack công nghệ

| Layer | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | Next.js (App Router) | `apps/web/` |
| Backend | NestJS | `apps/api/` |
| Database | MongoDB + Mongoose | |
| Auth | JWT + Passport.js (`@nestjs/passport`) | Access 15m + Refresh 7d |
| Background jobs | `@nestjs/schedule` (Cron) | Scanner tự động |
| Telegram | `node-telegram-bot-api` | Notification |
| AI | `@google/generative-ai` | Gemini phân tích bài báo |

---

## Kiến trúc thư mục

```
FDA_Nodejs/
├── apps/
│   ├── api/                          # NestJS backend (port 3001)
│   │   └── src/
│   │       ├── config/
│   │       │   └── env.validation.ts # Joi schema validate .env
│   │       ├── auth/
│   │       │   ├── strategies/
│   │       │   │   ├── local.strategy.ts
│   │       │   │   ├── jwt.strategy.ts
│   │       │   │   └── jwt-refresh.strategy.ts
│   │       │   ├── guards/
│   │       │   │   ├── jwt-auth.guard.ts   # Global default guard
│   │       │   │   └── roles.guard.ts      # Global RBAC guard
│   │       │   ├── decorators/
│   │       │   │   ├── public.decorator.ts       # @Public()
│   │       │   │   ├── roles.decorator.ts        # @Roles(UserRole.ADMIN)
│   │       │   │   └── current-user.decorator.ts # @CurrentUser()
│   │       │   ├── dto/
│   │       │   │   └── login.dto.ts
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.controller.ts
│   │       │   └── auth.module.ts
│   │       ├── users/
│   │       │   ├── schemas/
│   │       │   │   └── user.schema.ts   # User + UserRole enum + UserDocument
│   │       │   ├── dto/
│   │       │   │   ├── create-user.dto.ts
│   │       │   │   └── update-user.dto.ts
│   │       │   ├── users.service.ts
│   │       │   ├── users.controller.ts  # Admin-only CRUD
│   │       │   └── users.module.ts
│   │       ├── targets/        # TODO: CRUD mục tiêu bảo vệ
│   │       ├── scanner/        # TODO: Background auto-scanner (Cron)
│   │       ├── notifications/  # TODO: Đọc/lọc/label notifications
│   │       ├── settings/       # TODO: App settings
│   │       ├── telegram/       # TODO: Telegram notification service
│   │       ├── scripts/
│   │       │   └── seed-admin.ts  # Tạo user admin lần đầu
│   │       └── app.module.ts
│   └── web/                          # Next.js frontend (port 3000)
│       └── src/
│           ├── app/
│           │   ├── login/
│           │   │   ├── page.tsx
│           │   │   └── actions.ts  # Server Action: loginAction
│           │   └── dashboard/
│           │       └── page.tsx
│           ├── lib/
│           │   ├── api.ts   # apiGet, apiPost helpers
│           │   └── auth.ts  # Cookie helpers: setAuthCookies, getAccessToken, clearAuthCookies
│           └── middleware.ts  # Bảo vệ route, redirect /login nếu chưa auth
├── docs/
│   └── superpowers/
│       └── plans/
│           └── 2026-06-24-project-setup-auth.md  # Implementation plan phase 1
├── CLAUDE.md
└── system.md
```

---

## Phân quyền (Role-Based Access Control)

| Role | Quyền |
|---|---|
| `admin` | Toàn quyền: quản lý user, target, settings, xem/xóa data |
| `viewer` | Chỉ xem: dashboard, notifications, target detail |

**Cơ chế:**
- Mọi route mặc định yêu cầu JWT — `JwtAuthGuard` đăng ký global qua `APP_GUARD`
- Route public đánh dấu `@Public()` decorator
- Route chỉ admin đánh dấu `@Roles(UserRole.ADMIN)` — `RolesGuard` chạy sau `JwtAuthGuard`
- `@CurrentUser()` param decorator để lấy user từ request

---

## API Endpoints

### Auth (public)
- `POST /api/auth/login` — đăng nhập, trả `{ accessToken, refreshToken, user }`
- `POST /api/auth/refresh` — refresh token (body: `{ refreshToken }`)
- `POST /api/auth/logout` — xóa refresh token trong DB
- `GET /api/auth/me` — thông tin user hiện tại

### Users (admin only)
- `GET /api/users` — danh sách user
- `POST /api/users` — tạo user mới
- `PATCH /api/users/:id` — cập nhật role/password
- `DELETE /api/users/:id` — xóa user

### Targets (cần implement)
- `GET /api/targets` — danh sách mục tiêu bảo vệ
- `POST /api/targets` — thêm/sửa mục tiêu
- `DELETE /api/targets/:name` — xóa mục tiêu
- `GET /api/targets/summary` — tóm tắt theo khoảng thời gian
- `GET /api/target/detail` — chi tiết một mục tiêu
- `GET /api/target/export.json` — export JSON
- `POST /api/target/label` — gán/xóa user_label cho bài báo

### Notifications (cần implement)
- `GET /api/notifications` — danh sách notifications

### Scanner (cần implement)
- `POST /api/monitor/run` — chạy quét thủ công
- `POST /api/monitor/cancel` — hủy quét
- `GET /api/monitor/status` — trạng thái quét

### Settings (cần implement)
- `GET /api/settings` — lấy cài đặt
- `POST /api/settings` — lưu cài đặt
- `POST /api/settings/telegram-test` — test Telegram

### Data (cần implement)
- `GET /api/data/stats` — thống kê dữ liệu
- `POST /api/data/clear` — xóa dữ liệu

---

## MongoDB Collections

| Collection | Schema chính |
|---|---|
| `users` | email, password (bcrypt), role (admin/viewer), refreshToken (bcrypt) |
| `targets` | name, position, bio |
| `notifications` | target_name, url, resolved_url, timestamp, channel, user_label |
| `scan_history` | key (`name\|url`), dùng để tránh gửi lại |
| `settings` | singleton document chứa toàn bộ app config |
| `press_sources` | name, homepage_url, rss_url |

---

## Quy tắc làm việc trong project này

### Bắt buộc
- **KHÔNG sửa** bất kỳ file nào trong `../followDirectorActivities/`
- Tất cả env vars qua `.env` — không hardcode secret, API key, token
- File `.env` phải có trong `.gitignore`
- Passwords hash bằng bcrypt, saltRounds = 12
- Mỗi NestJS module gồm: `module.ts`, `controller.ts`, `service.ts`, `dto/`, `schemas/`
- DTO dùng `class-validator` + `class-transformer` để validate input

### Conventions
- Khi tham khảo logic cũ → đọc file Flask, viết lại bằng TypeScript — không copy nguyên
- Test file đặt cạnh file implement: `users.service.spec.ts` cạnh `users.service.ts`
- Background scanner là `@Injectable()` service với `@Cron()` từ `@nestjs/schedule`
- Server port: API=3001, Web=3000

---

## Commands thường dùng

```bash
# Chạy API (development)
cd apps/api && npm run start:dev

# Chạy Web (development)
cd apps/web && npm run dev

# Seed admin user lần đầu
cd apps/api && npm run seed:admin
# Hoặc custom:
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourPass123 npm run seed:admin

# Chạy unit tests
cd apps/api && npx jest

# Chạy 1 test cụ thể
cd apps/api && npx jest users.service.spec --no-coverage
```

---

## Biến môi trường

### `apps/api/.env`
```env
MONGODB_URI=mongodb://localhost:27017/fda
JWT_SECRET=<random 64 bytes hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<random 64 bytes hex khác>
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

Sinh secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
API_URL=http://localhost:3001/api
```

---

## Thứ tự implement

- [x] **Phase 1:** Setup NestJS + MongoDB + Auth + RBAC + Next.js login *(plan: 2026-06-24-project-setup-auth.md)*
- [ ] **Phase 2:** Targets module (CRUD)
- [ ] **Phase 3:** Notifications module
- [ ] **Phase 4:** Scanner module (background worker + cron)
- [ ] **Phase 5:** Settings module + Telegram
- [ ] **Phase 6:** Next.js UI hoàn chỉnh (migrate từ Flask templates)
