import { describeSavedSearchFilter } from "@/domain/saved-searches/format";
import { formatPriceShort } from "@/domain/listings/format";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import type { SavedSearchWithNewMatches } from "@/domain/saved-searches/types";
import type { SavedSearchViewModel } from "./SavedSearchListView";

/**
 * Map `SavedSearchWithNewMatches` (domain) sang view-model thuần cho
 * `SavedSearchListView` — dùng chung ở cả `/tim-kiem-da-luu` và tab "Tìm
 * kiếm đã lưu" của trang hồ sơ (`/tai-khoan`), tránh lặp lại logic resolve
 * URL ảnh + format giá ở 2 nơi. File này KHÔNG có "use client" (khác
 * `SavedSearchListView`) vì cần gọi `getListingImagePublicUrl` (hạ tầng) —
 * chỉ gọi được từ Server Component, giống cách `ListingGrid.tsx` tách việc
 * này khỏi client component nhận dữ liệu.
 */
export function toSavedSearchViewModel(search: SavedSearchWithNewMatches): SavedSearchViewModel {
  return {
    id: search.id,
    summary: describeSavedSearchFilter(search),
    newMatchesCount: search.newMatchesCount,
    totalMatches: search.totalMatches,
    previewListings: search.previewListings.map((listing) => {
      const cover = listing.images[0];
      return {
        id: listing.id,
        regionName: listing.region.name,
        coverImageUrl: cover ? getListingImagePublicUrl(cover.storagePath) : null,
        priceLabel: formatPriceShort(listing.price),
      };
    }),
  };
}
