"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, DatePicker, Space } from "antd";
import type { Region } from "@/domain/regions/types";
import { dayjsToIsoDate, isoDateToDayjs } from "@/lib/format/date";
import { RegionTagSelect } from "./RegionTagSelect";
import { PriceRangeSlider, MAX_PRICE } from "./PriceRangeSlider";
import { TapeLabel } from "@/components/decor/TapeLabel";

export interface SearchFilterValues {
  regionId?: number;
  priceMin?: number;
  priceMax?: number;
  moveOutDateTo?: string;
}

/**
 * Nội dung thật của filter "Theo khu vực" — TÁCH RIÊNG khỏi `SearchFilterBar`
 * (bọc Card `board-panel` + TapeLabel bên dưới) để dùng lại được trong
 * `HomeFilterBoard` (mỗi tab pane đã có Card/Tabs bao ngoài riêng, không thể
 * lồng thêm 1 `board-panel` nữa) mà không copy-paste chip khu vực/slider giá.
 */
export function SearchFilterFields({
  regions,
  initialValues,
  onSubmit,
}: {
  regions: Region[];
  initialValues: SearchFilterValues;
  onSubmit: (values: SearchFilterValues) => void;
}) {
  const [regionId, setRegionId] = useState<number | null>(initialValues.regionId ?? null);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialValues.priceMin ?? 0,
    initialValues.priceMax ?? MAX_PRICE,
  ]);
  const [moveOutDateTo, setMoveOutDateTo] = useState(initialValues.moveOutDateTo ?? "");

  function handleSubmit() {
    const [priceMin, priceMax] = priceRange;
    onSubmit({
      regionId: regionId ?? undefined,
      priceMin: priceMin > 0 ? priceMin : undefined,
      priceMax: priceMax < MAX_PRICE ? priceMax : undefined,
      moveOutDateTo: moveOutDateTo || undefined,
    });
  }

  return (
    <Space orientation="vertical" size={14} style={{ width: "100%" }}>
      <RegionTagSelect regions={regions} value={regionId} onChange={setRegionId} />

      <PriceRangeSlider value={priceRange} onChange={setPriceRange} />

      <Space wrap size={12} style={{ width: "100%" }}>
        <DatePicker
          placeholder="Cần pass trước ngày"
          value={isoDateToDayjs(moveOutDateTo) ?? null}
          onChange={(value) => setMoveOutDateTo(dayjsToIsoDate(value) ?? "")}
          format="DD/MM/YYYY"
        />
        <Button type="primary" onClick={handleSubmit}>
          Tìm phòng
        </Button>
      </Space>
    </Space>
  );
}

/**
 * NOTE (2026-09-07): sau khi `HomeSearchSection` chuyển sang dùng
 * `HomeFilterBoard` (2 tab "Theo khu vực"/"Theo vị trí gần tôi" gộp 1 board),
 * component bọc này KHÔNG CÒN nơi nào gọi tới nữa — giữ lại (chưa xoá) vì
 * người dùng yêu cầu xác nhận trước khi xoá file/route, xem trao đổi lúc gộp
 * filter board. `SearchFilterFields` ở trên vẫn đang được dùng trực tiếp bởi
 * `HomeFilterBoard`.
 */
export function SearchFilterBar({
  regions,
  initialValues,
}: {
  regions: Region[];
  initialValues: SearchFilterValues;
}) {
  const router = useRouter();

  function handleSubmit(values: SearchFilterValues) {
    const params = new URLSearchParams();
    if (values.regionId) params.set("regionId", String(values.regionId));
    if (values.priceMin) params.set("priceMin", String(values.priceMin));
    if (values.priceMax) params.set("priceMax", String(values.priceMax));
    if (values.moveOutDateTo) params.set("moveOutDateTo", values.moveOutDateTo);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -16, left: 24, zIndex: 1 }}>
        <TapeLabel>Tìm phòng nè!</TapeLabel>
      </div>
      <Card variant="borderless" className="board-panel" styles={{ body: { padding: "24px 20px 20px" } }}>
        <SearchFilterFields regions={regions} initialValues={initialValues} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
