import type { ListingRepository } from "@/domain/listings/repository";
import type { SavedSearchRepository } from "@/domain/saved-searches/repository";

export interface AccountStats {
  liveCount: number;
  passedCount: number;
  savedSearchCount: number;
}

export interface AccountStatsDeps {
  listings: ListingRepository;
  savedSearches: SavedSearchRepository;
}

/**
 * Nguồn DUY NHẤT cho 3 số liệu "đang đăng / đã pass / đã lưu" — dùng cho cả
 * header card ở trang `/tai-khoan` (derive từ danh sách đã fetch sẵn cho tab
 * "Tin của tôi", không gọi lại hàm này) VÀ dropdown tài khoản ở header (gọi
 * hàm này trực tiếp vì header không cần load toàn bộ danh sách tin, chỉ cần
 * đếm — dùng `countByUserStatus` nhẹ hơn `listByUser`).
 */
export async function getAccountStats(deps: AccountStatsDeps, userId: string): Promise<AccountStats> {
  const [statusCounts, savedSearchCount] = await Promise.all([
    deps.listings.countByUserStatus(userId),
    deps.savedSearches.countByUser(userId),
  ]);
  return {
    liveCount: statusCounts.active,
    passedCount: statusCounts.passed,
    savedSearchCount,
  };
}
