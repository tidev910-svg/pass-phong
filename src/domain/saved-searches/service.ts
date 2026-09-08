import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/shared/errors";
import type { ListingRepository } from "@/domain/listings/repository";
import type { SavedSearchRepository } from "./repository";
import { createSavedSearchInputSchema, MAX_SAVED_SEARCHES_PER_USER } from "./validation";
import type { CreateSavedSearchInput, SavedSearchWithNewMatches } from "./types";

export interface SavedSearchServiceDeps {
  savedSearches: SavedSearchRepository;
  listings: ListingRepository;
}

export async function createSavedSearch(
  deps: SavedSearchServiceDeps,
  userId: string,
  input: CreateSavedSearchInput,
) {
  const parsed = createSavedSearchInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  const count = await deps.savedSearches.countByUser(userId);
  if (count >= MAX_SAVED_SEARCHES_PER_USER) {
    throw new ValidationError(
      `Bạn chỉ có thể lưu tối đa ${MAX_SAVED_SEARCHES_PER_USER} tìm kiếm. Hãy xoá bớt trước khi lưu thêm.`,
    );
  }

  return deps.savedSearches.create(userId, parsed.data);
}

// Số tin preview hiển thị ngay trong danh sách "Tìm kiếm đã lưu" — chỉ cần
// vài tin để người dùng thấy có gì đang khớp, xem hết thì bấm "Xem kết quả"
// (trang riêng, không giới hạn). 3 đủ lấp 1 hàng ngang trên mobile.
const PREVIEW_LISTINGS_LIMIT = 3;

/** Danh sách saved search kèm số tin mới khớp + vài tin khớp mới nhất —
 * hiển thị ở trang "Tìm kiếm đã lưu". */
export async function listWithNewMatchCounts(
  deps: SavedSearchServiceDeps,
  userId: string,
): Promise<SavedSearchWithNewMatches[]> {
  const searches = await deps.savedSearches.listByUser(userId);
  return Promise.all(
    searches.map(async (search) => {
      const filter = {
        regionId: search.regionId ?? undefined,
        priceMin: search.priceMin ?? undefined,
        priceMax: search.priceMax ?? undefined,
        moveOutDateFrom: search.moveOutDateFrom ?? undefined,
        moveOutDateTo: search.moveOutDateTo ?? undefined,
      };
      const [newMatchesCount, preview] = await Promise.all([
        deps.listings.countMatchingCreatedAfter(filter, search.lastViewedAt),
        deps.listings.search({ ...filter, pageSize: PREVIEW_LISTINGS_LIMIT }),
      ]);
      return {
        ...search,
        newMatchesCount,
        totalMatches: preview.total,
        previewListings: preview.items,
      };
    }),
  );
}

async function requireOwnedSavedSearch(deps: SavedSearchServiceDeps, userId: string, id: string) {
  const search = await deps.savedSearches.findById(id);
  if (!search) throw new NotFoundError("Không tìm thấy tìm kiếm đã lưu.");
  if (search.userId !== userId) throw new ForbiddenError();
  return search;
}

/**
 * Xem kết quả của 1 saved search — cập nhật last_viewed_at NGAY LÚC NÀY
 * (khi user thực sự bấm vào xem), không phải lúc chỉ nhìn thấy badge,
 * để badge không tự mất trước khi user thật sự xem kết quả.
 */
export async function viewSavedSearchResults(
  deps: SavedSearchServiceDeps,
  userId: string,
  savedSearchId: string,
) {
  const search = await requireOwnedSavedSearch(deps, userId, savedSearchId);
  const result = await deps.listings.search({
    regionId: search.regionId ?? undefined,
    priceMin: search.priceMin ?? undefined,
    priceMax: search.priceMax ?? undefined,
    moveOutDateFrom: search.moveOutDateFrom ?? undefined,
    moveOutDateTo: search.moveOutDateTo ?? undefined,
  });
  await deps.savedSearches.touchLastViewed(savedSearchId);
  return result;
}

export async function deleteSavedSearch(deps: SavedSearchServiceDeps, userId: string, id: string) {
  await requireOwnedSavedSearch(deps, userId, id);
  await deps.savedSearches.delete(id);
}
