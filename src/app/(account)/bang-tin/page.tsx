import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { listActiveRegions } from "@/domain/regions/service";
import { listActiveListingTags } from "@/domain/listing-tags/service";
import { getFeedPage, getFeedPreferences } from "@/domain/feed/service";
import { toFeedItemViewModels } from "@/components/feed/feedViewModel";
import { FeedInfiniteList } from "@/components/feed/FeedInfiniteList";
import type { FeedFilterOption } from "@/components/feed/FeedFilterChipBar";

export const metadata: Metadata = { title: "Bảng tin" };

/**
 * Cổng vào Bảng tin — bắt buộc đã thiết lập sở thích (`feed_preferences`)
 * trước khi xem, redirect sang `/bang-tin/thiet-lap` nếu chưa có. Trang đầu
 * render server-side thẳng (không qua `/api/bang-tin`) cho first paint
 * nhanh, đúng cách mọi trang khác trong app hoạt động — chỉ các trang SAU
 * (cuộn thêm) mới gọi route handler, xem `FeedInfiniteList`.
 */
export default async function FeedPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const deps = { feedPreferences: repos.feedPreferences, listings: repos.listings };

  const preferences = await getFeedPreferences(deps, user.id);
  if (!preferences) redirect("/bang-tin/thiet-lap");

  const [firstPage, regions, tags] = await Promise.all([
    getFeedPage(deps, user.id),
    listActiveRegions(repos.regions),
    listActiveListingTags(repos.listingTags),
  ]);
  const firstPageItems = await toFeedItemViewModels(firstPage.items, { listingSaves: repos.listingSaves }, user.id);

  const regionFilterOptions: FeedFilterOption[] = preferences.regionIds
    .map((id) => regions.find((region) => region.id === id))
    .filter((region): region is NonNullable<typeof region> => Boolean(region))
    .map((region) => ({ id: region.id, label: region.name }));

  const tagFilterOptions: FeedFilterOption[] = preferences.tagIds
    .map((id) => tags.find((tag) => tag.id === id))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag))
    .map((tag) => ({ id: tag.id, label: tag.label }));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 4, fontSize: 28, fontWeight: 700 }}>Bảng tin của bạn</h1>
        <span style={{ color: "var(--ink-soft)" }}>
          Ưu tiên hiển thị tin khớp với sở thích bạn đã thiết lập —{" "}
          <Link href="/tai-khoan?tab=so-thich">sửa sở thích</Link>.
        </span>
      </div>

      <FeedInfiniteList
        initialItems={firstPageItems}
        initialCursor={firstPage.nextCursor}
        regionFilterOptions={regionFilterOptions}
        tagFilterOptions={tagFilterOptions}
      />
    </div>
  );
}
