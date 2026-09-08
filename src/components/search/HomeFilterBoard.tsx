"use client";

import { useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { Card, Tabs } from "antd";
import { AppstoreOutlined, EnvironmentOutlined } from "@ant-design/icons";
import type { Region } from "@/domain/regions/types";
import { TapeLabel } from "@/components/decor/TapeLabel";
import {
  NearbySearchFields,
  type NearbySearchInitialValues,
  type NearbySearchQuery,
} from "@/components/map/NearbySearchPanel";
import { SearchFilterFields, type SearchFilterValues } from "./SearchFilterBar";

export type SearchMode = "region" | "nearby";

/**
 * Board tìm kiếm hợp nhất ở trang chủ — thay cho cặp "nút Tìm ngay mở chế độ
 * khác" (`HeroSearchCTA`, cũ) bằng 2 tab thật trong CÙNG 1 khối bảng tin:
 * "Theo khu vực" (chip khu vực + giá + ngày) và "Theo vị trí gần tôi" (bản
 * đồ + bán kính + giá). Tái dùng `SearchFilterFields`/`NearbySearchFields` —
 * 2 field-set thật, không phải bản copy — nên không lặp code chip/slider.
 *
 * State của từng pane (khu vực đã chọn, điểm ghim trên bản đồ...) sống ngay
 * bên trong `SearchFilterFields`/`NearbySearchFields`, KHÔNG bị mất khi đổi
 * tab: antd `Tabs` mặc định (`forceRender`/`destroyOnHidden` đều false) chỉ
 * mount pane lần đầu được active, sau đó ẩn bằng CSS `display:none` khi
 * chuyển tab khác — không bao giờ unmount — nên state tự nhiên được giữ
 * nguyên, không cần lift state lên đây.
 *
 * Vì pane "Theo vị trí" chỉ mount lần đầu khi user thật sự bấm sang tab đó,
 * bản đồ Leaflet bên trong cũng chỉ khởi tạo đúng lúc đó (không tải tile
 * thừa cho người chỉ dùng tìm theo khu vực) — đúng yêu cầu lazy-load. Lần
 * chuyển tab SAU đó (pane đã mount, chỉ đổi từ `display:none` sang hiện lại)
 * mới cần gọi `invalidateSize()` (Leaflet không tự tính lại kích thước
 * container khi nó vừa thoát `display:none`) — làm qua `mapRef` lấy được từ
 * `onMapReady` xuyên suốt `NearbySearchFields` → `LocationPicker` →
 * `LocationPickerMap`.
 */
export function HomeFilterBoard({
  regions,
  activeTab,
  onTabChange,
  regionInitialValues,
  nearbyInitialValues,
  onRegionSubmit,
  onNearbySubmit,
}: {
  regions: Region[];
  activeTab: SearchMode;
  onTabChange: (tab: SearchMode) => void;
  regionInitialValues: SearchFilterValues;
  nearbyInitialValues?: NearbySearchInitialValues;
  onRegionSubmit: (values: SearchFilterValues) => void;
  onNearbySubmit: (query: NearbySearchQuery) => void;
}) {
  const nearbyMapRef = useRef<LeafletMap | null>(null);

  function handleTabChange(key: string) {
    const next = key as SearchMode;
    onTabChange(next);
    if (next === "nearby") {
      // rAF: chờ đúng 1 khung hình để CSS display:block của pane áp dụng
      // xong trước khi hỏi Leaflet tính lại kích thước container.
      requestAnimationFrame(() => nearbyMapRef.current?.invalidateSize());
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", zIndex: 1 }}>
        <TapeLabel>{activeTab === "region" ? "Tìm phòng nè!" : "Tìm quanh đây!"}</TapeLabel>
      </div>
      <Card variant="borderless" className="board-panel" styles={{ body: { padding: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarStyle={{ padding: "0 20px", marginBottom: 0 }}
          items={[
            {
              key: "region" satisfies SearchMode,
              label: (
                <span>
                  <AppstoreOutlined /> Theo khu vực
                </span>
              ),
              children: (
                <div style={{ padding: "20px 20px 10px" }}>
                  <SearchFilterFields regions={regions} initialValues={regionInitialValues} onSubmit={onRegionSubmit} />
                </div>
              ),
            },
            {
              key: "nearby" satisfies SearchMode,
              label: (
                <span>
                  <EnvironmentOutlined /> Theo vị trí gần tôi
                </span>
              ),
              children: (
                <div style={{ padding: "20px 20px 4px" }}>
                  <NearbySearchFields
                    initialValues={nearbyInitialValues}
                    onSubmit={onNearbySubmit}
                    onMapReady={(map) => {
                      nearbyMapRef.current = map;
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
