"use client";

import { useRouter } from "next/navigation";
import { Pagination } from "antd";

/**
 * Client Component riêng vì antd `Pagination` cần Context nội bộ — không
 * dùng trực tiếp được trong Server Component (trang chủ, `page.tsx`), giống
 * lý do tách `MapViewLink.tsx`. Nhận filter hiện tại dạng giá trị nguyên
 * thuỷ (không phải callback — không truyền được function qua ranh giới
 * Server → Client Component) để tự dựng lại URL khi đổi trang.
 */
export function SearchPagination({
  current,
  total,
  pageSize,
  regionId,
  priceMin,
  priceMax,
  moveOutDateTo,
}: {
  current: number;
  total: number;
  pageSize: number;
  regionId?: number;
  priceMin?: number;
  priceMax?: number;
  moveOutDateTo?: string;
}) {
  const router = useRouter();

  function hrefFor(page: number): string {
    const params = new URLSearchParams();
    if (regionId) params.set("regionId", String(regionId));
    if (priceMin) params.set("priceMin", String(priceMin));
    if (priceMax) params.set("priceMax", String(priceMax));
    if (moveOutDateTo) params.set("moveOutDateTo", moveOutDateTo);
    params.set("page", String(page));
    return `/?${params.toString()}`;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
      <Pagination
        current={current}
        total={total}
        pageSize={pageSize}
        showSizeChanger={false}
        onChange={(page) => router.push(hrefFor(page))}
      />
    </div>
  );
}
