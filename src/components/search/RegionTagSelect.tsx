"use client";

import { Tag } from "antd";
import type { Region } from "@/domain/regions/types";
import { checkableTagStyle } from "./regionTagStyle";

/**
 * Chọn khu vực dạng pill/tag thay vì dropdown — trạng thái active phải khác
 * biệt rõ bằng màu forest. Đây là nơi DUY NHẤT dùng bo tròn hết cỡ (999px)
 * trong toàn bộ UI, cố ý tương phản với các khối vuông vắn hơn (board, card).
 */
export function RegionTagSelect({
  regions,
  value,
  onChange,
}: {
  regions: Region[];
  value: number | null;
  onChange: (regionId: number | null) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Tag.CheckableTag checked={value === null} onChange={() => onChange(null)} style={checkableTagStyle(value === null)}>
        Tất cả khu vực
      </Tag.CheckableTag>
      {regions.map((region) => {
        const checked = value === region.id;
        return (
          <Tag.CheckableTag
            key={region.id}
            checked={checked}
            onChange={() => onChange(checked ? null : region.id)}
            style={checkableTagStyle(checked)}
          >
            {region.name}
          </Tag.CheckableTag>
        );
      })}
    </div>
  );
}
