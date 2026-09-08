/** Formatter/parser dùng cho antd `InputNumber` khi nhập giá — tránh lặp ở các form. */
export function formatVndInput(value: number | string | undefined): string {
  if (value === undefined || value === "") return "";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "";
  return `${numeric.toLocaleString("vi-VN")}`;
}

export function parseVndInput(value: string | undefined): number {
  if (!value) return 0;
  const digitsOnly = value.replace(/[^\d]/g, "");
  return digitsOnly ? Number(digitsOnly) : 0;
}
