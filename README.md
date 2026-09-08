# Pass Phòng Cần Thơ

Web MVP đăng & tìm tin pass phòng ở Cần Thơ. Xem [CLAUDE.md](./CLAUDE.md) để
biết bối cảnh/tính năng và [UI_STYLE_GUIDE.md](./UI_STYLE_GUIDE.md) để biết
chuẩn giao diện.

## Stack

Next.js (App Router) + Ant Design + Supabase (Postgres + Storage) + auth tự
viết (bcrypt + session token) — deploy Vercel.

## Cài đặt lần đầu

1. Tạo project Supabase mới (free tier).
2. Trong Supabase SQL Editor, chạy lần lượt TẤT CẢ file trong
   [`supabase/migrations/`](./supabase/migrations) theo đúng thứ tự đánh số
   (`0001_init.sql` → `0002_saved_searches.sql` → `0003_reports_and_success.sql`
   → `0004_listing_coordinates.sql` → `0005_user_profile.sql` →
   `0006_listing_tags.sql` → `0007_feed_preferences.sql` →
   `0008_listing_saves.sql` → `0009_user_lock.sql` →
   `0010_reports_status_index.sql` → `seed.sql`). Không chạy
   `supabase/mock-data.sql` ở project thật (chỉ dữ liệu test cho local/dev).
3. Vào Storage, tạo 1 bucket tên **`listing-images`**, đặt **Public** (ảnh tin
   đăng cần xem công khai không cần ký URL).
4. Copy `.env.example` thành `.env.local`, điền `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (Project Settings > API), `SITE_URL`. Không
   còn `ADMIN_SECRET` — trang quản trị là project riêng (`PASS_PHONG_ADMIN`),
   xem chú thích trong `.env.example`.
5. `npm install`
6. `npm run dev` rồi mở http://localhost:3000

## Cấu trúc thư mục

- `src/domain/*` — business logic thuần (không đụng Next.js/Supabase).
- `src/infra/*` — chi tiết hạ tầng (Supabase client, session, storage).
  `src/infra/container.ts` là điểm wiring duy nhất giữa domain và infra.
- `src/app/**` — routing + UI (App Router), theo route group `(public)`,
  `(auth)`, `(account)`, `(map)`. Không có route admin trong repo này — xem
  `PASS_PHONG_ADMIN` (project riêng, không nằm trong repo này).
- `src/components/*` — UI component dùng chung (antd, theo `UI_STYLE_GUIDE.md`).
- `src/theme/*` — cấu hình theme antd (forest/mustard, bo góc, shadow — xem
  `UI_STYLE_GUIDE.md`).
- `supabase/migrations/*` — schema Postgres, chạy thủ công qua SQL Editor hoặc
  Supabase CLI (`supabase db push`).
- `tests/` — Playwright, kiểm tra layout mobile (`npm run test:mobile`).

## Deploy lên Vercel

1. Repo này chưa có commit Git nào — trước khi deploy, khởi tạo + đẩy lên 1
   remote (GitHub/GitLab/Bitbucket) mà Vercel đọc được:
   ```
   git init
   git add -A
   git commit -m "Initial commit"
   git remote add origin <URL repo của bạn>
   git push -u origin main
   ```
2. Trên [vercel.com](https://vercel.com), **Add New... > Project**, import
   repo vừa đẩy lên. Vercel tự nhận diện Next.js, không cần chỉnh build
   command/output directory.
3. Ở bước **Environment Variables**, thêm đúng 3 biến trong `.env.example`:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — copy y hệt giá trị đang
     dùng ở `.env.local` (cùng 1 Supabase project, hoặc tạo project Supabase
     riêng cho production nếu muốn tách dữ liệu — nhớ chạy lại toàn bộ
     migration ở bước "Cài đặt lần đầu" cho project mới đó).
   - `SITE_URL` — đặt bằng domain Vercel sẽ cấp (vd `https://ten-app.vercel.app`)
     hoặc domain riêng nếu đã gắn — dùng để tạo ảnh Open Graph khi chia sẻ
     link, không đặt `http://localhost:3000` ở đây.
4. Bấm **Deploy**. Xong lần đầu, mọi lần `git push` lên nhánh chính sau đó
   Vercel tự build & deploy lại (không cần lặp lại bước 2/3).
5. Kiểm tra nhanh sau khi deploy: đăng ký 1 tài khoản mới, đăng tin thử (có
   ảnh), xác nhận ảnh hiện đúng (test bucket Storage đã Public thật) — rồi
   xoá tài khoản/tin test đó nếu không muốn để lại trên production.

**Không cần cấu hình gì thêm cho cookie session** — `secure` tự bật đúng dựa
trên header `x-forwarded-proto` mà edge network của Vercel luôn set, không
cần biến môi trường riêng.
