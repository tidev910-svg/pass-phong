"use client";

import Link from "next/link";
import { Button } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

/**
 * Tách riêng thành Client Component vì `@ant-design/icons` dùng React
 * Context nội bộ — import trực tiếp trong Server Component (trang chủ,
 * `page.tsx`) gây lỗi runtime "createContext is not a function".
 *
 * `type="primary"` — đây là hành động điều hướng sang cả 1 tính năng khác
 * (xem trên bản đồ), nặng ký hơn "Lưu tìm kiếm này" (chỉ là tiện ích phụ,
 * vẫn giữ outline mặc định) — nên phải nổi bật hơn, khớp đúng cách nút
 * "Tìm phòng" đang được style (nền forest, chữ trắng, hard shadow forest-dark
 * — có sẵn từ `.ant-btn-primary` toàn cục trong globals.css, không cần thêm gì).
 */
export function MapViewLink({ href }: { href: string }) {
  return (
    <Link href={href}>
      <Button type="primary" icon={<EnvironmentOutlined />}>
        Xem trên bản đồ
      </Button>
    </Link>
  );
}
