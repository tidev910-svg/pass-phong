"use client";

import { Skeleton } from "antd";
import { ListingGridSkeleton } from "./ListingCardSkeleton";

/**
 * Skeleton cho trang chủ `/` — mirror đủ khối phía trên lưới tin (tiêu đề,
 * filter bar, hàng nút bản đồ/lưu tìm kiếm), KHÔNG chỉ mỗi lưới — thiếu các
 * khối này gây nhảy layout ~200px khi nội dung thật load xong.
 * "use client" bắt buộc vì dùng trực tiếp `Skeleton` của antd — nếu để ở
 * `loading.tsx` (Server Component mặc định) sẽ vỡ y hệt bug đã gặp nhiều
 * lần trước (MapViewLink/SearchPagination/ProfileHeaderCard).
 */
export function HomeSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Skeleton.Button active style={{ width: 320, height: 30 }} />
        <div style={{ marginTop: 8 }}>
          <Skeleton.Button active size="small" style={{ width: 260, height: 14 }} />
        </div>
      </div>

      <div className="board-panel" style={{ marginBottom: 20, padding: 16 }}>
        {/* 2 hàng chip khu vực — mirror đúng số hàng chip thật (7 khu vực bọc
            dòng ở độ rộng desktop) để chiều cao không lệch nhiều khi filter
            bar thật (có thêm slider giá + input ngày) thay vào. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[100, 190, 190, 150, 100, 90, 110].map((w, i) => (
            <Skeleton.Button key={i} active shape="round" style={{ width: w, height: 32 }} />
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <Skeleton.Button active size="small" style={{ width: 180, height: 14 }} />
          <Skeleton.Button active style={{ width: "100%", height: 4, marginTop: 12 }} block />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Skeleton.Button active style={{ width: 200, height: 32 }} />
          <Skeleton.Button active style={{ width: 110, height: 32 }} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Skeleton.Button active shape="round" style={{ width: 110, height: 32 }} />
        <Skeleton.Button active shape="round" style={{ width: 150, height: 32 }} />
      </div>

      <ListingGridSkeleton />
    </div>
  );
}
