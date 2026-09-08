import { getRepositories } from "@/infra/container";
import { getSession } from "@/infra/session/session";
import { listActiveRegions } from "@/domain/regions/service";
import { searchListings, searchNearbyListings } from "@/domain/listings/service";
import type { ListingSearchFilter, ListingWithDetails, ListingWithDistance, SearchResult } from "@/domain/listings/types";
import { AppError } from "@/domain/shared/errors";
import { HomeSearchSection } from "@/components/search/HomeSearchSection";
import type { NearbySearchInitialValues } from "@/components/map/NearbySearchPanel";
import { SearchPagination } from "@/components/search/SearchPagination";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { ErrorAlert } from "@/components/feedback/ErrorAlert";

interface HomeSearchParams {
  regionId?: string;
  priceMin?: string;
  priceMax?: string;
  moveOutDateTo?: string;
  page?: string;
  mode?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
}

// 9 tin/trang = đúng 3 hàng lưới 3 cột ở desktop (xem ListingGridView) — vừa
// đẹp mắt vừa để phân trang thật sự có tác dụng ở quy mô dữ liệu hiện tại.
const PAGE_SIZE = 9;

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const sp = await searchParams;
  const repos = getRepositories();

  const priceMin = toNumber(sp.priceMin);
  const priceMax = toNumber(sp.priceMax);
  const lat = toNumber(sp.lat);
  const lng = toNumber(sp.lng);
  const radiusKm = toNumber(sp.radiusKm);
  // Chế độ nhu cầu chỉ hợp lệ khi có đủ 3 tham số bắt buộc — URL bị sửa tay
  // thiếu/sai kiểu sẽ tự rơi về chế độ khu vực thay vì crash trang, giống
  // hệt logic ở `/tim-tin/ban-do`.
  const isNearbyMode = sp.mode === "nearby" && lat !== undefined && lng !== undefined && radiusKm !== undefined;

  const [regions, user] = await Promise.all([listActiveRegions(repos.regions), getSession()]);

  if (isNearbyMode) {
    const nearbyInitialValues: NearbySearchInitialValues = { lat, lng, radiusKm, priceMin, priceMax };

    let items: (ListingWithDetails & { distanceKm?: number })[] = [];
    let nearbyError: string | undefined;
    try {
      const results: ListingWithDistance[] = await searchNearbyListings(
        { listings: repos.listings, regions: repos.regions },
        { lat: lat!, lng: lng!, radiusKm: radiusKm!, priceMin, priceMax },
      );
      items = results;
    } catch (error) {
      nearbyError = error instanceof AppError ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
    }

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ marginBottom: 4, fontSize: 28, fontWeight: 700 }}>Tìm tin pass phòng ở Cần Thơ</h1>
          <span style={{ color: "var(--ink-soft)" }}>
            {items.length} tin trong bán kính {radiusKm}km quanh vị trí đã chọn.
          </span>
        </div>

        <HomeSearchSection
          regions={regions}
          mode="nearby"
          regionInitialValues={{}}
          nearbyInitialValues={nearbyInitialValues}
          nearbyError={nearbyError}
          isLoggedIn={Boolean(user)}
        />

        <ListingGrid listings={items} emptyDescription="Thử tăng bán kính hoặc đổi vị trí." />
      </div>
    );
  }

  const regionId = toNumber(sp.regionId);
  const filter: ListingSearchFilter = {
    regionId,
    priceMin,
    priceMax,
    moveOutDateTo: sp.moveOutDateTo || undefined,
    page: toNumber(sp.page) ?? 1,
    pageSize: PAGE_SIZE,
  };

  // `searchListings` giờ validate filter bằng `listingSearchFilterSchema`
  // (trước đây bỏ qua, xem plan validate) — filter ở đây đến từ `searchParams`
  // (URL sửa tay được), nên phải bọc try/catch để URL méo (vd `page` âm)
  // không làm crash cả trang chủ, chỉ rơi về danh sách rỗng + thông báo nhẹ.
  let result: SearchResult<ListingWithDetails> = { items: [], total: 0, page: 1, pageSize: PAGE_SIZE };
  let searchError: string | undefined;
  try {
    result = await searchListings({ listings: repos.listings, regions: repos.regions }, filter);
  } catch (error) {
    searchError = error instanceof AppError ? error.message : "Có lỗi xảy ra, vui lòng thử lại.";
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 4, fontSize: 28, fontWeight: 700 }}>Tìm tin pass phòng ở Cần Thơ</h1>
        <span style={{ color: "var(--ink-soft)" }}>
          {result.total} tin đang hiển thị — lọc theo khu vực, giá, ngày cần pass.
        </span>
      </div>

      <HomeSearchSection
        regions={regions}
        mode="region"
        regionInitialValues={{
          regionId: filter.regionId,
          priceMin: filter.priceMin,
          priceMax: filter.priceMax,
          moveOutDateTo: filter.moveOutDateTo,
        }}
        isLoggedIn={Boolean(user)}
      />

      {searchError && <ErrorAlert message={searchError} />}

      <ListingGrid listings={result.items} />

      {result.total > result.pageSize && (
        <SearchPagination
          current={result.page}
          total={result.total}
          pageSize={result.pageSize}
          regionId={filter.regionId}
          priceMin={filter.priceMin}
          priceMax={filter.priceMax}
          moveOutDateTo={filter.moveOutDateTo}
        />
      )}
    </div>
  );
}
