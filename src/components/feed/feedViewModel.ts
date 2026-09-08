import type { FeedItem, FeedMatchReason } from "@/domain/feed/types";
import { formatMoveOutDate, formatRelativeCreatedAt } from "@/domain/listings/format";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import type { ListingSaveRepository } from "@/domain/listing-saves/repository";
import { getSaveCounts } from "@/domain/listing-saves/service";

/** View-model cho 1 tin ở Bảng tin — dùng riêng cho `FeedPostCard` (khác
 * `ListingCardViewModel`, vốn phục vụ thẻ ghim bulletin-board ở nơi khác) vì
 * cần thêm `regionId`/`tagIds` thô (không chỉ label hiển thị, cho
 * `FeedFilterChipBar` lọc lại phía client) và trạng thái lưu tin. */
export interface FeedItemViewModel {
  id: string;
  regionId: number;
  regionName: string;
  price: number;
  moveOutDateLabel: string;
  createdAtLabel: string;
  description: string | null;
  isPassed: boolean;
  coverImageUrl: string | null;
  distanceKm?: number;
  tags: { id: number; label: string }[];
  tagIds: number[];
  matchLabel?: string;
  isSaved: boolean;
  saveCount: number;
}

/** Tín hiệu lưu tin cho 1 item — tách riêng khỏi `FeedItem` (domain) vì đến
 * từ 1 truy vấn khác (`listing-saves`), không phải kết quả chấm điểm feed. */
export interface FeedItemSaveState {
  isSaved: boolean;
  saveCount: number;
}

// Ưu tiên hiển thị 1 lý do nổi bật nhất khi tin khớp nhiều tiêu chí — thứ tự
// theo mức độ "cố ý" của người dùng (tag/khu vực do tự chọn quan trọng hơn
// độ mới, vốn luôn đúng với mọi tin).
const REASON_PRIORITY: FeedMatchReason[] = ["tags", "region", "proximity", "price", "new"];

const REASON_LABEL: Record<FeedMatchReason, string> = {
  tags: "✨ Phù hợp sở thích của bạn",
  region: "📍 Đúng khu vực bạn chọn",
  proximity: "📍 Gần vị trí bạn chọn",
  price: "💰 Đúng khoảng giá bạn tìm",
  new: "🆕 Tin mới đăng",
};

function pickMatchLabel(reasons: FeedMatchReason[]): string | undefined {
  const top = REASON_PRIORITY.find((reason) => reasons.includes(reason));
  return top ? REASON_LABEL[top] : undefined;
}

/**
 * Map `FeedItem` (domain) + trạng thái lưu tin → view-model hiển thị — cùng
 * vai trò `ListingGrid.tsx`'s `toViewModel` (resolve URL ảnh hạ tầng + format
 * hiển thị TRƯỚC khi đưa xuống Client Component), dùng chung cho cả SSR
 * trang đầu (`/bang-tin/page.tsx`) và Route Handler tải thêm (`/api/bang-tin`).
 * Nhận `saveState` riêng (không tự query) vì việc lấy trạng thái lưu tin cho
 * CẢ TRANG (nhiều tin cùng lúc) hiệu quả hơn khi gộp thành 1-2 query ở nơi
 * gọi, thay vì mỗi item tự query — xem `getSaveCounts`/`listSavedListingIds`.
 */
export function toFeedItemViewModel(item: FeedItem, saveState: FeedItemSaveState): FeedItemViewModel {
  const cover = item.images[0];
  return {
    id: item.id,
    regionName: item.region.name,
    regionId: item.regionId,
    price: item.price,
    moveOutDateLabel: formatMoveOutDate(item.moveOutDate),
    createdAtLabel: formatRelativeCreatedAt(item.createdAt),
    description: item.description,
    isPassed: item.status === "passed",
    coverImageUrl: cover ? getListingImagePublicUrl(cover.storagePath) : null,
    distanceKm: item.distanceKm,
    tags: item.tags.map((tag) => ({ id: tag.id, label: tag.label })),
    tagIds: item.tags.map((tag) => tag.id),
    matchLabel: pickMatchLabel(item.matchReasons),
    isSaved: saveState.isSaved,
    saveCount: saveState.saveCount,
  };
}

/**
 * Map cả 1 trang `FeedItem[]` → view-model cùng lúc, tự lấy trạng thái lưu
 * tin cho TOÀN TRANG bằng 1-2 query gộp (không phải mỗi item tự query) —
 * dùng chung cho cả SSR trang đầu (`bang-tin/page.tsx`) và Route Handler tải
 * thêm (`/api/bang-tin`), tránh lặp logic gộp query giữa 2 nơi.
 */
export async function toFeedItemViewModels(
  items: FeedItem[],
  deps: { listingSaves: ListingSaveRepository },
  userId: string,
): Promise<FeedItemViewModel[]> {
  if (items.length === 0) return [];
  const ids = items.map((item) => item.id);
  const [counts, savedIds] = await Promise.all([
    getSaveCounts(deps, ids),
    deps.listingSaves.listListingIdsByUser(userId),
  ]);
  const savedSet = new Set(savedIds);
  return items.map((item) =>
    toFeedItemViewModel(item, { isSaved: savedSet.has(item.id), saveCount: counts[item.id] ?? 0 }),
  );
}
