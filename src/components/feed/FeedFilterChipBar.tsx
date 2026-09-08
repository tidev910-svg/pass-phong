"use client";

import { Tag } from "antd";
import { checkableTagStyle } from "@/components/search/regionTagStyle";
import styles from "./FeedFilterChipBar.module.css";

export interface FeedFilterOption {
  id: number;
  label: string;
}

/**
 * Thanh chip lọc nhanh ở Bảng tin — cuộn ngang, dựng từ CHÍNH khu vực/tag đã
 * lưu trong sở thích của user (không phải toàn bộ taxonomy), + 1 chip "Tất
 * cả" mỗi nhóm để reset. Lọc lại CLIENT-SIDE trên các item đã tải trong
 * `FeedInfiniteList` (không gọi lại server mỗi lần bấm chip) — đánh đổi đã
 * ghi trong plan: bấm chip có thể ra ít/0 kết quả cho tới khi cuộn thêm.
 * Dùng cùng pill bo tròn 999px như `RegionTagSelect` — ngoại lệ style
 * `/bang-tin` không thêm màu nhấn mới, chỉ thêm chiều cuộn ngang.
 */
export function FeedFilterChipBar({
  regionOptions,
  tagOptions,
  activeRegionId,
  activeTagId,
  onChangeRegion,
  onChangeTag,
}: {
  regionOptions: FeedFilterOption[];
  tagOptions: FeedFilterOption[];
  activeRegionId: number | null;
  activeTagId: number | null;
  onChangeRegion: (regionId: number | null) => void;
  onChangeTag: (tagId: number | null) => void;
}) {
  return (
    <div className={styles.scrollRow}>
      {regionOptions.length > 0 && (
        <>
          <Tag.CheckableTag
            checked={activeRegionId === null}
            onChange={() => onChangeRegion(null)}
            style={checkableTagStyle(activeRegionId === null)}
          >
            Tất cả khu vực
          </Tag.CheckableTag>
          {regionOptions.map((option) => {
            const checked = activeRegionId === option.id;
            return (
              <Tag.CheckableTag
                key={`region-${option.id}`}
                checked={checked}
                onChange={() => onChangeRegion(checked ? null : option.id)}
                style={checkableTagStyle(checked)}
              >
                {option.label}
              </Tag.CheckableTag>
            );
          })}
        </>
      )}
      {tagOptions.map((option) => {
        const checked = activeTagId === option.id;
        return (
          <Tag.CheckableTag
            key={`tag-${option.id}`}
            checked={checked}
            onChange={() => onChangeTag(checked ? null : option.id)}
            style={checkableTagStyle(checked)}
          >
            {option.label}
          </Tag.CheckableTag>
        );
      })}
    </div>
  );
}
