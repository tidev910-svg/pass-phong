-- Pass Phòng Cần Thơ — schema gốc: users, sessions, regions, listings, listing_images.
-- RLS giữ bật (mặc định Supabase) nhưng KHÔNG tạo policy nào cho anon/authenticated:
-- app chỉ truy cập bằng service role key ở server (tự bypass RLS); nếu anon key
-- lỡ lộ thì vẫn không đọc/ghi được gì (deny-by-default).

create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

-- Session tự viết (không dùng Supabase Auth) — lưu hash của token, không lưu token thô.
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table sessions enable row level security;
create index idx_sessions_token_hash on sessions(token_hash);

-- Dùng BẢNG (không phải Postgres enum) để thêm khu vực/thành phố mới chỉ cần
-- insert row, không cần ALTER TYPE.
create table regions (
  id smallint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  city text not null default 'Can Tho',
  display_order int not null default 0,
  is_active boolean not null default true
);

alter table regions enable row level security;

create table listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  region_id smallint not null references regions(id),
  price numeric(12, 0) not null check (price >= 0),
  move_out_date date not null,
  description text,
  contact_phone text,
  contact_link text,
  status text not null default 'active' check (status in ('active', 'deleted', 'passed')),
  passed_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_has_contact check (contact_phone is not null or contact_link is not null)
);

alter table listings enable row level security;
create index idx_listings_search on listings (status, region_id, price, move_out_date);
create index idx_listings_created_at on listings (created_at desc);

create table listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  storage_path text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table listing_images enable row level security;
create index idx_listing_images_listing on listing_images(listing_id);
