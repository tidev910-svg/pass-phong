-- Thêm thông tin hồ sơ cho users — phục vụ trang /tai-khoan.
-- is_verified_student mặc định false và KHÔNG có cơ chế xác thực thật nào đi
-- kèm ở bản này (đã thống nhất với chủ dự án ngày 2026-09-06) — UI sẽ không
-- hiển thị badge "Sinh viên đã xác thực" ở bất kỳ đâu cho tới khi có cơ chế
-- xác thực thật (email trường hoặc admin duyệt thủ công) được quyết định và
-- xây dựng riêng.

alter table users
  add column display_name text,
  add column phone_or_zalo text,
  add column is_verified_student boolean not null default false;

comment on column users.is_verified_student is 'Luôn false ở bản này — CHƯA có cơ chế xác thực thật đứng sau cột này. Không hiển thị badge xác thực cho tới khi có cơ chế thật.';
