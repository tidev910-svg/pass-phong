-- Sở thích Bảng tin cá nhân hoá — 1 bản ghi hồ sơ duy nhất mỗi user, dùng để
-- xếp hạng feed (khác `saved_searches`: đó là nhiều tìm kiếm đã lưu có badge
-- đếm tin mới, còn đây là 1 hồ sơ liên tục dùng cho scoring — ngữ nghĩa khác
-- nhau nên tách bảng riêng thay vì gộp chung).

create table feed_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  price_min numeric(12, 0),
  price_max numeric(12, 0),
  lat double precision,
  lng double precision,
  radius_km numeric(5, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_feed_pref_lat_lng_together check ((lat is null) = (lng is null))
);

alter table feed_preferences enable row level security;

create table feed_preference_regions (
  user_id uuid not null references feed_preferences(user_id) on delete cascade,
  region_id smallint not null references regions(id),
  primary key (user_id, region_id)
);

alter table feed_preference_regions enable row level security;

create table feed_preference_tags (
  user_id uuid not null references feed_preferences(user_id) on delete cascade,
  tag_id smallint not null references listing_tags(id) on delete cascade,
  primary key (user_id, tag_id)
);

alter table feed_preference_tags enable row level security;

comment on table feed_preferences is 'Hồ sơ sở thích Bảng tin (vị trí trung tâm + bán kính + khoảng giá) — vị trí theo khu vực nằm ở feed_preference_regions, sở thích tag ở feed_preference_tags. Ít nhất 1 trong {regionIds, lat/lng} phải có (ràng buộc ở tầng domain validation, không ở DB).';
