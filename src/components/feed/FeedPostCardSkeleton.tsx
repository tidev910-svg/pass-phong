"use client";

import { Skeleton } from "antd";
import styles from "./FeedPostCard.module.css";

/**
 * Skeleton mirror đúng vùng thật của `FeedPostCard` (header avatar+tên+giờ,
 * dòng giá, mô tả, ảnh, thanh hành động) — dùng class CSS module DÙNG CHUNG
 * với `FeedPostCard` (cùng padding/border) để không có layout shift khi dữ
 * liệu thật thay vào, đúng nguyên tắc loading-toast-feedback-style.
 */
export function FeedPostCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Skeleton.Avatar active size={38} shape="circle" />
        <div className={styles.headerText}>
          <Skeleton.Button active size="small" style={{ width: 120, height: 14 }} />
          <Skeleton.Button active size="small" style={{ width: 70, height: 12, marginTop: 4 }} />
        </div>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <Skeleton.Button active style={{ width: 140, height: 22 }} />
        <Skeleton active title={false} paragraph={{ rows: 2, width: ["100%", "70%"] }} style={{ marginTop: 10 }} />
        <Skeleton.Image active style={{ width: "100%", height: "auto", aspectRatio: "16/9", marginTop: 12 }} />
      </div>
      <div className={styles.actionBar}>
        <Skeleton.Button active size="small" style={{ width: 80 }} />
        <Skeleton.Button active size="small" style={{ width: 100 }} />
      </div>
    </div>
  );
}

export function FeedPostListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <FeedPostCardSkeleton />
        </div>
      ))}
    </>
  );
}
