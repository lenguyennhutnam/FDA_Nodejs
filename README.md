# FDA — Follow Director Activities

Hệ thống theo dõi hoạt động cán bộ, tự động quét tin tức từ Google News và phân loại thành hai luồng: **hoạt động thường** và **biến động chức vụ**.

---

## Kiến trúc

```
FDA_Nodejs/
├── apps/
│   ├── api/   # NestJS — REST API, Scanner, Auth (port 3001)
│   └── web/   # Next.js 16 App Router — Giao diện (port 3000)
└── data/      # File JSON: targets, notifications, settings
```

| Layer | Công nghệ |
|---|---|
| API | NestJS v11 · TypeScript · Passport.js JWT |
| Web | Next.js 16 App Router · Tailwind CSS |
| DB (auth/users) | MongoDB + Mongoose |
| DB (nghiệp vụ) | File JSON tại `apps/api/data/` |
| Scanner | Google News RSS · rss-parser · @nestjs/schedule |

---

## Yêu cầu

- **Node.js** ≥ 20
- **MongoDB** đang chạy (local hoặc Atlas)

---

## Cài đặt

### 1. Cài dependencies

```bash
cd apps/api && npm install
cd ../web && npm install
```

### 2. Cấu hình biến môi trường

**`apps/api/.env`**
```env
MONGODB_URI=mongodb://localhost:27017/fda
JWT_SECRET=<random_64_bytes_hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<random_64_bytes_hex_khác>
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

```bash
# Sinh secret ngẫu nhiên
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Tạo tài khoản admin

```bash
cd apps/api && npm run seed:admin
```

Tạo: `admin@fda.local` / `Admin@123` — đổi mật khẩu sau khi đăng nhập lần đầu.

---

## Chạy

```bash
# Terminal 1 — API
cd apps/api && npm run start:dev

# Terminal 2 — Web
cd apps/web && npm run dev
```

Truy cập: http://localhost:3000

---

## Tính năng hiện có

### Dashboard
- Thẻ tóm tắt từng nhân vật: số tin hoạt động + biến động chức vụ
- Bộ lọc cửa sổ thời gian: 24h / 48h / 7d / 30d
- Danh sách tin mới nhất

### Mục tiêu theo dõi (`/targets`)
- Danh sách nhân vật: tên, chức vụ, tiểu sử
- Admin: thêm / sửa / xóa · Viewer: chỉ xem

### Chi tiết nhân vật
- Tab **Hoạt động**: tin thường, gán nhãn "không liên quan"
- Tab **Biến động**: tin bổ nhiệm / miễn nhiệm / điều động
- Xuất JSON

### Scanner (`/dashboard` → Quét ngay)
- Quét Google News RSS locale `hl=vi&gl=VN`
- Loại trùng lặp: URL + Jaccard tiêu đề ≥ 0.6
- Lọc bài cũ qua `when:Nd` (`scan_lookback_days`)
- Lọc bài lạc: chỉ giữ bài có tên trong tiêu đề (`require_name_in_title`)
- Tự động quét theo chu kỳ (cron)

### Cài đặt (`/settings`)
| Nhóm | Nội dung |
|---|---|
| Quét | Chế độ tìm kiếm · Số tin tối đa · Khoảng ngày · Tên trong tiêu đề · Auto scan · Chu kỳ |
| Telegram | Cấu hình bot token + chat ID · Gửi thử |
| Báo chính thống | Danh sách tên báo tin cậy |
| Dữ liệu | Xóa tin theo khoảng: 1h / 24h / 7d / 4w / all |

---

## Phân quyền

| Role | Quyền |
|---|---|
| `admin` | Toàn quyền: CRUD targets, chạy scan, thay đổi cài đặt, xóa data |
| `viewer` | Xem dashboard, chi tiết, gán nhãn bài |

---

## API

| Nhóm | Endpoint |
|---|---|
| Auth | `POST /api/auth/login` · `/refresh` · `/logout` · `GET /api/auth/me` |
| Targets | `GET /api/targets` · `POST` · `PATCH /:id` · `DELETE /:id` |
| Notifications | `GET /api/notifications` · `/summary?hours=` · `/detail?name=&hours=` · `POST /label` |
| Scanner | `GET /api/monitor/status` · `POST /monitor/run` · `/cancel` · `/auto` |
| Settings | `GET /api/settings` · `POST /api/settings` · `POST /settings/telegram-test` |
| Data | `GET /api/data/stats` · `POST /api/data/clear` |

---

## Dev

```bash
# Seed tin mẫu + target demo
cd apps/api && npm run seed:notifications

# Chạy test
cd apps/api && npx jest --no-coverage
```
