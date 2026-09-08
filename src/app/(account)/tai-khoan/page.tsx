import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { getMyListings } from "@/domain/listings/service";
import { listWithNewMatchCounts } from "@/domain/saved-searches/service";
import { toSavedSearchViewModel } from "@/components/search/saved-search-view-model";
import { listActiveRegions } from "@/domain/regions/service";
import { listActiveListingTags } from "@/domain/listing-tags/service";
import { getFeedPreferences } from "@/domain/feed/service";
import { listSavedListingsWithDetails } from "@/domain/listing-saves/service";
import { formatMoveOutDate, formatRelativeCreatedAt } from "@/domain/listings/format";
import { formatJoinedDate } from "@/domain/auth/format";
import { getListingImagePublicUrl } from "@/infra/storage/image-storage";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type { MyListingItem } from "@/components/listings/MyListingCard";
import type { ListingCardViewModel } from "@/components/listings/ListingCard";

export const metadata: Metadata = { title: "Tài khoản của tôi" };

export default async function AccountPage() {
  const user = await requireSession();
  const repos = getRepositories();

  const [listings, savedSearches, regions, tags, feedPreferences, savedListings] = await Promise.all([
    getMyListings({ listings: repos.listings, regions: repos.regions }, user.id),
    listWithNewMatchCounts({ savedSearches: repos.savedSearches, listings: repos.listings }, user.id),
    listActiveRegions(repos.regions),
    listActiveListingTags(repos.listingTags),
    getFeedPreferences({ feedPreferences: repos.feedPreferences, listings: repos.listings }, user.id),
    listSavedListingsWithDetails({ listingSaves: repos.listingSaves, listings: repos.listings }, user.id),
  ]);

  const myListings: MyListingItem[] = listings.map((listing) => {
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
      // `listByUser` đã loại tin status='deleted' ở tầng repository — ở đây
      // chỉ còn 'active' | 'passed'.
      status: listing.status as "active" | "passed",
    };
  });

  const liveCount = myListings.filter((l) => l.status === "active").length;
  const passedCount = myListings.filter((l) => l.status === "passed").length;

  // Map thủ công sang `ListingCardViewModel` (giống hệt cách `myListings`
  // map ở trên) thay vì dùng `ListingGrid` (Server Component) trực tiếp —
  // `ProfileTabs` là Client Component nên chỉ nhận được dữ liệu thuần đã
  // resolve sẵn, không thể tự import 1 Server Component vào giữa cây client.
  const savedListingItems: ListingCardViewModel[] = savedListings.map((listing) => {
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
      tags: listing.tags.map((tag) => ({ id: tag.id, label: tag.label })),
    };
  });

  return (
    <div>
      <ProfileHeaderCard
        user={{
          username: user.username,
          displayName: user.displayName,
          isVerifiedStudent: user.isVerifiedStudent,
          createdAtLabel: formatJoinedDate(user.createdAt),
        }}
        liveCount={liveCount}
        passedCount={passedCount}
        savedSearchCount={savedSearches.length}
      />

      <ProfileTabs
        myListings={myListings}
        savedSearches={savedSearches.map(toSavedSearchViewModel)}
        initialDisplayName={user.displayName ?? ""}
        initialPhoneOrZalo={user.phoneOrZalo ?? ""}
        feedRegions={regions}
        feedTags={tags}
        feedPreferences={feedPreferences}
        savedListings={savedListingItems}
      />
    </div>
  );
}
