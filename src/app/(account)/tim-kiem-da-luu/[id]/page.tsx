import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { viewSavedSearchResults } from "@/domain/saved-searches/service";
import { ListingGrid } from "@/components/listings/ListingGrid";

export const metadata: Metadata = { title: "Kết quả tìm kiếm đã lưu" };

export default async function SavedSearchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireSession();
  const repos = getRepositories();

  // Gọi 1 lần: vừa lấy kết quả mới nhất, vừa cập nhật `last_viewed_at` —
  // đúng lúc user THỰC SỰ xem, để badge không tự mất sớm.
  const result = await viewSavedSearchResults(
    { savedSearches: repos.savedSearches, listings: repos.listings },
    user.id,
    id,
  );

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Kết quả tìm kiếm đã lưu</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>{result.total} tin khớp bộ lọc đã lưu.</p>
      <ListingGrid listings={result.items} />
    </div>
  );
}
