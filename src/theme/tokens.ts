/**
 * Nguồn DUY NHẤT cho token thẩm mỹ "Dorm Bulletin Board" (xem
 * `.claude/skills/ui-ux-style/SKILL.md` và `UI_STYLE_GUIDE.md`).
 *
 * Giá trị màu ở đây PHẢI khớp với CSS custom properties `:root` trong
 * `src/app/globals.css` — không thể dùng thẳng `var(--forest)` cho token antd
 * (colorPrimary...) vì antd tính các sắc độ hover/active bằng thuật toán màu
 * (TinyColor) tại thời điểm dựng theme, cần giá trị hex cụ thể, không resolve
 * được CSS variable. Nếu đổi 1 giá trị, phải sửa cả 2 nơi.
 */

// --- Bảng màu (đúng 2 màu nhấn: forest + mustard, không thêm màu thứ 3) ---
export const COLOR_PAPER = "#FFFFFF";
export const COLOR_PAPER_CARD = "#FFFDF6";
export const COLOR_INK = "#2B2A24";
export const COLOR_INK_SOFT = "#5B584C";
export const COLOR_FOREST = "#2F5233";
export const COLOR_FOREST_DARK = "#22401F";
export const COLOR_MUSTARD = "#E3A234";
export const COLOR_MUSTARD_DARK = "#B77E1F";
export const COLOR_BORDER = "#DCD2B4";

// Token bổ sung riêng cho skill "loading-toast-feedback-style" — chỉ dùng
// cho toast lỗi (KHÔNG dùng làm màu nhấn thứ 3 ở nơi khác, palette chính
// vẫn đúng 2 màu forest + mustard).
export const COLOR_DANGER = "#C0433A";
export const COLOR_DANGER_BG = "#FBEAE8";

// Giữ tên cũ để không phải sửa mọi import trong component đã có sẵn — giờ
// trỏ sang forest (màu nhấn chính) thay vì teal cũ.
export const COLOR_PRIMARY = COLOR_FOREST;
export const COLOR_PRIMARY_SOFT = "#EDE6CE";

// --- Bo góc: mỗi loại khối một mức riêng biệt (nguyên tắc cốt lõi của style
// này — KHÔNG dùng chung 1 giá trị bo góc cho mọi thứ như bản teal cũ). ---
export const RADIUS_BOARD = 18; // panel dạng "bảng tin": filter bar, form, card thông tin
export const RADIUS_PINNED_CARD = 6; // thẻ tin đăng — như tờ giấy ghim, bo rất nhỏ
// Bo góc thẻ ở Bảng tin (/bang-tin, `FeedPostCard`) — kiểu Facebook post,
// đứng thẳng, bo lớn hơn thẻ ghim nhưng nhỏ hơn panel. Xem ngoại lệ style ở
// UI_STYLE_GUIDE.md. Giá trị hardcode trong `FeedPostCard.module.css` (giống
// cách RADIUS_PINNED_CARD=6 cũng hardcode ở `.pinnedCard`) — hằng số này chỉ
// để tài liệu hoá, không đọc runtime.
export const RADIUS_FEED_POST = 14;
export const RADIUS_BUTTON = 10;
export const RADIUS_INPUT = 10;
export const RADIUS_PILL = 999; // CHỈ dùng cho chip/tag khu vực

// --- Shadow: hard offset (không blur), không dùng shadow mờ mặc định của antd ---
export const SHADOW_PINNED_CARD = "5px 5px 0 rgba(43, 42, 36, 0.9)";
export const SHADOW_PINNED_CARD_HOVER = "7px 7px 0 rgba(43, 42, 36, 0.9)";
export const SHADOW_BUTTON_PRIMARY = `3px 3px 0 ${COLOR_FOREST_DARK}`;
export const SHADOW_BUTTON_PRIMARY_PRESSED = `1px 1px 0 ${COLOR_FOREST_DARK}`;
// Toast/thông báo dùng shadow nhỏ hơn thẻ ghim (không phải "tờ giấy ghim
// trên bảng" — nó nổi phía trên trang, xem loading-toast-feedback-style).
export const SHADOW_TOAST = "4px 4px 0 rgba(43, 42, 36, 0.9)";
export const TRANSITION_FAST = "180ms ease";

export const PRICE_FONT_SIZE = 20;
export const PRICE_FONT_WEIGHT = 700;
export const CAPTION_COLOR = COLOR_INK_SOFT;

// --- Font: Baloo 2 (heading), Be Vietnam Pro (body), Pacifico (viết tay,
// dùng rất tiết chế — xem TapeLabel.tsx, Logo.tsx). Pacifico thay Caveat vì
// Caveat không có subset "vietnamese" (vỡ chữ ở "ầ", "ơ"...). ---
export const FONT_HEADING = "var(--font-baloo-2), 'Segoe UI', sans-serif";
export const FONT_BODY = "var(--font-be-vietnam-pro), 'Segoe UI', sans-serif";
export const FONT_HANDWRITTEN = "var(--font-pacifico), cursive";
export const FONT_FAMILY = FONT_BODY; // giữ tên cũ cho chỗ còn import

// --- Độ nghiêng thẻ tin: deterministic theo id tin, KHÔNG đổi giữa các lần
// render (yêu cầu bắt buộc của style) — hash đơn giản từ chuỗi id. ---
const CARD_TILT_OPTIONS_DEG = [-1.2, -0.6, -0.1, 0.4, 0.8, -0.9, 0.2] as const;

export function getCardTiltDeg(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return CARD_TILT_OPTIONS_DEG[Math.abs(hash) % CARD_TILT_OPTIONS_DEG.length];
}
