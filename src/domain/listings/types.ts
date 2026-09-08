import type { Region } from "@/domain/regions/types";
import type { ListingTag } from "@/domain/listing-tags/types";

export type ListingStatus = "active" | "deleted" | "passed";

export interface ListingImage {
  id: string;
  storagePath: string;
  displayOrder: number;
}

export interface Listing {
  id: string;
  userId: string;
  regionId: number;
  price: number;
  moveOutDate: string; // ISO date (YYYY-MM-DD)
  description: string | null;
  contactPhone: string | null;
  contactLink: string | null;
  status: ListingStatus;
  passedConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Null nếu tin chưa gắn vị trí (tin cũ trước khi có map picker, hoặc người
   * đăng bỏ qua bước chọn vị trí — bước này không bắt buộc). Luôn null cùng
   * lúc với `lng` (ràng buộc ở DB: `chk_lat_lng_together`). */
  lat: number | null;
  lng: number | null;
}

/** Listing kèm dữ liệu cần cho hiển thị (card/detail), không cần join thủ công ở UI. */
export interface ListingWithDetails extends Listing {
  region: Region;
  images: ListingImage[];
  /** Loại phòng/tiện ích đã gắn — rỗng nếu người đăng bỏ qua bước chọn tag
   * (không bắt buộc) hoặc tin đăng từ trước khi có tính năng tag. */
  tags: ListingTag[];
}

export interface CreateListingInput {
  regionId: number;
  price: number;
  moveOutDate: string;
  description?: string;
  contactPhone?: string;
  contactLink?: string;
  /** Chọn qua map picker ở form đăng tin/sửa tin. Luôn đi theo cặp — có
   * 1 trong 2 thì phải có cả 2. `undefined` = không đụng tới (đăng tin mới,
   * chưa chọn vị trí); `null` = xoá vị trí đang có (chỉ có ý nghĩa khi sửa
   * tin, xem `updateListing`/`ListingRepository.update`). */
  lat?: number | null;
  lng?: number | null;
  /** Loại phòng/tiện ích — không bắt buộc (xem TagPicker). Không đi qua
   * `ListingRepository.create`/`update` (giống ảnh) — set riêng sau khi tạo/
   * sửa tin qua `ListingRepository.setListingTags`. */
  tagIds?: number[];
}

export interface ListingSearchFilter {
  regionId?: number;
  priceMin?: number;
  priceMax?: number;
  moveOutDateFrom?: string;
  moveOutDateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Filter cho chế độ "Tìm theo nhu cầu" (vị trí + bán kính + giá) ở
 * `/tim-tin/ban-do` — TÁCH RIÊNG khỏi `ListingSearchFilter` (không phải
 * region-based), vì khu vực không có toạ độ tâm nên không thể diễn đạt bán
 * kính qua `ListingSearchFilter.regionId`. Không có page/pageSize — không
 * phân trang thật, cùng tinh thần `MAP_PAGE_SIZE` đã dùng ở trang bản đồ.
 */
export interface NearbySearchFilter {
  lat: number;
  lng: number;
  radiusKm: number;
  priceMin?: number;
  priceMax?: number;
}

/** Listing kèm khoảng cách tới điểm tìm kiếm — chỉ có ý nghĩa trong kết quả
 * `searchNearby` (chế độ "Tìm theo nhu cầu"), không dùng cho `search()`
 * (chế độ khu vực). */
export interface ListingWithDistance extends ListingWithDetails {
  distanceKm: number;
}
