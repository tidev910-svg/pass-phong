"use client";

import dynamic from "next/dynamic";
import type L from "leaflet";
import styles from "./LocationPicker.module.css";

export interface LatLng {
  lat: number;
  lng: number;
}

// react-leaflet/leaflet đụng `window` ngay lúc import module — phải tắt SSR
// hoàn toàn, giống pattern ở MapSearchView.tsx (không phải workaround tạm bợ).
const LocationPickerMap = dynamic(
  () => import("./LocationPickerMap").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Đang tải bản đồ...</div>,
  },
);

/**
 * Chọn vị trí phòng bằng cách click lên bản đồ (thả ghim) — dùng cho form
 * đăng tin (`/dang-tin`). Không bắt buộc: bỏ trống vẫn đăng tin được bình
 * thường (xem `CreateListingInput.lat/lng` — optional, đi theo cặp).
 * Chọn hướng "click-to-drop-pin" thay vì geocode địa chỉ tự do vì phòng trọ
 * cho sinh viên thường không có địa chỉ chuẩn hoá, chỉ có thể tả bằng bản đồ.
 */
export function LocationPicker({
  value,
  onChange,
  onMapReady,
}: {
  value: LatLng | null;
  onChange: (value: LatLng | null) => void;
  /** Xem ghi chú ở `LocationPickerMap` — chỉ cần khi map này sống trong 1 tab
   * pane có thể bị ẩn/hiện lại bằng CSS. */
  onMapReady?: (map: L.Map) => void;
}) {
  return (
    <div className={styles.root}>
      <div className={styles.mapBox}>
        <LocationPickerMap value={value} onChange={onChange} onMapReady={onMapReady} />
      </div>
      <div className={styles.footer}>
        {value ? (
          <>
            <span className={styles.coordsText}>📍 Đã ghim vị trí — kéo ghim để chỉnh lại</span>
            <button type="button" className={styles.clearBtn} onClick={() => onChange(null)}>
              Xoá vị trí
            </button>
          </>
        ) : (
          <span className={styles.hintText}>Nhấn vào bản đồ để đánh dấu vị trí phòng (không bắt buộc)</span>
        )}
      </div>
    </div>
  );
}
