/** Format hiển thị dùng chung cho listing — tránh lặp ở nhiều component. */

export function formatPriceVnd(price: number): string {
  return `${price.toLocaleString("vi-VN")} đ`;
}

/** Giá rút gọn cho marker bản đồ (không đủ chỗ cho số đầy đủ) — vd "1,6tr đ", "900k đ". */
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    const trieu = price / 1_000_000;
    const label = Number.isInteger(trieu) ? String(trieu) : trieu.toFixed(1).replace(".", ",");
    return `${label}tr đ`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}k đ`;
  }
  return `${price} đ`;
}

/** Khoảng cách hiển thị ở badge card/marker cho chế độ "Tìm theo nhu cầu" —
 * vd "~350m", "~2,4km". Dưới 1km hiện theo mét cho dễ hình dung. */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) return `~${Math.round(distanceKm * 1000)}m`;
  return `~${distanceKm.toFixed(1).replace(".", ",")}km`;
}

export function formatMoveOutDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export function formatRelativeCreatedAt(isoDateTime: string): string {
  const diffMs = Date.now() - new Date(isoDateTime).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Vừa đăng";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} tháng trước`;
}
