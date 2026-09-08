-- Cho phép admin khoá tài khoản (chặn đăng nhập) từ web admin riêng
-- (PASS_PHONG_ADMIN, không nằm trong repo này). Dùng boolean thay vì
-- status text vì chỉ cần đúng 2 trạng thái (đăng nhập được / không) —
-- không cần enum hoá sớm khi chưa có nhu cầu thật.

alter table users add column is_locked boolean not null default false;

comment on column users.is_locked is 'true = tài khoản bị admin khoá, chặn đăng nhập (xem src/domain/auth/service.ts:authenticateUser). Chỉ đổi được từ web admin riêng, không có UI nào ở web chính.';
