# FDA_Nodejs

Rebuild followDirectorActivities Flask → Node.js + auth/phân quyền.  
**`../followDirectorActivities/`** — KHÔNG ĐỘNG, chỉ đọc tham khảo.

## Stack
- **API:** NestJS · port 3001 · `apps/api/`
- **Web:** Next.js 16 App Router · port 3000 · `apps/web/`
- **DB:** MongoDB + Mongoose
- **Auth:** JWT access 15m + refresh 7d · Passport.js · httpOnly cookies
- **Tương lai:** `@nestjs/schedule` (scanner), Gemini AI, Telegram bot

## Quy tắc cứng
- bcrypt saltRounds = 12 · TypeScript `"strict": true`
- Env vars qua `.env` · không hardcode secret · `.env` trong `.gitignore`
- API error message tiếng Anh · DTO dùng `class-validator`
- Test file đặt cạnh source (`*.service.spec.ts`)

## Auth pattern
- Mọi route yêu cầu JWT mặc định (`JwtAuthGuard` global)
- `@Public()` → bỏ qua JWT · `@Roles(UserRole.ADMIN)` → chỉ admin
- `@CurrentUser()` → lấy `{ id, email, role }` từ request

## Commands
```bash
cd apps/api && npm run start:dev        # chạy API
cd apps/web && npm run dev              # chạy Web
cd apps/api && npm run seed:admin       # tạo admin lần đầu
cd apps/api && npx jest --no-coverage   # tests
```

## Env
**`apps/api/.env`:** `MONGODB_URI` · `JWT_SECRET` · `JWT_EXPIRES_IN=15m` · `JWT_REFRESH_SECRET` · `JWT_REFRESH_EXPIRES_IN=7d` · `PORT=3001`  
**`apps/web/.env.local`:** `NEXT_PUBLIC_API_URL=http://localhost:3001/api`  
Sinh secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Tiến độ
- [x] Phase 1 — NestJS + MongoDB + JWT Auth + RBAC + Next.js login
- [ ] Phase 2 — Targets module
- [ ] Phase 3 — Notifications module
- [ ] Phase 4 — Scanner (Cron + Gemini AI)
- [ ] Phase 5 — Settings + Telegram
- [ ] Phase 6 — Next.js UI hoàn chỉnh

## API đã có
| Group | Endpoints |
|---|---|
| Auth (public) | `POST /auth/login` · `/refresh` · `/logout` · `GET /auth/me` |
| Users (admin) | `GET/POST /users` · `PATCH/DELETE /users/:id` |

## Cần implement
**Targets:** `GET/POST /targets` · `DELETE /targets/:name` · `GET /targets/summary` · `/target/detail` · `/target/export.json` · `POST /target/label`  
**Notifications:** `GET /notifications`  
**Scanner:** `POST /monitor/run` · `/monitor/cancel` · `GET /monitor/status`  
**Settings:** `GET/POST /settings` · `POST /settings/telegram-test`  
**Data:** `GET /data/stats` · `POST /data/clear`
