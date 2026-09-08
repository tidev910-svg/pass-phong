import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/shared/errors";
import type { RegionRepository } from "@/domain/regions/repository";
import type { ListingRepository } from "./repository";
import {
  createListingInputSchema,
  listingSearchFilterSchema,
  listingTagIdsSchema,
  nearbySearchFilterSchema,
} from "./validation";
import type {
  CreateListingInput,
  ListingSearchFilter,
  ListingWithDetails,
  ListingWithDistance,
  NearbySearchFilter,
  SearchResult,
} from "./types";

export interface ListingServiceDeps {
  listings: ListingRepository;
  regions: RegionRepository;
}

export async function createListing(
  deps: ListingServiceDeps,
  userId: string,
  input: CreateListingInput,
) {
  const parsed = createListingInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  const region = await deps.regions.findById(parsed.data.regionId);
  if (!region || !region.isActive) {
    throw new ValidationError("Khu vực không hợp lệ.");
  }

  return deps.listings.create(userId, {
    regionId: parsed.data.regionId,
    price: parsed.data.price,
    moveOutDate: parsed.data.moveOutDate,
    description: parsed.data.description || undefined,
    contactPhone: parsed.data.contactPhone || undefined,
    contactLink: parsed.data.contactLink || undefined,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });
}

/** Chủ tin tự sửa tin — validate + check quyền sở hữu giống các thao tác khác. */
export async function updateListing(
  deps: ListingServiceDeps,
  userId: string,
  listingId: string,
  input: CreateListingInput,
) {
  const parsed = createListingInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }

  await requireOwnedActiveListing(deps, userId, listingId);

  const region = await deps.regions.findById(parsed.data.regionId);
  if (!region || !region.isActive) {
    throw new ValidationError("Khu vực không hợp lệ.");
  }

  return deps.listings.update(listingId, {
    regionId: parsed.data.regionId,
    price: parsed.data.price,
    moveOutDate: parsed.data.moveOutDate,
    description: parsed.data.description || undefined,
    contactPhone: parsed.data.contactPhone || undefined,
    contactLink: parsed.data.contactLink || undefined,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });
}

/** Toàn bộ tin của 1 user (trừ đã xoá) — dùng cho tab "Tin của tôi" ở trang hồ sơ. */
export async function getMyListings(deps: ListingServiceDeps, userId: string): Promise<ListingWithDetails[]> {
  return deps.listings.listByUser(userId);
}

export async function attachListingImages(
  deps: ListingServiceDeps,
  listingId: string,
  storagePaths: string[],
) {
  if (storagePaths.length === 0) return;
  await deps.listings.attachImages(listingId, storagePaths);
}

/** Thay tag của 1 tin — trước đây action gọi thẳng repository, bỏ qua hoàn
 * toàn validate (khác mọi field khác của cùng tin). `tagIds` không bắt buộc
 * hợp lệ theo taxonomy thật (không kiểm tra tag có tồn tại/còn active hay
 * không) — chỉ chặn dữ liệu rác dạng số âm/không phải id/quá nhiều phần tử,
 * đúng mức "trung bình". */
export async function setListingTags(deps: ListingServiceDeps, listingId: string, tagIds: number[]) {
  const parsed = listingTagIdsSchema.safeParse(tagIds);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu tag không hợp lệ.");
  }
  await deps.listings.setListingTags(listingId, parsed.data);
}

export async function searchListings(
  deps: ListingServiceDeps,
  filter: ListingSearchFilter,
): Promise<SearchResult<ListingWithDetails>> {
  const parsed = listingSearchFilterSchema.safeParse(filter);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu tìm kiếm không hợp lệ.");
  }
  return deps.listings.search(parsed.data);
}

/** Chế độ "Tìm theo nhu cầu" (vị trí + bán kính + giá) — TÁCH RIÊNG khỏi
 * `searchListings` (khu vực), xem comment ở `NearbySearchFilter`. */
export async function searchNearbyListings(
  deps: ListingServiceDeps,
  filter: NearbySearchFilter,
): Promise<ListingWithDistance[]> {
  const parsed = nearbySearchFilterSchema.safeParse(filter);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu tìm kiếm không hợp lệ.");
  }
  return deps.listings.searchNearby(parsed.data);
}

export async function getListingById(
  deps: ListingServiceDeps,
  id: string,
): Promise<ListingWithDetails> {
  const listing = await deps.listings.findById(id);
  if (!listing || listing.status === "deleted") {
    throw new NotFoundError("Tin đăng không tồn tại hoặc đã bị gỡ.");
  }
  return listing;
}

async function requireOwnedActiveListing(deps: ListingServiceDeps, userId: string, listingId: string) {
  const listing = await deps.listings.findById(listingId);
  if (!listing || listing.status === "deleted") {
    throw new NotFoundError("Tin đăng không tồn tại.");
  }
  if (listing.userId !== userId) {
    throw new ForbiddenError("Bạn không phải chủ tin đăng này.");
  }
  return listing;
}

export async function deleteListing(deps: ListingServiceDeps, userId: string, listingId: string) {
  await requireOwnedActiveListing(deps, userId, listingId);
  await deps.listings.softDelete(listingId);
}

/** Chủ tin tự xác nhận đã pass phòng thành công — dùng để đo chỉ số thành công. */
export async function confirmListingSuccess(deps: ListingServiceDeps, userId: string, listingId: string) {
  const listing = await requireOwnedActiveListing(deps, userId, listingId);
  if (listing.status !== "active") {
    throw new ValidationError("Tin này không còn ở trạng thái đang hiển thị.");
  }
  await deps.listings.markPassed(listingId);
}

export async function adminListAllListings(deps: ListingServiceDeps, status?: string) {
  return deps.listings.adminListAll(status ? { status } : undefined);
}

export async function adminDeleteListing(deps: ListingServiceDeps, listingId: string) {
  const listing = await deps.listings.findById(listingId);
  if (!listing) throw new NotFoundError("Tin đăng không tồn tại.");
  await deps.listings.softDelete(listingId);
}
