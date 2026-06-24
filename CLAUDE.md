# CLAUDE.md — FDA_Nodejs

**Mục tiêu:** Rebuild followDirectorActivities từ Flask sang Node.js, có auth + phân quyền.  
**Base code Flask:** `../followDirectorActivities/` — **KHÔNG ĐỘNG VÀO**, chỉ đọc tham khảo logic.

---

## Stack

| Layer | Công nghệ |
|---|---|
| Frontend | Next.js 16 (App Router) — `apps/web/` port 3000 |
| Backend | NestJS — `apps/api/` port 3001 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access 15m + refresh 7d) + Passport.js |
| Background jobs | `@nestjs/schedule` — scanner tự động (Phase 4) |
| AI | `@google/generative-ai` — Gemini (Phase 4) |
| Telegram | `node-telegram-bot-api` (Phase 5) |

---

## Cấu trúc thực tế (đã implement)

```
FDA_Nodejs/
├── apps/
│   ├── api/src/
│   │   ├── config/env.validation.ts     # Joi validate .env
│   │   ├── auth/
│   │   │   ├── strategies/              # local, jwt, jwt-refresh
│   │   │   ├── guards/                  # JwtAuthGuard (global), RolesGuard (global)
│   │   │   ├── decorators/              # @Public(), @Roles(), @CurrentUser()
│   │   │   ├── dto/                     # login.dto.ts, auth-response.dto.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   ├── schemas/user.schema.ts   # User, UserRole enum, UserDocument
│   │   │   ├── dto/                     # create-user.dto.ts, update-user.dto.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts      # Admin-only CRUD
│   │   │   └── users.module.ts
│   │   ├── scripts/seed-admin.ts        # Tạo admin user lần đầu
│   │   └── app.module.ts
│   └── web/
│       ├── app/
│       │   ├── login/                   # page.tsx (Client, useActionState) + actions.ts
│       │   └── dashboard/page.tsx       # Placeholder
│       ├── lib/
│       │   ├── api.ts                   # apiGet, apiPost
│       │   └── auth.ts                  # setAuthCookies, getAccessToken, clearAuthCookies
│       └── proxy.ts                     # Route protection (Next.js 16 — đổi tên từ middleware.ts)
└── docs/superpowers/plans/              # Implementation plans
```

**Modules chưa implement (Phase 2+):** `targets/`, `scanner/`, `notifications/`, `settings/`, `telegram/`

---

## Auth & RBAC

- **Mọi route API mặc định yêu cầu JWT** — `JwtAuthGuard` global qua `APP_GUARD`
- **Route public** → đánh dấu `@Public()`
- **Route admin only** → đánh dấu `@Roles(UserRole.ADMIN)` — `RolesGuard` chạy sau JwtAuthGuard
- **Token lưu httpOnly cookie** ở frontend (access_token 15m, refresh_token 7d)
- **`@CurrentUser()`** lấy user object từ request (`{ id, email, role }`)

---

## API đã implement

**Auth** — public  
`POST /api/auth/login` · `POST /api/auth/refresh` · `POST /api/auth/logout` · `GET /api/auth/me`

**Users** — admin only  
`GET /api/users` · `POST /api/users` · `PATCH /api/users/:id` · `DELETE /api/users/:id`

## API cần implement (Phase 2+)

**Targets:** `GET/POST /api/targets` · `DELETE /api/targets/:name` · `GET /api/targets/summary` · `GET /api/target/detail` · `GET /api/target/export.json` · `POST /api/target/label`  
**Notifications:** `GET /api/notifications`  
**Scanner:** `POST /api/monitor/run` · `POST /api/monitor/cancel` · `GET /api/monitor/status`  
**Settings:** `GET/POST /api/settings` · `POST /api/settings/telegram-test`  
**Data:** `GET /api/data/stats` · `POST /api/data/clear`

---

## MongoDB Collections

| Collection | Fields chính |
|---|---|
| `users` ✅ | email, password (bcrypt), role, refreshToken (bcrypt) |
| `targets` | name, position, bio |
| `notifications` | target_name, url, resolved_url, timestamp, channel, user_label |
| `scan_history` | key (`name\|url`) |
| `settings` | singleton |
| `press_sources` | name, homepage_url, rss_url |

---

## Quy tắc

- **KHÔNG sửa** `../followDirectorActivities/`
- Env vars qua `.env` — không hardcode secret. `.env` phải có trong `.gitignore`
- bcrypt saltRounds = 12 (password + refreshToken)
- TypeScript strict mode (`"strict": true`)
- Mỗi NestJS module: `module.ts`, `controller.ts`, `service.ts`, `dto/`, `schemas/`
- DTO dùng `class-validator` + `class-transformer`
- Test file đặt cạnh file implement (`*.service.spec.ts`)
- API error message bằng tiếng Anh

---

## Commands

```bash
# Chạy
cd apps/api && npm run start:dev
cd apps/web && npm run dev

# Seed admin (chạy 1 lần đầu)
cd apps/api && npm run seed:admin
# Custom: ADMIN_EMAIL=x@y.com ADMIN_PASSWORD=Pass123 npm run seed:admin

# Tests
cd apps/api && npx jest --no-coverage
cd apps/api && npx jest users.service.spec --no-coverage  # 1 file cụ thể

# Build web
cd apps/web && npm run build
```

---

## Biến môi trường

**`apps/api/.env`**
```env
MONGODB_URI=mongodb://localhost:27017/fda
JWT_SECRET=<64 bytes hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<64 bytes hex khác>
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```
Sinh secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Tiến độ

- [x] **Phase 1** — NestJS scaffold + MongoDB + Auth + RBAC + Next.js login
- [ ] **Phase 2** — Targets module
- [ ] **Phase 3** — Notifications module
- [ ] **Phase 4** — Scanner (background worker + Cron + Gemini AI)
- [ ] **Phase 5** — Settings + Telegram
- [ ] **Phase 6** — Next.js UI hoàn chỉnh
