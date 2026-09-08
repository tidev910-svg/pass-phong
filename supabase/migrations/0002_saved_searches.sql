-- Lưu tìm kiếm — giới hạn số lượng/user enforce ở domain service (đếm trước khi
-- insert), không cần trigger DB cho MVP.

create table saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  region_id smallint references regions(id),
  price_min numeric(12, 0),
  price_max numeric(12, 0),
  move_out_date_from date,
  move_out_date_to date,
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table saved_searches enable row level security;
create index idx_saved_searches_user on saved_searches(user_id);
