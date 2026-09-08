"use client";

import { Alert } from "antd";

/**
 * Wrapper "use client" mỏng quanh antd `Alert` — antd JSX KHÔNG được dùng
 * trực tiếp trong Server Component (throw `createContext is not a function`,
 * xem memory antd-nextjs-gotchas gotcha #1). Dùng ở các trang Server
 * Component cần hiển thị lỗi validate filter từ `searchParams` mà không làm
 * crash cả trang (vd `/` , `/tim-tin/ban-do` khi URL bị sửa tay ra giá trị
 * ngoài khoảng).
 */
export function ErrorAlert({ message }: { message: string }) {
  return <Alert type="error" showIcon title={message} style={{ marginBottom: 16 }} />;
}
