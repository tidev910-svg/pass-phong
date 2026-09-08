import type { CSSProperties } from "react";
import { COLOR_BORDER, COLOR_FOREST, COLOR_INK, COLOR_PAPER_CARD } from "@/theme/tokens";

/**
 * Style pill bo tròn hết cỡ (999px) dùng chung cho mọi `Tag.CheckableTag`
 * kiểu "chọn khu vực/loại phòng/tiện ích" trong app — trích ra từ
 * `RegionTagSelect` để `TagPicker` và `RegionMultiTagSelect` dùng lại,
 * tránh lặp hằng số màu/bo góc ở 3 nơi.
 */
export function checkableTagStyle(active: boolean): CSSProperties {
  return {
    borderRadius: 999,
    padding: "4px 12px",
    border: `1.5px solid ${active ? COLOR_FOREST : COLOR_BORDER}`,
    background: active ? COLOR_FOREST : COLOR_PAPER_CARD,
    color: active ? "#fff" : COLOR_INK,
    fontWeight: 500,
    transition: "all 180ms ease",
  };
}
