import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { listActiveRegions } from "@/domain/regions/service";
import { listActiveListingTags } from "@/domain/listing-tags/service";
import { getFeedPreferences } from "@/domain/feed/service";
import { FeedPreferencesForm } from "@/components/feed/FeedPreferencesForm";

export const metadata: Metadata = { title: "Thiết lập Bảng tin" };

/**
 * Thiết lập sở thích Bảng tin lần đầu — `/bang-tin` gate về đây nếu user
 * chưa có `feed_preferences`. Vẫn cho fetch lại preferences hiện có (nếu
 * user quay lại trang này sau khi đã thiết lập, vd bấm Back) để prefill,
 * không bắt điền lại từ đầu.
 */
export default async function FeedSetupPage() {
  const user = await requireSession();
  const repos = getRepositories();

  const [regions, tags, preferences] = await Promise.all([
    listActiveRegions(repos.regions),
    listActiveListingTags(repos.listingTags),
    getFeedPreferences({ feedPreferences: repos.feedPreferences, listings: repos.listings }, user.id),
  ]);

  return <FeedPreferencesForm regions={regions} tags={tags} initialPreferences={preferences} mode="setup" />;
}
