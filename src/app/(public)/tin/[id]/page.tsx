import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/infra/container";
import { getSession } from "@/infra/session/session";
import { getListingById } from "@/domain/listings/service";
import { formatMoveOutDate, formatRelativeCreatedAt } from "@/domain/listings/format";
import { NotFoundError } from "@/domain/shared/errors";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import { getSaveCounts, isListingSaved } from "@/domain/listing-saves/service";
import { ListingDetailView } from "@/components/listings/ListingDetailView";

/**
 * `cache()` dedupe theo `id` trong cùng 1 request — `generateMetadata` và
 * page component đều gọi hàm này nhưng chỉ tốn 1 lượt query DB.
 */
const getCachedListing = cache((id: string) => {
  const repos = getRepositories();
  return getListingById({ listings: repos.listings, regions: repos.regions }, id);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const listing = await getCachedListing(id);
    return {
      title: `Pass phòng ${listing.region.name} — ${listing.price.toLocaleString("vi-VN")}đ`,
      description: listing.description ?? undefined,
    };
  } catch {
    return { title: "Tin đăng" };
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing;
  try {
    listing = await getCachedListing(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const user = await getSession();
  const repos = getRepositories();
  const [saveCounts, isSaved] = await Promise.all([
    getSaveCounts({ listingSaves: repos.listingSaves }, [listing.id]),
    user ? isListingSaved({ listingSaves: repos.listingSaves }, user.id, listing.id) : Promise.resolve(false),
  ]);

  return (
    <ListingDetailView
      isOwner={user?.id === listing.userId}
      isLoggedIn={Boolean(user)}
      listing={{
        id: listing.id,
        regionName: listing.region.name,
        price: listing.price,
        moveOutDateLabel: formatMoveOutDate(listing.moveOutDate),
        createdAtLabel: formatRelativeCreatedAt(listing.createdAt),
        description: listing.description,
        contactPhone: listing.contactPhone,
        contactLink: listing.contactLink,
        isPassed: listing.status === "passed",
        isActive: listing.status === "active",
        imageUrls: listing.images.map((image) => getListingImagePublicUrl(image.storagePath)),
        tags: listing.tags.map((tag) => ({ id: tag.id, label: tag.label })),
        isSaved,
        saveCount: saveCounts[listing.id] ?? 0,
      }}
    />
  );
}
