"use client";

import { Tag, Typography } from "antd";
import type { Region } from "@/domain/regions/types";
import { checkableTagStyle } from "./regionTagStyle";

/**
 * Chọn NHIỀU khu vực — dùng cho sở thích Bảng tin (khác `RegionTagSelect`,
 * chọn 1 khu vực cho tìm kiếm). Component riêng (không overload
 * `RegionTagSelect`) để tránh union kiểu `number | null` vs `number[]` rò rỉ
 * vào mọi nơi đang dùng component kia. Không có chip "Tất cả khu vực" — bỏ
 * trống ở đây nghĩa là "không ưu tiên theo khu vực" (dựa vào giá/tag/vị trí
 * thay thế), khác hẳn "hiện tất cả" của `RegionTagSelect`.
 */
export function RegionMultiTagSelect({
  regions,
  value,
  onChange,
}: {
  regions: Region[];
  value: number[];
  onChange: (regionIds: number[]) => void;
}) {
  function toggle(regionId: number) {
    onChange(value.includes(regionId) ? value.filter((id) => id !== regionId) : [...value, regionId]);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {regions.map((region) => {
          const checked = value.includes(region.id);
          return (
            <Tag.CheckableTag
              key={region.id}
              checked={checked}
              onChange={() => toggle(region.id)}
              style={checkableTagStyle(checked)}
            >
              {region.name}
            </Tag.CheckableTag>
          );
        })}
      </div>
      {value.length === 0 && (
        <Typography.Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
          Chưa chọn khu vực nào — Bảng tin sẽ ưu tiên theo giá/loại phòng/vị trí bạn chọn bên dưới thay vì khu vực.
        </Typography.Text>
      )}
    </div>
  );
}
