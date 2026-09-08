"use client";

import { Card, Skeleton } from "antd";

/**
 * Skeleton dùng chung cho 2 route render `ListingForm` (`/dang-tin`,
 * `/tin/[id]/sua`) — mirror khối tiêu đề + 5 field (khu vực/giá/ngày/mô
 * tả/liên hệ) + nút submit full-width, cùng `max-width: 640` với form thật
 * để không có layout shift.
 */
export function FormCardSkeleton() {
  return (
    <Card
      variant="borderless"
      className="board-panel"
      style={{ maxWidth: 640, margin: "0 auto" }}
      styles={{ body: { padding: 24 } }}
    >
      <Skeleton.Button active style={{ width: 220, height: 28 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton.Button key={i} active block style={{ height: 40, marginTop: i === 0 ? 20 : 16 }} />
      ))}
      <Skeleton.Button active block style={{ height: 40, marginTop: 24 }} />
    </Card>
  );
}
