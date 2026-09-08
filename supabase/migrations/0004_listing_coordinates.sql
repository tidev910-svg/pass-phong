-- Thêm toạ độ cho tin đăng — phục vụ view "danh sách + bản đồ" (/tim-tin/ban-do).
-- KHÔNG backfill giá trị giả cho tin cũ — để null, ẩn khỏi bản đồ nhưng vẫn
-- hiện bình thường trong danh sách (xử lý ở tầng domain/UI, không phải DB).

alter table listings
  add column lat double precision,
  add column lng double precision;

-- Ràng buộc toàn vẹn: có lat thì phải có lng và ngược lại (không cho lệch nửa vời).
alter table listings
  add constraint chk_lat_lng_together check ((lat is null) = (lng is null));

comment on column listings.lat is 'Vĩ độ WGS84 — null nếu tin chưa gắn vị trí (tin cũ, hoặc người đăng bỏ qua bước chọn vị trí trên map picker). Không backfill giá trị giả.';
comment on column listings.lng is 'Kinh độ WGS84 — xem comment cột lat.';
