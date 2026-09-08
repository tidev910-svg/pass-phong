"use client";

import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useToast } from "@/components/feedback/useToast";
import { FeedPostCard } from "./FeedPostCard";
import { FeedPostListSkeleton } from "./FeedPostCardSkeleton";
import type { FeedItemViewModel } from "./feedViewModel";
import { FeedFilterChipBar, type FeedFilterOption } from "./FeedFilterChipBar";
import styles from "./FeedInfiniteList.module.css";

/**
 * Danh sách Bảng tin cuộn liên tục — 1 CỘT full-width (kiểu feed Facebook,
 * khác lưới nhiều cột `ListingGridView` dùng ở nơi khác) — chưa có tiền lệ
 * infinite-scroll nào trong app (mọi nơi khác dùng `Pagination` số + URL
 * searchParams), cần riêng vì thứ tự xếp hạng không phải sort key SQL ổn
 * định (xem `getFeedPage`). Trang đầu (`initialItems`/`initialCursor`) đến
 * từ SSR (`bang-tin/page.tsx`) — component này chỉ lo các trang SAU, gọi
 * `/api/bang-tin?cursor=...` khi sentinel cuối danh sách lọt vào viewport.
 */
export function FeedInfiniteList({
  initialItems,
  initialCursor,
  regionFilterOptions,
  tagFilterOptions,
}: {
  initialItems: FeedItemViewModel[];
  initialCursor: string | null;
  /** Chip lọc nhanh dựng từ chính khu vực/tag đã lưu trong sở thích của
   * user (không phải toàn bộ taxonomy) — xem `FeedFilterChipBar`. */
  regionFilterOptions: FeedFilterOption[];
  tagFilterOptions: FeedFilterOption[];
}) {
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(null);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(cursor);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (isLoadingRef.current || cursorRef.current === null) return;
        isLoadingRef.current = true;
        setIsLoadingMore(true);

        fetch(`/api/bang-tin?cursor=${encodeURIComponent(cursorRef.current)}`)
          .then((res) => {
            if (!res.ok) throw new Error("fetch-failed");
            return res.json() as Promise<{ items: FeedItemViewModel[]; nextCursor: string | null }>;
          })
          .then((page) => {
            setItems((prev) => [...prev, ...page.items]);
            setCursor(page.nextCursor);
          })
          .catch(() => {
            toast.error("Không tải thêm được tin — thử cuộn lại hoặc tải lại trang.");
          })
          .finally(() => {
            isLoadingRef.current = false;
            setIsLoadingMore(false);
          });
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ cần gắn observer 1 lần, cursor mới nhất đọc qua ref
  }, []);

  const visibleItems = items.filter((item) => {
    if (activeRegionId !== null && item.regionId !== activeRegionId) return false;
    if (activeTagId !== null && !item.tagIds.includes(activeTagId)) return false;
    return true;
  });

  return (
    <div className={styles.column}>
      {(regionFilterOptions.length > 0 || tagFilterOptions.length > 0) && (
        <FeedFilterChipBar
          regionOptions={regionFilterOptions}
          tagOptions={tagFilterOptions}
          activeRegionId={activeRegionId}
          activeTagId={activeTagId}
          onChangeRegion={setActiveRegionId}
          onChangeTag={setActiveTagId}
        />
      )}

      {visibleItems.length === 0 ? (
        <EmptyState
          title="Chưa có tin nào khớp"
          description="Thử bỏ bớt chip lọc, hoặc sửa lại sở thích Bảng tin ở trang hồ sơ."
        />
      ) : (
        <div className={styles.posts}>
          {visibleItems.map((item) => (
            <FeedPostCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} style={{ marginTop: 16 }}>
        {isLoadingMore && <FeedPostListSkeleton count={2} />}
      </div>
    </div>
  );
}
