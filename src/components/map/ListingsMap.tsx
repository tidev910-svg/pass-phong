"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Circle, Popup, TileLayer, useMap } from "react-leaflet";
import { Tag } from "antd";
import { COLOR_FOREST, COLOR_MUSTARD } from "@/theme/tokens";
import { boundingBoxForRadius, type GeoPoint } from "@/domain/shared/geo";
import type { MapListingItem } from "./types";
import { CAN_THO_CENTER } from "./constants";
import { buildLocationPinIcon } from "./icons";
import styles from "./ListingsMap.module.css";

const DEFAULT_ZOOM = 12.5;

/** Escape tối thiểu — nội dung marker chỉ chứa giá (số + "tr đ"/"k đ"), không
 * chứa input người dùng tự do, nhưng vẫn escape cho chắc vì html được build
 * bằng string cho L.divIcon (không đi qua JSX). */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function buildPriceIcon(item: MapListingItem): L.DivIcon {
  const pinClass = `${styles.pin}${item.isPassed ? ` ${styles.pinPassed}` : ""}`;
  return L.divIcon({
    className: styles.pinWrap,
    html: `<span class="${pinClass}" data-listing-id="${item.id}">${escapeHtml(item.priceShortLabel)}</span>`,
    iconSize: [0, 0],
  });
}

/** Bay tới marker được chọn — tách riêng component vì `useMap()` chỉ dùng
 * được bên trong `<MapContainer>`. */
function FlyToSelected({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.5 });
  }, [target, map]);
  return null;
}

/**
 * Bù lỗi kinh điển "Leaflet map cao 0px trong container flex/grid" — Leaflet
 * đo kích thước container ĐÚNG 1 LẦN lúc khởi tạo (`L.map()`, bên trong
 * `react-leaflet`'s `MapContainer`), rồi cache lại, KHÔNG tự đo lại trừ khi
 * `invalidateSize()` được gọi hoặc `window` resize. `.mapPane` (cha của map)
 * lấy chiều cao qua flexbox (`flex:1`, phụ thuộc `.listPane` đã render xong
 * nội dung) — nếu Leaflet khởi tạo trước khi layout đó ổn định (rất dễ xảy
 * ra vì `MapContainer` được `next/dynamic(ssr:false)` nên luôn mount SAU 1
 * nhịp render), nó cache kích thước sai/0, map hiện trắng hoặc vỡ tile dù
 * CSS đã đúng. Xác nhận thật qua Playwright: `.mapPane` đo được chiều cao >0
 * nhưng `.leaflet-container` (con trực tiếp) vẫn đo ra 0 — đúng dấu hiệu
 * cache lúc init, không phải lỗi CSS. Fix: `ResizeObserver` theo dõi chính
 * container Leaflet, gọi `invalidateSize()` mỗi khi kích thước đổi (bắt cả
 * lần layout ổn định sau mount lẫn mọi thay đổi kích thước sau này, vd xoay
 * ngang màn hình) — pattern chuẩn được khuyến nghị cho react-leaflet trong
 * layout flex/grid động.
 */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    map.invalidateSize();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}

/** Canh khung nhìn quanh vòng tròn bán kính đã chọn (chế độ "Tìm theo nhu
 * cầu") — tách riêng component vì `useMap()` chỉ dùng được bên trong
 * `<MapContainer>`, cùng pattern với `FlyToSelected`. */
function FitToCircle({ center, radiusKm }: { center: GeoPoint | null; radiusKm: number | undefined }) {
  const map = useMap();
  // Dependency theo giá trị nguyên thuỷ (lat/lng/radiusKm), KHÔNG theo
  // identity của object `center` — tránh fitBounds lặp lại mỗi lần cha
  // re-render (vd khi hover đổi) nếu caller lỡ tạo object mới mỗi render.
  useEffect(() => {
    if (!center || !radiusKm) return;
    // KHÔNG dùng `L.circle(...).getBounds()` — circle chưa được add vào map
    // thì chưa có `_point`/`_radius` đã project, gọi `getBounds()` throw
    // "Cannot read properties of undefined (reading 'layerPointToLatLng')".
    // Tính bounds trực tiếp bằng `boundingBoxForRadius` (đã có sẵn, dùng
    // chung với tầng query) thay vì tạo 1 layer chỉ để lấy bounds.
    const box = boundingBoxForRadius(center, radiusKm);
    const bounds = L.latLngBounds([box.latMin, box.lngMin], [box.latMax, box.lngMax]);
    map.fitBounds(bounds, { padding: [24, 24] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng, radiusKm, map]);
  return null;
}

function PriceMarker({
  item,
  isActive,
  onHover,
  onSelect,
}: {
  item: MapListingItem & { lat: number; lng: number };
  isActive: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const icon = useMemo(() => buildPriceIcon(item), [item]);

  // Toggle class trực tiếp trên DOM node có sẵn (không tạo icon mới) để CSS
  // transition (scale + đổi màu) chạy mượt — tạo lại L.divIcon mỗi lần đổi
  // trạng thái sẽ thay hẳn DOM node, làm mất transition.
  useEffect(() => {
    const el = markerRef.current?.getElement();
    const pinEl = el?.querySelector<HTMLElement>(`[data-listing-id="${item.id}"]`);
    pinEl?.classList.toggle(styles.pinActive, isActive);
  }, [isActive, item.id]);

  return (
    <Marker
      ref={markerRef}
      position={[item.lat, item.lng]}
      icon={icon}
      eventHandlers={{
        mouseover: () => onHover(item.id),
        mouseout: () => onHover(null),
        click: () => onSelect(item.id),
      }}
    >
      <Popup>
        <div className={styles.popupCard}>
          {item.isPassed && (
            <Tag color="success" style={{ marginBottom: 6 }}>
              Đã pass thành công
            </Tag>
          )}
          <Tag color={COLOR_FOREST}>{item.regionName}</Tag>
          <div className={styles.popupPrice}>{item.priceShortLabel}</div>
          {item.description && <p className={styles.popupDescription}>{item.description}</p>}
        </div>
      </Popup>
    </Marker>
  );
}

export function ListingsMap({
  items,
  selectedId,
  hoveredId,
  onHover,
  onSelect,
  center,
  radiusKm,
}: {
  items: MapListingItem[];
  selectedId: string | null;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  /** Điểm tâm + bán kính đã chọn ở chế độ "Tìm theo nhu cầu" — chỉ để HIỂN
   * THỊ (vòng tròn + ghim tâm), không dùng để lọc `items` (đã lọc sẵn ở
   * server qua `searchNearbyListings`). `undefined`/`null` = chế độ khu vực,
   * giữ nguyên hành vi cũ hoàn toàn. */
  center?: GeoPoint | null;
  radiusKm?: number;
}) {
  const withCoords = items.filter(
    (item): item is MapListingItem & { lat: number; lng: number } => item.lat !== null && item.lng !== null,
  );

  const selectedItem = withCoords.find((item) => item.id === selectedId) ?? null;
  const flyTarget: [number, number] | null = selectedItem ? [selectedItem.lat, selectedItem.lng] : null;
  const centerPinIcon = useMemo(() => buildLocationPinIcon(), []);

  return (
    <MapContainer center={CAN_THO_CENTER} zoom={DEFAULT_ZOOM} className={styles.mapRoot} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((item) => (
        <PriceMarker
          key={item.id}
          item={item}
          isActive={item.id === selectedId || item.id === hoveredId}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
      {center && radiusKm && (
        <>
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: COLOR_FOREST, fillColor: COLOR_MUSTARD, fillOpacity: 0.12, weight: 2 }}
          />
          <Marker position={[center.lat, center.lng]} icon={centerPinIcon} />
        </>
      )}
      <FlyToSelected target={flyTarget} />
      <FitToCircle center={center ?? null} radiusKm={radiusKm} />
      <MapResizeHandler />
    </MapContainer>
  );
}
