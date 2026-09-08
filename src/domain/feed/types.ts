import type { ListingWithDetails } from "@/domain/listings/types";

/**
 * Hồ sơ sở thích Bảng tin — 1 bản ghi duy nhất mỗi user, dùng để chấm điểm
 * xếp hạng (xem `scoring.ts`). KHÁC `SavedSearch` (nhiều tìm kiếm đã lưu,
 * có badge đếm tin mới) — đây là 1 hồ sơ liên tục, sửa tại chỗ, không có
 * khái niệm "nhiều bản".
 */
export interface FeedPreferences {
  userId: string;
  /** Khu vực ưa thích — rỗng nghĩa là "không ưu tiên theo khu vực", KHÔNG
   * phải "mọi khu vực" (khác `RegionTagSelect`'s `null` = tất cả). */
  regionIds: number[];
  /** Loại phòng/tiện ích quan tâm — bắt buộc chọn ít nhất 1 khi thiết lập
   * (xem `upsertFeedPreferencesInputSchema`). */
  tagIds: number[];
  priceMin: number | null;
  priceMax: number | null;
  /** Vị trí trung tâm + bán kính — optional, đi theo cặp với `radiusKm`
   * (giống ràng buộc lat/lng ở `CreateListingInput`). */
  lat: number | null;
  lng: number | null;
  radiusKm: number | null;
  updatedAt: string;
}

export interface UpsertFeedPreferencesInput {
  regionIds: number[];
  tagIds: number[];
  priceMin?: number;
  priceMax?: number;
  lat?: number | null;
  lng?: number | null;
  radiusKm?: number | null;
}

/** Lý do 1 tin được xếp hạng cao — dùng để hiển thị `matchLabel` trên card
 * feed (xem `getFeedPage`'s view-model mapping), ưu tiên theo thứ tự khai
 * báo ở đây khi chọn 1 lý do nổi bật nhất để hiển thị. */
export type FeedMatchReason = "tags" | "region" | "proximity" | "price" | "new";

export interface FeedItem extends ListingWithDetails {
  matchScore: number;
  matchReasons: FeedMatchReason[];
  /** Chỉ có giá trị khi user đã thiết lập vị trí trung tâm VÀ tin có toạ độ. */
  distanceKm?: number;
}

/** Cursor phân trang feed — vì thứ tự là điểm số (không phải cột SQL ổn
 * định), cursor phải mang theo cả điểm số lẫn id của item cuối trang trước
 * để xác định chính xác "phần còn lại sau item này" trong danh sách đã sort.
 * `now` là mốc thời gian dùng để chấm điểm độ mới (`scoreListing`) — ĐÓNG
 * BĂNG từ trang đầu tiên và truyền lại y nguyên qua các trang sau, KHÔNG
 * tính lại `new Date()` mỗi request. Nếu tính lại, độ mới của mọi tin giảm
 * dần theo thời gian thực giữa các lần cuộn -> điểm 1 tin ở trang sau luôn
 * thấp hơn chính nó lúc tính trang trước -> lọt qua điều kiện cắt trang
 * (`score < cursor.score`) -> tin bị lặp lại (hoặc tệ hơn, tin khác bị lọt
 * mất) giữa 2 trang liền kề của cùng 1 phiên cuộn. */
export interface FeedCursor {
  score: number;
  lastId: string;
  now: string;
}

export interface FeedPage {
  items: FeedItem[];
  /** Chuỗi cursor đã encode — `null` nghĩa là hết dữ liệu. */
  nextCursor: string | null;
}
