# UI Style Guide — Pass Phòng Cần Thơ

> Dùng cùng với `PROJECT_BRIEF.md`. File này chỉ mô tả tinh thần và các "tiêu
> chuẩn cứng" cần giữ khi build UI — cách hiện thực hoá cụ thể trong code
> (tên biến, cấu trúc component) để Claude Code tự quyết định.
>
> **Lịch sử đổi hướng (2026-09-06, cùng 1 buổi làm việc):** tối giản-teal
> (bản gốc) → "Dorm Bulletin Board" (bảng tin ký túc xá) → tạm quay lại
> tối giản-phẳng màu xanh da trời → **quay lại "Dorm Bulletin Board"**, đây
> là chuẩn hiện hành. Chi tiết đầy đủ (token, layout device, checklist) nằm
> ở `.claude/skills/ui-ux-style/SKILL.md` — file này chỉ tóm tắt và nêu áp
> dụng cụ thể cho project.

## Tinh thần chung

Cảm giác một bảng tin ký túc xá thật: card tin đăng hơi nghiêng như được ghim
tay, có băng keo washi giữ giấy, viền cardboard/đứt nét, một chút chữ viết
tay — ấm áp, thủ công, hợp với đối tượng sinh viên. **Không phải** phong
cách SaaS tối giản phẳng lì.

Nền tảng: **vẫn dùng Ant Design cho toàn bộ component chính** (Card, Form,
Select, DatePicker, Button, Upload, Badge, Tag...). Đạt được thẩm mỹ dưới
đây bằng cách custom theme/token của antd (`src/theme/theme-config.ts`,
`src/theme/tokens.ts`) + CSS toàn cục (`src/app/globals.css`) + 1 vài
component trang trí nhỏ (`src/components/decor/TapeLabel.tsx`), không thay
thế antd bằng thư viện khác hay component tự viết từ đầu.

## Bảng màu — đúng 2 màu nhấn, không thêm màu thứ 3

| Token | Hex | Vai trò |
|---|---|---|
| `--paper` | `#F8F3E7` | Nền trang, giấy ivory |
| `--paper-card` | `#FFFDF6` | Nền card, sáng hơn nền trang một chút |
| `--ink` | `#2B2A24` | Chữ chính — KHÔNG dùng đen tuyệt đối `#000` |
| `--ink-soft` | `#5B584C` | Chữ phụ, mô tả, chú thích |
| `--forest` | `#2F5233` | Màu nhấn chính — nút, trạng thái active, link |
| `--forest-dark` | `#22401F` | Forest đậm hơn — dùng cho hard shadow |
| `--mustard` | `#E3A234` | Màu nhấn phụ — washi tape, giá tiền nổi bật |
| `--mustard-dark` | `#B77E1F` | Mustard đậm — chữ nhấn viết tay, badge |
| `--border` | `#DCD2B4` | Viền đứt nét, viền bảng |

Giá trị hex phải khớp giữa `src/app/globals.css` (`:root`) và
`src/theme/tokens.ts` — xem comment trong 2 file đó để hiểu vì sao không thể
dùng chung 1 nguồn duy nhất (antd cần hex thật để tính sắc độ theme).

## Typography

- **Heading:** Baloo 2, weight 700–800.
- **Body/UI:** Be Vietnam Pro, weight 400–600 (hỗ trợ tốt dấu tiếng Việt).
- **Viết tay (Caveat):** dùng RẤT tiết chế, tối đa 1-2 vị trí mỗi màn hình —
  hiện tại chỉ dùng ở nhãn "Tìm phòng nè!" trên filter bar
  (`TapeLabel.tsx`). Caveat KHÔNG có subset tiếng Việt đầy đủ trên Google
  Fonts (thiếu khối Unicode Extended) — chỉ dùng cho câu chữ chỉ có dấu
  Latin-1 cơ bản (à/á/ả/ã/ạ/è/ò/ì...), tránh chữ có dấu phức như "ầ", "ơ".

## Layout device bắt buộc

1. Nền chấm bi mờ (radial-gradient lặp lại) mô phỏng corkboard — không dùng
   ảnh texture nặng.
2. Panel dạng "bảng tin" (filter bar, form, card thông tin chi tiết): viền
   đứt nét (`--border`), bo góc vừa 16–20px, KHÔNG hard shadow — dùng qua
   class `board-panel` trong `globals.css`.
3. Nhãn băng keo washi có chữ (`TapeLabel`): nền mustard, chữ Caveat, xoay
   nhẹ `-4deg`, đặt đè lên mép trên panel.
4. Thẻ tin đăng (`ListingCard`): viền ink 2px, bo góc nhỏ 6px, hard offset
   shadow (không blur), nghiêng nhẹ **deterministic theo id tin**
   (`getCardTiltDeg`, -1.2°→0.8°) — không đổi giữa các lần render.
5. Băng keo washi KHÔNG chữ ghim ở mép trên mỗi thẻ tin đăng.
6. Chip/tag khu vực: bo tròn hết cỡ (999px) — nơi DUY NHẤT dùng mức bo góc
   này trong toàn bộ UI.
7. Nút chính (primary CTA): nền forest, chữ trắng, bo góc 10px, hard offset
   shadow `3px 3px 0 var(--forest-dark)`, bấm vào thì "lún" xuống (dịch về
   phía shadow) — không gradient, không shadow mờ.

## Việc cần tránh

- Không thêm màu nhấn thứ 3 ngoài forest/mustard (kể cả màu link mặc định
  của antd — đã fix ở `theme-config.ts` bằng `colorLink`).
- Không dùng gradient hay ảnh nền phức tạp trang trí.
- Không lạm dụng Caveat cho heading/body.
- Không tự động phát hiệu ứng load-in khi vào trang (fade-in/slide-up hàng
  loạt) — cảm giác "thủ công" đến từ layout tĩnh (nghiêng, băng keo), không
  phải chuyển động.
- Không bo góc đồng nhất 1 mức cho mọi khối — mỗi loại khối (board/card/
  button/chip) có mức bo góc riêng, đây là nguyên tắc cốt lõi của style này.

## Ngoại lệ đã ghi nhận

- **Trang `/admin`:** áp dụng token màu/font/button/input theo Dorm Bulletin
  Board, nhưng bảng danh sách tin (`AdminListingsTable`) giữ thẳng hàng —
  KHÔNG nghiêng, KHÔNG washi tape — vì đây là công cụ nội bộ cần dễ đọc/thao
  tác nhanh, không phải nội dung marketing.
- **Ảnh Open Graph** (`opengraph-image.tsx`): dùng font sans-serif hệ thống
  thay vì Baloo 2/Be Vietnam Pro vì `next/og` (Satori) cần fetch buffer font
  riêng — nằm ngoài phạm vi refactor UI thuần, có thể làm sau nếu cần.
- **Thẻ đăng nhập/đăng ký** (`.auth-card`, cộng thêm vào `board-panel`):
  CÓ hard offset shadow riêng (`5px 5px 0 rgba(43,42,36,0.9)`), khác với mọi
  board-panel khác (filter bar, form đăng tin...) vốn cố tình KHÔNG shadow —
  đây là điểm nhấn có chủ đích cho 2 trang gatekeeper của site, không áp
  dụng ngược lại cho các board-panel còn lại.
- **Trang `/bang-tin` (Bảng tin cá nhân hoá) — kiểu "bài đăng" Facebook**
  (cập nhật 2026-09-07, mở rộng từ ngoại lệ ban đầu): vẫn dùng đúng token màu
  forest/mustard và font Baloo 2/Be Vietnam Pro, nhưng đây là ngoại lệ layout
  sâu nhất trong site — khác cấu trúc DOM, không chỉ khác CSS, so với
  `ListingCard` (thẻ ghim bulletin-board dùng ở mọi nơi khác):
  1. **Feed 1 cột** (`FeedInfiniteList`), giới hạn bề rộng ~600px, căn giữa
     trang — KHÔNG phải lưới nhiều cột như trang chủ/hồ sơ/bản đồ.
  2. **`FeedPostCard`** thay hẳn `ListingCard` ở trang này: đứng thẳng
     (không tilt/washi tape), bo góc 14px, có phần đầu bài kiểu MXH (avatar
     tròn ghim màu forest lấy chữ cái đầu khu vực + tên khu vực + thời gian
     đăng), thân bài (bấm để xem chi tiết) gồm giá/mô tả/tag/ảnh full-width,
     và MỘT thanh hành động ngang tách biệt hẳn khỏi vùng bấm-xem-chi-tiết ở
     cuối thẻ (nút "Lưu tin" bên trái, "Xem chi tiết →" bên phải) — nút hành
     động KHÔNG được lồng vào trong link bọc thân bài (sai chuẩn HTML +
     xung đột điều hướng).
  3. Hover ở vùng thân bài có chuyển động nhẹ do trình duyệt xử lý mặc định
     (không cần custom) — thẻ không dùng hard-offset shadow "lún" như thẻ
     ghim/nút primary.
  4. Thanh chip lọc nhanh theo khu vực/sở thích đã chọn (`FeedFilterChipBar`)
     cuộn ngang, dùng cùng pill bo tròn 999px như `RegionTagSelect` — không
     thêm màu nhấn, chỉ thêm chiều cuộn ngang.
  5. **Nút "Lưu tin"** (`SaveListingButton`, bookmark 1 tin cụ thể — dữ liệu
     ở bảng `listing_saves`) dùng icon ghim (Pushpin, cùng motif "ghim lên
     bảng tin" đã dùng ở toast info) thay vì icon trái tim/bookmark chung
     chung — điểm neo duy nhất còn giữ tinh thần Dorm Bulletin Board trong
     1 thẻ vốn đã "hiện đại hoá" gần hết. Nút này cũng xuất hiện ở trang chi
     tiết tin (`ListingDetailView`, cạnh nút báo cáo) — không giới hạn chỉ ở
     `/bang-tin`.
  Vẫn KHÔNG phải redesign toàn trang — form thiết lập sở thích, empty
  state... trên `/bang-tin` tiếp tục theo đúng chuẩn `board-panel` như phần
  còn lại của site; chỉ riêng thẻ tin + layout feed là ngoại lệ.
