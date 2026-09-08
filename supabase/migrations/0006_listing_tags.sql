-- Tag loại phòng/tiện ích cho tin đăng — phục vụ Bảng tin cá nhân hoá
-- (matching theo sở thích, không chỉ khu vực/giá/ngày). Dùng bảng junction
-- (không phải cột array) — khớp tiền lệ `listing_images`, giữ FK integrity,
-- đúng convention hiện có (dự án chưa dùng Postgres array cho dữ liệu quan hệ).

create table listing_tags (
  id smallserial primary key,
  slug text not null unique,
  label text not null,
  category text not null check (category in ('room_type', 'amenity')),
  display_order smallint not null default 0,
  is_active boolean not null default true
);

alter table listing_tags enable row level security;

create table listing_tag_links (
  listing_id uuid not null references listings(id) on delete cascade,
  tag_id smallint not null references listing_tags(id) on delete cascade,
  primary key (listing_id, tag_id)
);

alter table listing_tag_links enable row level security;
create index idx_listing_tag_links_tag on listing_tag_links(tag_id);

-- Seed taxonomy ban đầu — 2 loại phòng (chọn 1) + tiện ích (chọn nhiều).
-- Chưa có UI admin quản lý tag ở bản này: thêm/sửa tag sau này cần 1 migration
-- mới, giống cách `regions` hiện cũng chưa có UI admin.
insert into listing_tags (slug, label, category, display_order) values
  ('o-ghep', 'Ở ghép', 'room_type', 1),
  ('phong-rieng', 'Phòng riêng', 'room_type', 2),
  ('may-lanh', 'Có máy lạnh', 'amenity', 10),
  ('co-gac', 'Có gác/gác lửng', 'amenity', 11),
  ('nong-lanh', 'Có bình nóng lạnh', 'amenity', 12),
  ('khep-kin', 'Khép kín (toilet riêng)', 'amenity', 13),
  ('noi-that', 'Có sẵn nội thất (giường, tủ)', 'amenity', 14),
  ('cho-de-xe', 'Có chỗ để xe', 'amenity', 15),
  ('an-ninh', 'An ninh (camera/khoá vân tay)', 'amenity', 16),
  ('gio-giac-tu-do', 'Giờ giấc tự do', 'amenity', 17),
  ('cho-nuoi-thu-cung', 'Cho nuôi thú cưng', 'amenity', 18),
  ('khong-chung-chu', 'Không chung chủ', 'amenity', 19);

comment on column listing_tags.category is '''room_type'' (chọn 1, vd ở ghép/phòng riêng) hoặc ''amenity'' (chọn nhiều) — dùng để nhóm hiển thị và quyết định single-select ở UI TagPicker.';
