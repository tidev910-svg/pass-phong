"use client";

import { Card, Skeleton } from "antd";
import { ListingGridSkeleton } from "./ListingCardSkeleton";

/**
 * Skeleton cho `/tai-khoan` — mirror `ProfileHeaderCard` (avatar tròn + tên +
 * 3 số liệu) và phần nội dung tab mặc định ("Tin của tôi" — dùng lại
 * `ListingGridSkeleton`, KHÔNG viết riêng vì cùng là lưới `ListingCard`).
 * Đã chốt KHÔNG tách Suspense stream header/stats riêng ở đợt này — cả
 * trang chờ chung 1 skeleton này rồi hiện đủ dữ liệu 1 lần.
 */
export function ProfileSkeleton() {
  return (
    <div>
      <Card variant="borderless" className="board-panel">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Skeleton.Avatar active size={64} shape="square" style={{ borderRadius: 16 }} />
            <div>
              <Skeleton.Button active style={{ width: 160, height: 24 }} />
              <div style={{ marginTop: 8 }}>
                <Skeleton.Button active size="small" style={{ width: 200, height: 14 }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <Skeleton.Button active style={{ width: 36, height: 24 }} />
                <div style={{ marginTop: 6 }}>
                  <Skeleton.Button active size="small" style={{ width: 60, height: 12 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 24, marginTop: 24, borderBottom: "2px solid var(--border)", paddingBottom: 12 }}>
        <Skeleton.Button active style={{ width: 90, height: 22 }} />
        <Skeleton.Button active style={{ width: 130, height: 22 }} />
        <Skeleton.Button active style={{ width: 120, height: 22 }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <ListingGridSkeleton count={3} />
      </div>
    </div>
  );
}
