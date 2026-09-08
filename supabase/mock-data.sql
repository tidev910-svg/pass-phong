-- Dữ liệu MẪU (mock) để test giao diện/luồng nghiệp vụ trên Supabase thật —
-- KHÔNG phải seed production (khác với migrations/seed.sql chỉ chứa danh
-- sách khu vực). Chạy file này thủ công trong Supabase SQL Editor SAU KHI đã
-- chạy đủ 3 migration + seed.sql.
--
-- An toàn chạy nhiều lần: user dùng `on conflict (username) do nothing`,
-- listings/saved_searches sẽ tạo thêm bản ghi mới mỗi lần chạy — nếu muốn
-- chạy lại từ đầu, xoá dữ liệu cũ bằng câu lệnh cleanup ở cuối file trước.
--
-- Toàn bộ user mock đặt tên tiền tố "mock_" để dễ nhận diện & dọn dẹp, KHÔNG
-- lẫn với dữ liệu người dùng thật khi lên production.
--
-- Mật khẩu chung cho mọi user mock: Test1234
-- (dùng pgcrypto crypt()/gen_salt('bf') để tạo hash bcrypt tương thích với
-- bcryptjs mà app đang dùng ở src/domain/auth/service.ts — không cần chạy
-- Node để hash thủ công).

-- 1) Users mock ------------------------------------------------------------

insert into users (username, password_hash) values
  ('mock_sv1', crypt('Test1234', gen_salt('bf'))),
  ('mock_sv2', crypt('Test1234', gen_salt('bf'))),
  ('mock_sv3', crypt('Test1234', gen_salt('bf'))),
  ('mock_sv4', crypt('Test1234', gen_salt('bf'))),
  ('mock_sv5', crypt('Test1234', gen_salt('bf')))
on conflict (username) do nothing;

-- 2) Listings mock — trải đều các khu vực, giá, ngày cần pass --------------
-- (Không kèm ảnh: SQL không upload được file nhị phân vào Storage bucket.
-- Muốn có ảnh thật, đăng nhập bằng 1 trong các tài khoản mock rồi dùng form
-- /dang-tin để upload — UI đã tự xử lý trường hợp không có ảnh bằng placeholder.)

insert into listings (user_id, region_id, price, move_out_date, description, contact_phone, contact_link, status) values
  ((select id from users where username = 'mock_sv1'),
   (select id from regions where slug = 'ninh-kieu-khu2'),
   1600000, '2026-09-15',
   'Phòng trọ sát cổng sau ĐH Cần Thơ khu 2, còn 4 tháng hợp đồng, cần pass gấp do chuyển ra ở ghép với bạn. Phòng có gác lửng, máy lạnh, wifi riêng.',
   '0901234567', null, 'active'),

  ((select id from users where username = 'mock_sv2'),
   (select id from regions where slug = 'ninh-kieu-khu2'),
   2200000, '2026-09-20',
   'Căn hộ mini gần cổng 2 ĐHCT, có ban công, an ninh tốt, giờ giấc tự do. Pass lại vì mình chuyển công tác.',
   null, 'https://facebook.com/mai.nguyen.ct', 'active'),

  ((select id from users where username = 'mock_sv3'),
   (select id from regions where slug = 'ninh-kieu-khu3'),
   1400000, '2026-09-10',
   'Phòng trọ khu 3, gần chợ, có gác, gần siêu thị mini. Còn hợp đồng tới cuối năm.',
   '0912345678', null, 'active'),

  ((select id from users where username = 'mock_sv4'),
   (select id from regions where slug = 'ninh-kieu-khu3'),
   1800000, '2026-10-01',
   'Phòng đẹp, mới sửa lại, có cửa sổ thoáng, gần bến xe buýt tới trường.',
   '0923456789', 'https://facebook.com/linh.pham.ct', 'active'),

  ((select id from users where username = 'mock_sv5'),
   (select id from regions where slug = 'ninh-kieu-khac'),
   3200000, '2026-10-05',
   'Căn hộ dịch vụ đầy đủ nội thất, khu trung tâm Ninh Kiều, phù hợp đi làm lẫn đi học.',
   null, 'https://facebook.com/phong.tran.90', 'active'),

  ((select id from users where username = 'mock_sv1'),
   (select id from regions where slug = 'ninh-kieu-khac'),
   2600000, '2026-11-01',
   'Phòng có gác lửng, gần Vincom, tiện đi lại, chủ nhà dễ chịu.',
   '0987654321', null, 'active'),

  ((select id from users where username = 'mock_sv2'),
   (select id from regions where slug = 'binh-thuy'),
   1200000, '2026-09-25',
   'Phòng trọ giá sinh viên khu Bình Thủy, gần chợ Bình Thủy, yên tĩnh.',
   '0933221100', null, 'active'),

  ((select id from users where username = 'mock_sv3'),
   (select id from regions where slug = 'binh-thuy'),
   1500000, '2026-10-10',
   'Phòng mới, có kệ bếp, máy nước nóng, gần trường Cao đẳng Cần Thơ.',
   null, 'https://facebook.com/khoa.le.ct', 'active'),

  ((select id from users where username = 'mock_sv4'),
   (select id from regions where slug = 'cai-rang'),
   1100000, '2026-09-18',
   'Phòng trọ khu Cái Răng, gần cầu Cái Răng, hợp đồng còn 6 tháng.',
   '0977889900', null, 'active'),

  ((select id from users where username = 'mock_sv5'),
   (select id from regions where slug = 'cai-rang'),
   2000000, '2026-10-15',
   'Nhà nguyên căn nhỏ cho thuê lại, có sân để xe, phù hợp ở ghép 2-3 người.',
   '0966554433', null, 'active'),

  ((select id from users where username = 'mock_sv4'),
   (select id from regions where slug = 'o-mon'),
   900000, '2026-09-12',
   'Phòng trọ giá rẻ khu Ô Môn, gần chợ, phù hợp sinh viên đi làm thêm khu công nghiệp Trà Nóc.',
   null, 'https://facebook.com/linh.pham.omon', 'active'),

  ((select id from users where username = 'mock_sv2'),
   (select id from regions where slug = 'o-mon'),
   1300000, '2026-11-05',
   'Phòng có gác, gần trường THPT Thới Long, an ninh khu vực tốt.',
   '0955443322', null, 'active'),

  ((select id from users where username = 'mock_sv3'),
   (select id from regions where slug = 'khac'),
   1700000, '2026-09-30',
   'Phòng trọ xa trung tâm nhưng giá tốt, gần bến phà, yên tĩnh phù hợp học bài.',
   '0944332211', null, 'active'),

  -- Tin đã pass thành công — để test badge "Đã pass thành công" trên card/chi tiết.
  ((select id from users where username = 'mock_sv5'),
   (select id from regions where slug = 'ninh-kieu-khu2'),
   1900000, '2026-08-20',
   'Đã pass thành công cho một bạn sinh viên năm nhất, cảm ơn mọi người đã quan tâm tin!',
   '0900000000', null, 'passed'),

  -- Tin đã bị xoá (giả lập admin xoá tin rác) — để test /admin lọc theo trạng thái
  -- và test trang chủ/tìm kiếm KHÔNG hiển thị tin này.
  ((select id from users where username = 'mock_sv1'),
   (select id from regions where slug = 'binh-thuy'),
   2500000, '2026-09-08',
   'Tin test đã bị xoá (dùng để kiểm tra admin ẩn tin vi phạm).',
   '0900000001', null, 'deleted')
;

-- Set passed_confirmed_at cho tin đã pass ở trên (không đặt được trong VALUES
-- vì cột này default null và không có trong danh sách insert phía trên).
update listings
set passed_confirmed_at = now() - interval '5 days'
where status = 'passed'
  and user_id = (select id from users where username = 'mock_sv5')
  and passed_confirmed_at is null;

-- 3) Saved searches mock cho mock_sv1 ---------------------------------------
-- last_viewed_at đặt trong quá khứ để các listing vừa insert ở trên (created_at
-- = now()) được tính là "tin mới" — vào /tim-kiem-da-luu bằng mock_sv1/Test1234
-- sẽ thấy badge số tin mới khớp ngay, không cần đợi có tin thật.

insert into saved_searches (user_id, region_id, price_max, last_viewed_at) values
  ((select id from users where username = 'mock_sv1'),
   (select id from regions where slug = 'ninh-kieu-khu2'),
   2000000,
   now() - interval '30 days'),
  ((select id from users where username = 'mock_sv1'),
   null,
   1500000,
   now() - interval '20 days');

-- 4) Cleanup (bỏ comment để chạy khi muốn xoá sạch dữ liệu mock) ------------
-- Xoá user sẽ cascade xoá luôn listings + saved_searches của user đó (FK
-- on delete cascade ở 0001_init.sql/0002_saved_searches.sql).

-- delete from users where username like 'mock_%';
