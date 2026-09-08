"use client";

import "leaflet/dist/leaflet.css";
import type L from "leaflet";
import { useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import styles from "./LocationPickerMap.module.css";
import { CAN_THO_CENTER } from "./constants";
import { buildLocationPinIcon } from "./icons";
import type { LatLng } from "./LocationPicker";

const DEFAULT_ZOOM = 14;
// Zoom khi bay tới vị trí vừa chọn/vị trí có sẵn (sửa tin sau này, hoặc
// đăng lại tin cũ) — gần hơn zoom mặc định để thấy rõ khu vực cụ thể.
const FOCUSED_ZOOM = 16;

/** Bắt click trên bản đồ để đặt/di chuyển ghim — phải là component con vì
 * `useMapEvents` chỉ dùng được bên trong `<MapContainer>`. */
function ClickToPlace({ onChange }: { onChange: (value: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPickerMap({
  value,
  onChange,
  onMapReady,
}: {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
  /** Trả về instance Leaflet map thật khi đã sẵn sàng — dùng ở nơi map được
   * mount trong 1 tab pane có thể bị ẩn/hiện lại bằng CSS `display:none`
   * (xem `HomeFilterBoard`), để nơi gọi tự quyết định lúc nào cần
   * `map.invalidateSize()`. Optional, không ảnh hưởng 2 nơi dùng khác
   * (`/dang-tin`, `/tin/[id]/sua`) vì mặc định không truyền. */
  onMapReady?: (map: L.Map) => void;
}) {
  const icon = useMemo(() => buildLocationPinIcon(), []);
  const mapRef = useRef<L.Map | null>(null);
  // Toạ độ ban đầu để center bản đồ — lazy initializer nên chỉ tính 1 lần lúc
  // mount, không đọc lại khi `value` đổi sau đó (MapContainer cũng không tự
  // re-center khi prop `center` đổi). Đủ dùng vì mục đích là mở bản đồ đúng
  // chỗ có sẵn (sửa tin/đăng lại), còn lại người dùng tự pan/click.
  const [initialCenter] = useState<[number, number]>(() => (value ? [value.lat, value.lng] : CAN_THO_CENTER));

  return (
    <MapContainer
      ref={mapRef}
      center={initialCenter}
      zoom={value ? FOCUSED_ZOOM : DEFAULT_ZOOM}
      className={styles.mapRoot}
      scrollWheelZoom={false}
      whenReady={() => {
        if (mapRef.current) onMapReady?.(mapRef.current);
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = (e.target as L.Marker).getLatLng();
              onChange({ lat: pos.lat, lng: pos.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
