/** Format hiển thị dùng cho thông tin user — tránh lặp ở nhiều component. */

export function formatJoinedDate(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}/${date.getFullYear()}`;
}
