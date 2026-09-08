import type { ListingWithDetails } from "@/domain/listings/types";

export interface SavedSearch {
  id: string;
  userId: string;
  regionId: number | null;
  priceMin: number | null;
  priceMax: number | null;
  moveOutDateFrom: string | null;
  moveOutDateTo: string | null;
  lastViewedAt: string;
  createdAt: string;
}

export interface CreateSavedSearchInput {
  regionId?: number;
  priceMin?: number;
  priceMax?: number;
  moveOutDateFrom?: string;
  moveOutDateTo?: string;
}

/** Saved search kèm số tin mới khớp kể từ lần xem gần nhất — dùng cho badge UI.
 * Kèm thêm vài tin khớp mới nhất (`previewListings`, tối đa
 * `PREVIEW_LISTINGS_LIMIT` ở service) + tổng số tin đang khớp (`totalMatches`,
 * KHÔNG phụ thuộc `lastViewedAt`, khác `newMatchesCount`) để hiển thị preview
 * ngay trong danh sách "Tìm kiếm đã lưu" thay vì bắt phải bấm "Xem kết quả"
 * mới thấy có tin gì. */
export interface SavedSearchWithNewMatches extends SavedSearch {
  newMatchesCount: number;
  totalMatches: number;
  previewListings: ListingWithDetails[];
}
