# FDA_Nodejs

Rebuild followDirectorActivities Flask → Node.js + auth/phân quyền.  
**`../followDirectorActivities/`** — KHÔNG ĐỘNG, chỉ đọc tham khảo.

## Stack
- **API:** NestJS · port 3001 · `apps/api/`
- **Web:** Next.js 16 App Router · port 3000 · `apps/web/`
- **DB:** MongoDB (Users/auth) + Mongoose. **Tạm thời:** dữ liệu nghiệp vụ (targets…) lưu file JSON trong `apps/api/data/`, sẽ chuyển sang Mongo sau khi UI ổn.
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
cd apps/api && npm run seed:notifications # seed tin mẫu (dev) + target demo
cd apps/api && npx jest --no-coverage   # tests
```

## Env
**`apps/api/.env`:** `MONGODB_URI` · `JWT_SECRET` · `JWT_EXPIRES_IN=15m` · `JWT_REFRESH_SECRET` · `JWT_REFRESH_EXPIRES_IN=7d` · `PORT=3001`  
**`apps/web/.env.local`:** `NEXT_PUBLIC_API_URL=http://localhost:3001/api`  
Sinh secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Tiến độ
- [x] Phase 1 — NestJS + MongoDB + JWT Auth + RBAC + Next.js login
- [x] Phase 2 — Targets module (JSON store) + app shell sidebar + /targets CRUD UI
- [x] Phase 3 — Notifications (JSON store) + Dashboard (thẻ tóm tắt + tin mới) + trang chi tiết (tab liên quan/không + gán nhãn + export)
- [x] Phase 4a — Scanner Google News RSS (KHÔNG Gemini, locale vi/VN) · phân loại từ khóa · `timestamp=pubDate` (sort/hiển thị) + `scan_time=now` (lọc cửa sổ dashboard) · dedup URL + tiêu đề (Jaccard ≥0.6) · search `exact_name` · lọc `when:Nd` (scan_lookback_days=30) · lọc tên-trong-tiêu-đề (require_name_in_title=true) · quét thủ công + auto-cron · `rss-parser` + `@nestjs/schedule`
- [x] Phase 5 — Settings (JSON store) · cài đặt quét (đấu vào scanner) · Telegram (config + gửi thử) · quản lý dữ liệu (stats + xóa theo khoảng) · danh sách báo
- [ ] Phase 4b — Gemini AI (chưa làm — phân tích/xác minh tin)
- [ ] Phase 5b — Telegram auto-gửi khi quét + đấu whitelist báo chính thống vào scanner (chưa wired)
- [ ] Phase 6 — Next.js UI hoàn chỉnh

## API đã có
| Group | Endpoints |
|---|---|
| Auth (public) | `POST /auth/login` · `/refresh` · `/logout` · `GET /auth/me` |
| Users (admin) | `GET/POST /users` · `PATCH/DELETE /users/:id` |
| Targets | `GET /targets` (mọi user) · `POST` `PATCH/:id` `DELETE/:id` (admin) — JSON store |
| Notifications | `GET /notifications` (tin mới) · `GET /notifications/summary?hours=` · `GET /notifications/detail?name=&hours=` · `POST /notifications/label` (mọi user) — JSON store |
| Scanner | `GET /monitor/status` (mọi user) · `POST /monitor/run` `cancel` `auto` (admin) — Google News RSS, không AI · đọc settings (match mode, max, chu kỳ) |
| Settings | `GET /settings` (mọi user, ẩn token) · `POST /settings` `/settings/telegram-test` (admin) — JSON store |
| Data | `GET /data/stats` · `POST /data/clear` (admin) — xóa tin theo 1h/24h/7d/4w/all |

## Cần implement
**Phase 4b — Gemini:** phân tích/xác minh tin (ai_result đầy đủ thay cho keyword_scan)  
**Phase 5b:** Telegram auto-gửi sau quét (telegram_sent dedup) · đấu whitelist báo vào scanner
