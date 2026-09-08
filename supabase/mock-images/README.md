# Ảnh mock (test only)

8 ảnh SVG giả lập (đặt cạnh `supabase/mock-data.sql` vì cùng mục đích: dữ liệu
test cho môi trường dev, không phải asset chính thức của sản phẩm) — dùng để
test tính năng upload ảnh/hiển thị card tin đăng mà không cần ảnh phòng thật.

Mỗi ảnh: tỷ lệ 16:9 (khớp tỷ lệ ảnh dùng trong `ListingCard`/`ListingDetailView`),
màu pastel khác nhau, có chữ "Ảnh mock — không phải ảnh thật" để không ai
nhầm là ảnh phòng thật nếu lỡ thấy ở đâu đó.

## Dùng thế nào

- **Thủ công**: đăng nhập 1 tài khoản mock (`mock_sv1` / `Test1234`, xem
  `mock-data.sql`), vào `/dang-tin`, chọn 1-2 file trong thư mục này ở bước
  tải ảnh.
- **Gắn hàng loạt vào 15 tin mock có sẵn**: hiện `mock-data.sql`/dữ liệu đã
  nhập không có ảnh (SQL không upload được file nhị phân). Nếu muốn tự động
  gắn ảnh vào các tin mock đã có qua Supabase Storage, nói để mình viết thêm
  1 script upload — không tự chạy vì cần bạn xác nhận trước (ghi dữ liệu
  lên Supabase Storage thật của bạn).

## Dọn dẹp

Thư mục này không được reference bởi code (`src/`) — an toàn để xoá bất cứ
lúc nào nếu không cần nữa.
