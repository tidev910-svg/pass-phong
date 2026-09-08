"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, Segmented } from "antd";
import type { Region } from "@/domain/regions/types";
import { formatDistanceKm } from "@/domain/listings/format";
import { ListingCard } from "@/components/listings/ListingCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { RegionTagSelect } from "@/components/search/RegionTagSelect";
import { MAX_PRICE } from "@/components/search/PriceRangeSlider";
import { NearbySearchPanel, type NearbySearchInitialValues, type NearbySearchQuery } from "./NearbySearchPanel";
import type { MapListingItem } from "./types";
import styles from "./MapSearchView.module.css";

// react-leaflet/leaflet đụng `window` ngay lúc import module — phải tắt SSR
// hoàn toàn, nếu không Next.js build lỗi "window is not defined". Đây là
// pattern chính thức cho Leaflet + Next.js App Router, không phải workaround
// tạm bợ.
const ListingsMap = dynamic(() => import("./ListingsMap").then((m) => m.ListingsMap), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Đang tải bản đồ...</div>,
});

type SearchMode = "region" | "nearby";

export function MapSearchView({
  regions,
  items,
  selectedRegionId,
  mode,
  nearbyInitialValues,
  nearbyError,
  regionError,
}: {
  regions: Region[];
  items: MapListingItem[];
  selectedRegionId: number | null;
  /** Chế độ ĐÃ ĐƯỢC SERVER XÁC NHẬN dựa trên kết quả `items` hiện có — khác
   * với `activeMode` (state UI, đổi ngay khi bấm segmented, TRƯỚC khi có kết
   * quả mới từ server). Dùng để biết `items` hiện tại có phải là kết quả
   * "tìm theo nhu cầu" thật hay chỉ là dữ liệu cũ (khu vực) còn sót lại lúc
   * người dùng vừa bấm chuyển chế độ nhưng chưa bấm "Tìm phòng". */
  mode: SearchMode;
  nearbyInitialValues?: NearbySearchInitialValues;
  nearbyError?: string;
  /** Lỗi validate filter khu vực (từ `searchParams` bị sửa tay) — cùng cách
   * xử lý `nearbyError`, tránh crash trang khi URL méo. */
  regionError?: string;
}) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<SearchMode>(mode);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hasSearchedNearby = mode === "nearby";
  const withCoordsCount = items.filter((item) => item.lat !== null && item.lng !== null).length;

  // Marker trên bản đồ được click -> cuộn card tương ứng vào khung nhìn nếu
  // đang nằm ngoài vùng cuộn của cột trái.
  useEffect(() => {
    if (!selectedId) return;
    cardRefs.current[selectedId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  function handleRegionChange(regionId: number | null) {
    const params = new URLSearchParams();
    if (regionId) params.set("regionId", String(regionId));
    router.push(`/tim-tin/ban-do?${params.toString()}`);
  }

  function handleModeChange(next: SearchMode) {
    setActiveMode(next);
    if (next === "region") {
      // Quay lại chế độ khu vực — reset về danh sách mặc định (bỏ hết query
      // nhu cầu cũ), khớp hành vi bấm "Tất cả khu vực".
      router.push("/tim-tin/ban-do");
    }
    // Chuyển sang "nhu cầu": chỉ đổi UI tại chỗ (hiện NearbySearchPanel),
    // CHƯA điều hướng — chờ submit panel mới push URL mới (đúng yêu cầu
    // "điền đầy đủ mới hiển thị kết quả").
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
    router.push(`/tim-tin/ban-do?${params.toString()}`);
  }

  const nearbyCenter =
    hasSearchedNearby && nearbyInitialValues?.lat !== undefined && nearbyInitialValues?.lng !== undefined
      ? { lat: nearbyInitialValues.lat, lng: nearbyInitialValues.lng }
      : null;
  const nearbyRadiusKm = hasSearchedNearby ? nearbyInitialValues?.radiusKm : undefined;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.filterChips}>
          <Segmented
            value={activeMode}
            onChange={(value) => handleModeChange(value as SearchMode)}
            options={[
              { label: "Theo khu vực", value: "region" },
              { label: "Theo nhu cầu", value: "nearby" },
            ]}
            style={{ marginBottom: activeMode === "region" ? 8 : 0 }}
          />
          {activeMode === "region" && (
            <RegionTagSelect regions={regions} value={selectedRegionId} onChange={handleRegionChange} />
          )}
          {activeMode === "region" && regionError && (
            <Alert type="error" showIcon title={regionError} style={{ marginTop: 8 }} />
          )}
        </div>
        <div className={styles.viewToggle}>
          <Link href="/" className={styles.viewToggleItem}>
            Chỉ danh sách
          </Link>
          <span className={`${styles.viewToggleItem} ${styles.viewToggleItemActive}`}>Danh sách + Bản đồ</span>
        </div>
      </div>

      {activeMode === "nearby" && (
        <div className={styles.nearbyPanelRow}>
          <NearbySearchPanel initialValues={nearbyInitialValues} onSubmit={handleNearbySubmit} />
          {nearbyError && <Alert type="error" showIcon title={nearbyError} style={{ marginTop: 12 }} />}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.listPane}>
          {activeMode === "nearby" && !hasSearchedNearby ? null : (
            <div className={styles.countLine}>
              {activeMode === "nearby"
                ? `${items.length} tin trong bán kính ${nearbyInitialValues?.radiusKm ?? ""}km quanh vị trí đã chọn`
                : `${items.length} tin — ${withCoordsCount} tin có vị trí trên bản đồ`}
            </div>
          )}

          {activeMode === "nearby" && !hasSearchedNearby ? (
            <EmptyState
              title="Chọn vị trí trên bản đồ để bắt đầu"
              description="Kéo bán kính và giá cho phù hợp, rồi bấm “Tìm phòng” ở panel bên trên."
            />
          ) : items.length === 0 ? (
            <EmptyState
              title="Chưa có tin nào khớp"
              description={
                activeMode === "nearby" ? "Thử tăng bán kính hoặc đổi vị trí." : "Thử đổi khu vực lọc ở trên."
              }
            />
          ) : (
            items.map((item) => {
              const hasCoords = item.lat !== null && item.lng !== null;
              const isSelected = item.id === selectedId;

              return (
                <div key={item.id}>
                  <div
                    ref={(el) => {
                      cardRefs.current[item.id] = el;
                    }}
                    className={`${styles.cardWrap} ${isSelected ? styles.cardWrapSelected : ""}`}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId((current) => (current === item.id ? null : current))}
                    onClickCapture={(e) => {
                      // Có toạ độ: click để chọn + bay bản đồ (theo spec),
                      // KHÔNG điều hướng sang trang chi tiết — chặn Link mặc
                      // định của ListingCard bằng preventDefault ở capture
                      // phase (chạy trước onClick của thẻ <a> bên trong).
                      // Không có toạ độ: không có gì để đồng bộ trên bản đồ,
                      // để hành vi click-để-xem-chi-tiết mặc định hoạt động.
                      if (!hasCoords) return;
                      e.preventDefault();
                      setSelectedId(item.id);
                    }}
                  >
                    <ListingCard item={item} />
                    {isSelected && (
                      <Link href={`/tin/${item.id}`} className={styles.detailLink}>
                        Xem chi tiết →
                      </Link>
                    )}
                  </div>
                  {!hasCoords && <div className={styles.noLocationNote}>📍 Chưa có vị trí trên bản đồ</div>}
                  {hasCoords && item.distanceKm !== undefined && (
                    <div className={styles.distanceBadge}>
                      📍 Cách vị trí đã chọn {formatDistanceKm(item.distanceKm)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className={styles.mapPane}>
          <ListingsMap
            items={activeMode === "nearby" && !hasSearchedNearby ? [] : items}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={setSelectedId}
            center={nearbyCenter}
            radiusKm={nearbyRadiusKm}
          />
        </div>
      </div>
    </div>
  );
}
