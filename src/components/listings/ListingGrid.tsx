import type { ListingWithDetails } from "@/domain/listings/types";
import { formatMoveOutDate, formatRelativeCreatedAt } from "@/domain/listings/format";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import { ListingGridView } from "./ListingGridView";
import type { ListingCardViewModel } from "./ListingCard";

/**
 * Server Component: resolve URL ảnh (hạ tầng) + format hiển thị TRƯỚC khi
 * đưa xuống Client Component — ListingGridView/ListingCard không được phép
 * đụng vào infra/storage (bị chặn bởi "server-only").
 */
function toViewModel(listing: ListingWithDetails & { distanceKm?: number }): ListingCardViewModel {
  const cover = listing.images[0];
  return {
    id: listing.id,
    regionName: listing.region.name,
    price: listing.price,
    moveOutDateLabel: formatMoveOutDate(listing.moveOutDate),
    createdAtLabel: formatRelativeCreatedAt(listing.createdAt),
    description: listing.description,
    isPassed: listing.status === "passed",
    coverImageUrl: cover ? getListingImagePublicUrl(cover.storagePath) : null,
    distanceKm: listing.distanceKm,
    tags: listing.tags.map((tag) => ({ id: tag.id, label: tag.label })),
  };
}

export function ListingGrid({
  listings,
  emptyDescription,
}: {
  listings: (ListingWithDetails & { distanceKm?: number })[];
  emptyDescription?: string;
}) {
  return <ListingGridView items={listings.map(toViewModel)} emptyDescription={emptyDescription} />;
}
