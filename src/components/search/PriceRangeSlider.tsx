"use client";

import { Slider } from "antd";
import { formatPriceVnd } from "@/domain/listings/format";

// Biên trên của thanh trượt giá — set giá trị = MAX_PRICE nghĩa là "không
// giới hạn giá trên" (không gửi priceMax lên URL). Dùng chung cho mọi filter
// giá trong app (khu vực ở SearchFilterBar, "tìm theo nhu cầu" ở
// NearbySearchPanel) để tránh lặp code + đảm bảo cùng 1 biên độ giá.
export const MAX_PRICE = 5_000_000;
export const PRICE_STEP = 100_000;

/**
 * Thanh trượt khoảng giá dùng chung — tách từ `SearchFilterBar` để tái dùng
 * ở `NearbySearchPanel` (chế độ "Tìm theo nhu cầu") mà không lặp markup.
 */
export function PriceRangeSlider({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  return (
    <div style={{ maxWidth: 420 }}>
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>
        Giá: {formatPriceVnd(value[0])}
        {" – "}
        {value[1] >= MAX_PRICE ? "không giới hạn" : formatPriceVnd(value[1])}
      </div>
      <Slider
        range
        min={0}
        max={MAX_PRICE}
        step={PRICE_STEP}
        value={value}
        onChange={(next) => onChange(next as [number, number])}
        tooltip={{ formatter: (v) => formatPriceVnd(v ?? 0) }}
      />
    </div>
  );
}
