# Pass Phòng Cần Thơ — Project Brief

> Đặt file này ở gốc project với tên `CLAUDE.md` để Claude Code tự đọc khi mở
> thư mục dự án. Đây là mô tả mục tiêu và tính năng — cách triển khai cụ thể
> (cấu trúc thư mục, schema chi tiết, luồng code) để Claude Code tự quyết định
> dựa trên best practice của stack đã chọn.
>
> **Ghi chú tiến độ (cập nhật 2026-09-08):** đây là brief gốc viết trước khi
> build — toàn bộ checklist trong file đã triển khai xong và dự án đã mở
> rộng thêm một số tính năng ngoài phạm vi ban đầu (xem mục "Đã mở rộng thêm
> ngoài phạm vi ban đầu" bên dưới). Chi tiết triển khai/pitfall từng tính
> năng không ghi ở đây — nằm ở memory dự án
> (`pass-phong-project-status.md`), file này chỉ giữ vai trò mô tả mục
> tiêu/phạm vi sản phẩm ở tầm cao.

## Bối cảnh

Sinh viên/người thuê trọ ở Cần Thơ (chủ yếu quanh Đại học Cần Thơ) cần "pass
phòng" — sang nhượng cọc hoặc thuê lại phòng còn hạn hợp đồng — hiện chỉ dựa
vào các group Facebook. Đây là bảng tin một chiều: người dùng phải tự lướt
tìm, dễ bỏ lỡ tin phù hợp vì tin trôi theo thời gian. Các nền tảng phòng trọ
lớn (Phongtro123, Chợ Tốt...) có tin pass phòng nhưng trộn lẫn trong tin cho
thuê thường, không có luồng riêng và không giúp người dùng chủ động biết khi
có tin mới khớp nhu cầu.

## Sản phẩm cần xây

Một website MVP nhỏ, phạm vi chỉ Cần Thơ, cho phép:

- Đăng tin pass phòng (khu vực, giá, ngày cần pass, mô tả, ảnh, cách liên hệ).
- Tìm kiếm tin theo khu vực, khoảng giá, ngày cần pass.
- Lưu lại một tìm kiếm đã thực hiện, để khi quay lại web thấy được có bao
  nhiêu tin mới khớp với tìm kiếm đó — không cần thông báo đẩy (không cần
  email/SMS/Zalo/push), chỉ cần hiển thị khi người dùng tự quay lại xem.

Mục tiêu giai đoạn này: launch nhanh, tự đăng bài giới thiệu trong các group
Facebook sinh viên Cần Thơ để đo phản ứng thật, làm căn cứ quyết định có scale
tiếp hay không.

## Tính năng cần có

Toàn bộ mục này đã triển khai xong.

- Đăng ký/đăng nhập đơn giản (username + password, không cần xác thực
  email/SĐT lúc tạo tài khoản).
- Đăng tin pass phòng — chỉ người đã đăng nhập mới đăng được, và bắt buộc
  phải để lại ít nhất một cách liên hệ (số điện thoại hoặc link
  Facebook/Instagram) thì mới được đăng.
- Tìm kiếm/lọc tin theo khu vực, giá, ngày cần pass — khu vực nên dùng danh
  sách cố định (không phải text tự do) để lọc/so khớp chính xác. Danh sách
  khu vực gợi ý (có thể điều chỉnh nếu Claude Code thấy hợp lý hơn): Ninh
  Kiều (khu gần ĐH Cần Thơ khu 2), Ninh Kiều (khu gần ĐH Cần Thơ khu 3), Ninh
  Kiều (khu vực khác), Bình Thủy, Cái Răng, Ô Môn, khu vực khác.
- Lưu tìm kiếm (giới hạn vài lượt lưu mỗi người là đủ, không cần nhiều) và
  hiển thị số tin mới khớp mỗi khi người dùng quay lại.
- Xem chi tiết một tin, bao gồm thông tin liên hệ.
- Giao diện phải responsive, ưu tiên trải nghiệm trên điện thoại (mobile-first)
  — vì đối tượng người dùng hiện quen thao tác/lướt tin trên FB group bằng
  điện thoại là chủ yếu.

### Đã mở rộng thêm ngoài phạm vi ban đầu

- **Bảng tin cá nhân hoá** (`/bang-tin`) — feed tin đăng chấm điểm theo khu
  vực, khoảng cách, giá, tag quan tâm và độ mới, thay vì chỉ xem theo tìm
  kiếm thủ công.
- **Tìm theo nhu cầu** — chọn 1 điểm trên bản đồ + bán kính thay vì chỉ lọc
  theo khu vực cố định, có ở cả trang chủ và trang bản đồ (`/tim-tin/ban-do`).
- **Lưu tin** (bookmark 1 tin cụ thể) — khác với lưu tìm kiếm, xem lại ở tab
  "Tin đã lưu" trong trang tài khoản.
- **Tag phòng/tiện ích** khi đăng tin (loại phòng, máy lạnh...) để lọc/hiển
  thị chi tiết hơn.
- **Khoá/mở khoá tài khoản người dùng** — quản lý từ web admin riêng, chặn
  đăng nhập ngay lập tức khi bị khoá.

## Tính năng KHÔNG cần làm ở bản này

Chat trong app, hệ thống review/đánh giá, xác minh danh tính hoặc xác minh
chủ nhà đồng ý chuyển nhượng, thanh toán/giữ cọc, thông báo đẩy, thuật toán
gợi ý/matching tự động phức tạp, mở rộng ngoài Cần Thơ, kiểm duyệt tin tự
động. Nếu còn dư thời gian, một nút "báo cáo tin" đơn giản là điểm cộng
nhưng không bắt buộc.

**Ngoại lệ đã xảy ra:** "thuật toán gợi ý/matching tự động phức tạp" ở trên
vẫn là định hướng đúng cho các tính năng *mới*, nhưng bảng tin cá nhân hoá
(mục "Đã mở rộng thêm" ở trên) đã được xây theo yêu cầu rõ ràng của người
dùng sau này — dùng công thức chấm điểm tuyến tính đơn giản, không phải ML,
nên không hoàn toàn giống thứ mục này muốn loại trừ ban đầu. Không xoá dòng
gốc, chỉ ghi nhận ngoại lệ.

## Yêu cầu về cấu trúc code

Cấu trúc dự án và logic code cần rõ ràng, tách bạch, dễ tái sử dụng — ưu tiên
khả năng mở rộng về sau (thêm tính năng, thêm khu vực ngoài Cần Thơ, tăng
traffic) hơn là chỉ code cho chạy được nhanh nhất. Cụ thể:

- Tách rõ phần logic nghiệp vụ (business logic: tạo tin, tìm kiếm, tính số
  tin mới cho saved search...) khỏi phần trình bày UI và khỏi chi tiết hạ
  tầng (Supabase, Next.js API routes) — để sau này đổi hạ tầng hoặc thêm
  tính năng không phải viết lại từ đầu.
- Tránh lặp code: các phần dùng chung (validate input, gọi database, format
  dữ liệu hiển thị...) nên được tách thành hàm/module dùng lại được, không
  copy-paste giữa các trang.
- Đặt tên và tổ chức file theo quy ước nhất quán, dễ đoán, để mở rộng thêm
  tính năng mới không phá vỡ cấu trúc hiện có.
- Cách tổ chức cụ thể (thư mục, pattern, tên file) để Claude Code tự quyết
  định theo best practice phù hợp với Next.js — không cần áp một khuôn cứng
  nhắc từ trước.

## Ràng buộc và lựa chọn đã chốt

- Stack: Next.js làm cả frontend và backend (API routes), Supabase (Postgres +
  Storage) cho dữ liệu và ảnh, deploy trên Vercel — tất cả ở gói miễn phí cho
  giai đoạn MVP.
- UI: vẫn ưu tiên dùng Ant Design cho các component chính (Card, Form, Select,
  DatePicker, Button, Upload, Badge...) thay vì tự viết component từ đầu hay
  đổi sang thư viện khác — đạt yêu cầu "tối giản hiện đại, có sức hút" bằng
  cách custom theme của antd (màu, bo góc, khoảng cách, shadow nhẹ) và bổ sung
  ảnh/vi tương tác, không phải bằng cách thay thế antd.
- Auth tự viết đơn giản (hash password + session), không cần dùng giải pháp
  auth nặng cho quy mô này.
- Phong cách UI: **"Dorm Bulletin Board"** (bảng tin ký túc xá — chuẩn hiện
  hành, cập nhật 2026-09-06). Xem chi tiết đầy đủ ở `UI_STYLE_GUIDE.md` và
  `.claude/skills/ui-ux-style/SKILL.md`: nền giấy ivory, 2 màu nhấn forest +
  mustard, thẻ tin đăng nghiêng nhẹ có washi tape, font Baloo 2 (heading) +
  Be Vietnam Pro (body) + Caveat (viết tay, rất tiết chế). Project admin
  riêng (`PASS_PHONG_ADMIN`, xem bên dưới) là ngoại lệ đã ghi nhận: dùng
  token màu/font/button nhưng bảng dữ liệu giữ thẳng hàng, không nghiêng/
  không washi tape.
  (Trong cùng buổi 2026-09-06, dự án đã thử qua 3 hướng: teal-minimalist gốc
  → Dorm Bulletin Board → xanh da trời-phẳng → quay lại Dorm Bulletin Board.
  Nếu cần đổi hướng lần nữa, nói rõ để cập nhật lại file này.)
- Có thẻ Open Graph cơ bản (tiêu đề, mô tả, ảnh preview) cho trang chủ, vì
  link sẽ được chia sẻ vào group Facebook để marketing — link xấu/không có
  preview sẽ giảm tỷ lệ click ngay từ đầu.
- **Trang quản trị đã tách thành project Next.js độc lập hoàn toàn**
  (`PASS_PHONG_ADMIN`, thư mục ngang hàng với `PASS_PHONG` — không phải 1
  route con của web chính như bản đầu). Chạy local trên máy admin (chưa
  deploy), dùng chung 1 Supabase project/database với web chính nhưng không
  share code. Đăng nhập bằng tài khoản admin riêng (username + password, hỗ
  trợ nhiều admin) thay vì 1 mã bí mật dùng chung. Ngoài xem toàn bộ tin
  đăng + xoá tin rác/spam thủ công (không có kiểm duyệt tự động), đã có
  thêm: xem tin bị báo cáo, bộ lọc/tìm kiếm trên bảng tin, dashboard số liệu
  (bám theo mục "Cách đánh giá thành công" bên dưới), khoá/mở khoá tài
  khoản người dùng.
- Có một trang/đoạn Điều khoản sử dụng ngắn, nêu rõ: web chỉ đóng vai trò kết
  nối giữa người đăng và người xem tin, không xác minh thông tin phòng/chủ
  nhà/cọc, không chịu trách nhiệm về giao dịch giữa hai bên — để bảo vệ nền
  tảng và giúp người dùng hiểu đúng vai trò của web.

## Đo lường

Đã gắn Vercel Analytics (`@vercel/analytics`, đi kèm tự nhiên khi deploy
Vercel — lý do chọn thay vì Google Analytics) kèm custom event tracking ở
`src/lib/analytics/track.ts` cho 3 mốc quan trọng nhất trong mục "Cách đánh
giá thành công" bên dưới: lưu tìm kiếm (`saved_search_created`), xác nhận đã
pass (`pass_confirmed`), quay lại web (`returning_visit`). Nếu không có công
cụ đo, sẽ không có căn cứ để đánh giá sau giai đoạn test.

## Cách đánh giá thành công

Sau khi launch và marketing trong group Facebook, các chỉ số quan trọng để
quyết định có scale tiếp không: tỷ lệ người tìm kiếm có lưu lại tìm kiếm, tỷ
lệ quay lại web trong vòng 7 ngày, số tin đăng thật có thông tin liên hệ hợp
lệ, và quan trọng nhất là có bao nhiêu người xác nhận đã pass/nhận phòng
thành công nhờ web.