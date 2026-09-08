"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "antd";
import type { Region } from "@/domain/regions/types";
import type { NearbySearchInitialValues, NearbySearchQuery } from "@/components/map/NearbySearchPanel";
import { HomeFilterBoard, type SearchMode } from "./HomeFilterBoard";
import type { SearchFilterValues } from "./SearchFilterBar";
import { MapViewLink } from "./MapViewLink";
import { SaveSearchButton } from "./SaveSearchButton";
import { MAX_PRICE } from "./PriceRangeSlider";

/**
 * Orchestrator cho trang chủ — 1 board duy nhất (`HomeFilterBoard`) với 2 tab
 * "Theo khu vực"/"Theo vị trí gần tôi", thay cho cặp cũ "nút Tìm ngay mở chế
 * độ khác" (`HeroSearchCTA` + branch UI riêng, xem lịch sử ở
 * `pass-phong-project-status`). Chỉ còn giữ ở đây: `activeTab` (để quyết
 * định hàng CTA bên dưới board hiển thị gì) và 2 handler submit (mỗi tab gọi
 * đúng 1 lần khi bấm "Tìm phòng" — chuyển query thành URL rồi điều hướng,
 * y hệt logic cũ, chỉ gộp lại 1 chỗ thay vì rải ở `SearchFilterBar` +
 * `HomeSearchSection`).
 *
 * Đổi tab KHÔNG điều hướng (khác hành vi "quay lại khu vực" cũ luôn
 * `router.push("/")`) — chỉ đổi UI tại chỗ, danh sách kết quả bên dưới vẫn
 * giữ nguyên tới khi bấm "Tìm phòng" ở 1 trong 2 tab. TÁCH RIÊNG khỏi
 * `MapSearchView` (bản tương đương ở `/tim-tin/ban-do`, vẫn giữ `Segmented`
 * — không đổi) vì trang chủ không có bản đồ lớn, chỉ liệt kê danh sách
 * (`ListingGrid`).
 */
export function HomeSearchSection({
  regions,
  mode,
  regionInitialValues,
  nearbyInitialValues,
  nearbyError,
  isLoggedIn,
}: {
  regions: Region[];
  /** Chế độ ĐÃ ĐƯỢC SERVER XÁC NHẬN dựa trên kết quả đang hiển thị — dùng để
   * khởi tạo `activeTab`, xem comment tương tự ở `MapSearchView`. */
  mode: SearchMode;
  regionInitialValues: SearchFilterValues;
  nearbyInitialValues?: NearbySearchInitialValues;
  /** Lỗi validate từ `searchNearbyListings` (vd URL bị sửa tay) — hiển thị
   * ở đây (component client) thay vì `page.tsx` (Server Component không được
   * render thẳng antd JSX, xem [[antd-nextjs-gotchas]]). */
  nearbyError?: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchMode>(mode);

  function handleRegionSubmit(values: SearchFilterValues) {
    const params = new URLSearchParams();
    if (values.regionId) params.set("regionId", String(values.regionId));
    if (values.priceMin) params.set("priceMin", String(values.priceMin));
    if (values.priceMax) params.set("priceMax", String(values.priceMax));
    if (values.moveOutDateTo) params.set("moveOutDateTo", values.moveOutDateTo);
    router.push(`/?${params.toString()}`);
  }

  function handleNearbySubmit(query: NearbySearchQuery) {
    const params = new URLSearchParams({
      mode: "nearby",
      lat: String(query.lat),
      lng: String(query.lng),
      radiusKm: String(query.radiusKm),
    });
    if (query.priceMin > 0) params.set("priceMin", String(query.priceMin));
    if (query.priceMax < MAX_PRICE) params.set("priceMax", String(query.priceMax));
    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <HomeFilterBoard
        regions={regions}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        regionInitialValues={regionInitialValues}
        nearbyInitialValues={nearbyInitialValues}
        onRegionSubmit={handleRegionSubmit}
        onNearbySubmit={handleNearbySubmit}
      />

      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        {activeTab === "region" ? (
          <>
            <MapViewLink
              href={regionInitialValues.regionId ? `/tim-tin/ban-do?regionId=${regionInitialValues.regionId}` : "/tim-tin/ban-do"}
            />
            <SaveSearchButton filter={regionInitialValues} isLoggedIn={isLoggedIn} />
          </>
        ) : (
          // Lưu tìm kiếm theo nhu cầu để phase sau — chưa có nút ở đây, xem
          // ghi chú trong pass-phong-project-status. Vẫn cho xem trên bản đồ
          // lớn nếu đã có kết quả — tiện đối chiếu trực quan hơn.
          mode === "nearby" &&
          nearbyInitialValues?.lat !== undefined &&
          nearbyInitialValues?.lng !== undefined &&
          nearbyInitialValues?.radiusKm !== undefined && (
            <MapViewLink
              href={`/tim-tin/ban-do?mode=nearby&lat=${nearbyInitialValues.lat}&lng=${nearbyInitialValues.lng}&radiusKm=${nearbyInitialValues.radiusKm}${
                nearbyInitialValues.priceMin ? `&priceMin=${nearbyInitialValues.priceMin}` : ""
              }${nearbyInitialValues.priceMax ? `&priceMax=${nearbyInitialValues.priceMax}` : ""}`}
            />
          )
        )}
      </div>

      {activeTab === "nearby" && nearbyError && <Alert type="error" showIcon title={nearbyError} style={{ marginTop: 12 }} />}
    </div>
  );
}
