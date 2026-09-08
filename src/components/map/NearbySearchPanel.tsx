"use client";

import { useState } from "react";
import type L from "leaflet";
import { Button, Card, Slider, Space } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { MIN_RADIUS_KM, MAX_RADIUS_KM } from "@/domain/listings/validation";
import { PriceRangeSlider, MAX_PRICE } from "@/components/search/PriceRangeSlider";
import { TapeLabel } from "@/components/decor/TapeLabel";
import { useToast } from "@/components/feedback/useToast";
import { LocationPicker, type LatLng } from "./LocationPicker";

const DEFAULT_RADIUS_KM = 3;

export interface NearbySearchQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  priceMin: number;
  priceMax: number;
}

export interface NearbySearchInitialValues {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  priceMin?: number;
  priceMax?: number;
}

/**
 * Nội dung thật của panel "vị trí + bán kính + giá" — TÁCH RIÊNG khỏi
 * `NearbySearchPanel` (bọc Card `board-panel` + TapeLabel bên dưới) để dùng
 * lại được trong `HomeFilterBoard` (mỗi tab pane đã có Card/Tabs bao ngoài
 * riêng, không thể lồng thêm 1 `board-panel` nữa) mà không copy-paste toàn bộ
 * state/handler chọn vị trí hiện tại. `MapSearchView` vẫn dùng
 * `NearbySearchPanel` (bên dưới) y như cũ, không đổi.
 */
export function NearbySearchFields({
  initialValues,
  onSubmit,
  onMapReady,
}: {
  initialValues?: NearbySearchInitialValues;
  onSubmit: (query: NearbySearchQuery) => void;
  /** Xem ghi chú ở `LocationPickerMap` — chỉ cần khi field này sống trong 1
   * tab pane có thể bị ẩn/hiện lại bằng CSS (`HomeFilterBoard`). */
  onMapReady?: (map: L.Map) => void;
}) {
  const toast = useToast();
  const [location, setLocation] = useState<LatLng | null>(
    initialValues?.lat !== undefined && initialValues?.lng !== undefined
      ? { lat: initialValues.lat, lng: initialValues.lng }
      : null,
  );
  const [radiusKm, setRadiusKm] = useState(initialValues?.radiusKm ?? DEFAULT_RADIUS_KM);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialValues?.priceMin ?? 0,
    initialValues?.priceMax ?? MAX_PRICE,
  ]);
  const [isLocating, setIsLocating] = useState(false);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ lấy vị trí hiện tại — vui lòng chọn trực tiếp trên bản đồ.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsLocating(false);
      },
      () => {
        // Từ chối quyền, timeout, hoặc lỗi khác — không phân biệt lý do cụ
        // thể, chỉ hướng người dùng sang cách dự phòng (click tay).
        toast.error("Không lấy được vị trí hiện tại — vui lòng chọn trực tiếp trên bản đồ.");
        setIsLocating(false);
      },
      { timeout: 10_000 },
    );
  }

  function handleSubmit() {
    if (!location) return; // nút đã disabled khi chưa chọn điểm, chặn thêm cho chắc
    onSubmit({ lat: location.lat, lng: location.lng, radiusKm, priceMin: priceRange[0], priceMax: priceRange[1] });
  }

  return (
    <Space orientation="vertical" size={14} style={{ width: "100%" }}>
      <div>
        <Button
          icon={<EnvironmentOutlined />}
          onClick={handleUseCurrentLocation}
          loading={isLocating}
          size="small"
          style={{ marginBottom: 8 }}
        >
          Dùng vị trí hiện tại của tôi
        </Button>
        <LocationPicker value={location} onChange={setLocation} onMapReady={onMapReady} />
      </div>

      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 4 }}>Bán kính: {radiusKm}km</div>
        <Slider
          min={MIN_RADIUS_KM}
          max={MAX_RADIUS_KM}
          step={0.5}
          value={radiusKm}
          onChange={setRadiusKm}
          tooltip={{ formatter: (value) => `${value}km` }}
        />
      </div>

      <PriceRangeSlider value={priceRange} onChange={setPriceRange} />

      <Button type="primary" onClick={handleSubmit} disabled={!location}>
        Tìm phòng
      </Button>
    </Space>
  );
}

/**
 * Panel chọn "vị trí + bán kính + giá" cho chế độ "Tìm theo nhu cầu" ở
 * `/tim-tin/ban-do` — song song với `SearchFilterBar` (chế độ khu vực), theo
 * đúng cùng 1 mẫu layout (Card `board-panel` + TapeLabel). Chỉ còn là 1 lớp
 * bọc mỏng quanh `NearbySearchFields` (xem comment ở trên).
 */
export function NearbySearchPanel({
  initialValues,
  onSubmit,
}: {
  initialValues?: NearbySearchInitialValues;
  onSubmit: (query: NearbySearchQuery) => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -16, left: 24, zIndex: 1 }}>
        <TapeLabel>Tìm quanh đây!</TapeLabel>
      </div>
      <Card variant="borderless" className="board-panel" styles={{ body: { padding: "24px 20px 20px" } }}>
        <NearbySearchFields initialValues={initialValues} onSubmit={onSubmit} />
      </Card>
    </div>
  );
}
