import { formatPriceVnd } from "@/domain/listings/format";
import { COLOR_INK_SOFT, COLOR_MUSTARD_DARK, PRICE_FONT_SIZE, PRICE_FONT_WEIGHT } from "@/theme/tokens";

/**
 * Giá tiền là thông tin người dùng quét mắt tìm đầu tiên — luôn hiển thị qua
 * component này để cỡ chữ/màu nhấn nhất quán toàn site. Dùng mustard-dark
 * (không phải forest) vì skill ui-ux-style gán rõ vai trò "highlighted price"
 * cho mustard, giữ forest cho nút/trạng thái chính.
 *
 * `muted`: dùng cho tin đã pass ở trang hồ sơ — đổi sang ink-soft để giảm độ
 * nổi bật, không còn kéo mắt như tin đang hiển thị bình thường.
 */
export function Price({ value, size = "md", muted = false }: { value: number; size?: "md" | "lg"; muted?: boolean }) {
  return (
    <span
      style={{
        color: muted ? COLOR_INK_SOFT : COLOR_MUSTARD_DARK,
        fontWeight: PRICE_FONT_WEIGHT,
        fontSize: size === "lg" ? PRICE_FONT_SIZE * 1.4 : PRICE_FONT_SIZE,
        lineHeight: 1.2,
      }}
    >
      {formatPriceVnd(value)}
    </span>
  );
}
