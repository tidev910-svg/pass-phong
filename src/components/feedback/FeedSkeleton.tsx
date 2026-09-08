"use client";

import { Skeleton } from "antd";
import { FeedPostListSkeleton } from "@/components/feed/FeedPostCardSkeleton";

/**
 * Skeleton cho `/bang-tin` — mirror tiêu đề + thanh chip lọc cuộn ngang phía
 * trên feed 1 cột, tránh nhảy layout khi nội dung thật load xong. "use client"
 * bắt buộc vì dùng trực tiếp `Skeleton` của antd (cùng lý do `HomeSkeleton`).
 */
export function FeedSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Skeleton.Button active style={{ width: 220, height: 30 }} />
        <div style={{ marginTop: 8 }}>
          <Skeleton.Button active size="small" style={{ width: 300, height: 14 }} />
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[110, 130, 90, 120].map((w, i) => (
            <Skeleton.Button key={i} active shape="round" style={{ width: w, height: 32 }} />
          ))}
        </div>

        <FeedPostListSkeleton count={3} />
      </div>
    </div>
  );
}
