import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { listWithNewMatchCounts } from "@/domain/saved-searches/service";
import { MAX_SAVED_SEARCHES_PER_USER } from "@/domain/saved-searches/validation";
import { SavedSearchListView } from "@/components/search/SavedSearchListView";
import { toSavedSearchViewModel } from "@/components/search/saved-search-view-model";

export const metadata: Metadata = { title: "Tìm kiếm đã lưu" };

export default async function SavedSearchesPage() {
  const user = await requireSession();
  const repos = getRepositories();
  const searches = await listWithNewMatchCounts(
    { savedSearches: repos.savedSearches, listings: repos.listings },
    user.id,
  );

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Tìm kiếm đã lưu</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>
        Bạn có thể lưu tối đa {MAX_SAVED_SEARCHES_PER_USER} tìm kiếm. Số huy hiệu là số tin mới khớp
        kể từ lần bạn xem gần nhất.
      </p>

      <SavedSearchListView searches={searches.map(toSavedSearchViewModel)} />
    </div>
  );
}
