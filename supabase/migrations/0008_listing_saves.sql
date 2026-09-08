-- Lưu tin yêu thích (bookmark từng tin cụ thể) — khác `saved_searches` (lưu
-- BỘ LỌC, không phải 1 tin). Quan hệ thuần user-listing, không cần cột nào
-- trên `listings`/`users` nên áp dụng được ngay cho CẢ tin cũ lẫn tin mới,
-- không cần backfill/migrate dữ liệu.

create table listing_saves (
  user_id uuid not null references users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table listing_saves enable row level security;
create index idx_listing_saves_listing on listing_saves(listing_id);

comment on table listing_saves is 'Bookmark 1 tin cụ thể của 1 user — phục vụ nút "Lưu tin" + tab "Tin đã lưu" ở /tai-khoan. Không có cột cache đếm lượt lưu trên `listings` (tính trực tiếp bằng COUNT khi cần, xem ListingSaveRepository.countByListingIds) — đủ dùng ở quy mô MVP, tránh rủi ro lệch số đếm cache.';
