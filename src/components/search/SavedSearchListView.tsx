"use client";

import Link from "next/link";
import { Card, Space, Typography } from "antd";
import { EmptyState } from "@/components/feedback/EmptyState";
import { COLOR_FOREST, COLOR_MUSTARD_DARK, COLOR_PRIMARY_SOFT } from "@/theme/tokens";
import { DeleteSavedSearchButton } from "./DeleteSavedSearchButton";
import styles from "./SavedSearchListView.module.css";

export interface SavedSearchPreviewItem {
  id: string;
  coverImageUrl: string | null;
  regionName: string;
  priceLabel: string;
}

export interface SavedSearchViewModel {
  id: string;
  summary: string;
  newMatchesCount: number;
  /** Tổng số tin đang khớp bộ lọc này (không phụ thuộc lần xem gần nhất),
   * khác `newMatchesCount` — dùng để quyết định có hiện dải preview không. */
  totalMatches: number;
  /** Vài tin khớp mới nhất, đã resolve sẵn URL ảnh — xem `PREVIEW_LISTINGS_LIMIT`
   * ở `domain/saved-searches/service.ts`. */
  previewListings: SavedSearchPreviewItem[];
}

export function SavedSearchListView({ searches }: { searches: SavedSearchViewModel[] }) {
  if (searches.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa lưu tìm kiếm nào"
        description="Vào trang chủ, lọc theo nhu cầu rồi bấm “Lưu tìm kiếm này”."
      />
    );
  }

  return (
    <Space orientation="vertical" size={12} style={{ width: "100%" }}>
      {searches.map((search) => (
        <Card key={search.id} variant="borderless" className="board-panel" styles={{ body: { padding: 16 } }}>
          <div className={styles.headerRow}>
            <span>{search.summary}</span>
            <DeleteSavedSearchButton id={search.id} />
          </div>

          {search.totalMatches > 0 ? (
            <>
              <div className={styles.previewRow}>
                {search.previewListings.map((item) => (
                  <Link key={item.id} href={`/tin/${item.id}`} className={styles.thumb} title={item.regionName}>
                    {item.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverImageUrl} alt={`Ảnh phòng ${item.regionName}`} className={styles.thumbImage} />
                    ) : (
                      <div className={styles.thumbPlaceholder}>{item.regionName}</div>
                    )}
                    <span className={styles.thumbPrice}>{item.priceLabel}</span>
                  </Link>
                ))}
              </div>

              <div className={styles.footerRow}>
                <Link href={`/tim-kiem-da-luu/${search.id}`} style={{ color: COLOR_FOREST, fontWeight: 600 }}>
                  Xem tất cả {search.totalMatches} kết quả →
                </Link>
                {search.newMatchesCount > 0 && (
                  <span className={styles.newBadge} style={{ background: COLOR_MUSTARD_DARK }}>
                    {search.newMatchesCount} tin mới
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className={styles.footerRow}>
              <Typography.Text style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
                Chưa có tin nào khớp bộ lọc này.
              </Typography.Text>
              <Link
                href={`/tim-kiem-da-luu/${search.id}`}
                style={{ color: COLOR_FOREST, fontWeight: 600, background: COLOR_PRIMARY_SOFT }}
                className={styles.checkLink}
              >
                Kiểm tra lại
              </Link>
            </div>
          )}
        </Card>
      ))}
    </Space>
  );
}
