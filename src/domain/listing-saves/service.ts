import { NotFoundError } from "@/domain/shared/errors";
import type { ListingRepository } from "@/domain/listings/repository";
import type { ListingWithDetails } from "@/domain/listings/types";
import type { ListingSaveRepository } from "./repository";

export interface ListingSaveServiceDeps {
  listingSaves: ListingSaveRepository;
  listings: ListingRepository;
}

export async function setListingSaved(
  deps: ListingSaveServiceDeps,
  userId: string,
  listingId: string,
  saved: boolean,
) {
  const listing = await deps.listings.findById(listingId);
  if (!listing || listing.status === "deleted") {
    throw new NotFoundError("Tin đăng không tồn tại hoặc đã bị gỡ.");
  }
  if (saved) {
    await deps.listingSaves.create(userId, listingId);
  } else {
    await deps.listingSaves.delete(userId, listingId);
  }
}

export async function isListingSaved(
  deps: Pick<ListingSaveServiceDeps, "listingSaves">,
  userId: string,
  listingId: string,
): Promise<boolean> {
  return deps.listingSaves.isSaved(userId, listingId);
}

export async function getSaveCounts(
  deps: Pick<ListingSaveServiceDeps, "listingSaves">,
  listingIds: string[],
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};
  return deps.listingSaves.countByListingIds(listingIds);
}

/** Toàn bộ tin đã lưu của 1 user, kèm dữ liệu hiển thị đầy đủ — dùng cho tab
 * "Tin đã lưu" ở `/tai-khoan`. Giữ đúng thứ tự lưu gần nhất trước (không phải
 * thứ tự `created_at` của tin), loại tin đã bị xoá khỏi hệ thống. */
export async function listSavedListingsWithDetails(
  deps: ListingSaveServiceDeps,
  userId: string,
): Promise<ListingWithDetails[]> {
  const ids = await deps.listingSaves.listListingIdsByUser(userId);
  if (ids.length === 0) return [];
  const listings = await deps.listings.findByIds(ids);
  const byId = new Map(listings.map((listing) => [listing.id, listing]));
  return ids
    .map((id) => byId.get(id))
    .filter((listing): listing is ListingWithDetails => Boolean(listing) && listing!.status !== "deleted");
}
