"use client";

import { Skeleton } from "antd";
import { ListingCardSkeletonItem } from "./ListingCardSkeleton";

/**
 * Skeleton cho `/tim-tin/ban-do` — mirror khung toolbar + sidebar 340px của
 * `MapSearchView`. Khối bản đồ chỉ để phẳng màu paper (không giả lập tile
 * OpenStreetMap) — bản đồ Leaflet tự tải tile độc lập ngay khi DOM sẵn
 * sàng, không phụ thuộc skeleton này.
 */
export function MapPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--paper)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "14px 20px",
          borderBottom: "2px dashed var(--border)",
          background: "var(--paper-card)",
        }}
      >
        <Skeleton.Button active shape="round" style={{ width: 240, height: 32 }} />
        <Skeleton.Button active style={{ width: 220, height: 32 }} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ width: 340, flex: "none", overflowY: "auto", padding: 16, borderRight: "2px solid var(--ink)" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <ListingCardSkeletonItem />
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}
