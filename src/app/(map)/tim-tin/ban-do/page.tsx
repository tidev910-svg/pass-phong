import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { listActiveRegions } from "@/domain/regions/service";
import { searchListings, searchNearbyListings } from "@/domain/listings/service";
import type { ListingSearchFilter, ListingWithDetails, ListingWithDistance } from "@/domain/listings/types";
import { formatMoveOutDate, formatPriceShort, formatRelativeCreatedAt } from "@/domain/listings/format";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import { AppError } from "@/domain/shared/errors";
import { MapSearchView } from "@/components/map/MapSearchView";
import type { MapListingItem } from "@/components/map/types";
import type { NearbySearchInitialValues } from "@/components/map/NearbySearchPanel";

export const metadata: Metadata = { title: "Tìm tin trên bản đồ" };

// Trang bản đồ hiển thị TOÀN BỘ kết quả cùng lúc (list + pin đồng bộ), không
// phân trang kiểu trang chủ — pageSize lớn đủ dùng cho quy mô hiện tại
// (chục-trăm tin). Sẽ cần tính lại nếu số tin tăng nhiều (spatial query/
// clustering) — ngoài phạm vi bản MVP này.
const MAP_PAGE_SIZE = 100;

function toMapItem(listing: ListingWithDetails, distanceKm?: number): MapListingItem {
  const cover = listing.images[0];
  return {
    id: listing.id,
    regionName: listing.region.name,
    price: listing.price,
    priceShortLabel: formatPriceShort(listing.price),
    moveOutDateLabel: formatMoveOutDate(listing.moveOutDate),
    createdAtLabel: formatRelativeCreatedAt(listing.createdAt),
    description: listing.description,
    isPassed: listing.status === "passed",
    coverImageUrl: cover ? getListingImagePublicUrl(cover.storagePath) : null,
    lat: listing.lat,
    lng: listing.lng,
    distanceKm,
  };
}

interface MapSearchParams {
  regionId?: string;
  mode?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
  priceMin?: string;
  priceMax?: string;
}

function toFiniteNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default async function MapSearchPage({ searchParams }: { searchParams: Promise<MapSearchParams> }) {
  const sp = await searchParams;
  const repos = getRepositories();

  const lat = toFiniteNumber(sp.lat);
  const lng = toFiniteNumber(sp.lng);
  const radiusKm = toFiniteNumber(sp.radiusKm);
  const priceMin = toFiniteNumber(sp.priceMin);
  const priceMax = toFiniteNumber(sp.priceMax);
  // Chế độ nhu cầu chỉ hợp lệ khi có đủ 3 tham số bắt buộc — URL bị sửa tay
  // thiếu/sai kiểu sẽ tự rơi về chế độ khu vực thay vì crash trang.
  const isNearbyMode = sp.mode === "nearby" && lat !== undefined && lng !== undefined && radiusKm !== undefined;

  if (isNearbyMode) {
    const regions = await listActiveRegions(repos.regions);
    const nearbyInitialValues: NearbySearchInitialValues = { lat, lng, radiusKm, priceMin, priceMax };

    let items: MapListingItem[] = [];
    let nearbyError: string | undefined;
    try {
      const results: ListingWithDistance[] = await searchNearbyListings(
        { listings: repos.listings, regions: repos.regions },
        { lat: lat!, lng: lng!, radiusKm: radiusKm!, priceMin, priceMax },
      );
      items = results.map((listing) => toMapItem(listing, listing.distanceKm));
    } catch (error) {
      nearbyError = error instanceof AppError ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
    }

    return (
      <MapSearchView
        regions={regions}
        items={items}
        selectedRegionId={null}
        mode="nearby"
        nearbyInitialValues={nearbyInitialValues}
        nearbyError={nearbyError}
      />
    );
  }

  const regionId = sp.regionId ? Number(sp.regionId) : undefined;
  const filter: ListingSearchFilter = {
    regionId: Number.isFinite(regionId) ? regionId : undefined,
    pageSize: MAP_PAGE_SIZE,
  };

  const regions = await listActiveRegions(repos.regions);

  // `searchListings` giờ validate filter (trước đây bỏ qua) — filter đến từ
  // `searchParams` (URL sửa tay được), bọc try/catch để không crash trang.
  let items: MapListingItem[] = [];
  let regionError: string | undefined;
  try {
    const result = await searchListings({ listings: repos.listings, regions: repos.regions }, filter);
    items = result.items.map((listing) => toMapItem(listing));
  } catch (error) {
    regionError = error instanceof AppError ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
  }

  return (
    <MapSearchView
      regions={regions}
      items={items}
      selectedRegionId={filter.regionId ?? null}
      mode="region"
      regionError={regionError}
    />
  );
}
