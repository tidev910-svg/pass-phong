import { NextResponse, type NextRequest } from "next/server";
import { getRepositories } from "@/infra/container";
import { getSession } from "@/infra/session/session";
import { getFeedPage } from "@/domain/feed/service";
import { decodeFeedCursor } from "@/domain/feed/cursor";
import { AppError } from "@/domain/shared/errors";
import { toFeedItemViewModels } from "@/components/feed/feedViewModel";

/**
 * Tải thêm trang Bảng tin khi cuộn — Route Handler (không phải Server Action)
 * vì client cần 1 endpoint `fetch`-able bằng GET từ `IntersectionObserver`,
 * không phải form submit. Trang ĐẦU vẫn render server-side thẳng trong
 * `bang-tin/page.tsx` (không qua route này) để first paint nhanh, đúng cách
 * mọi trang khác trong app hoạt động.
 */
export async function GET(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cursorParam = request.nextUrl.searchParams.get("cursor");
  const cursor = cursorParam ? decodeFeedCursor(cursorParam) : undefined;

  const repos = getRepositories();
  const deps = { feedPreferences: repos.feedPreferences, listings: repos.listings };

  try {
    const page = await getFeedPage(deps, user.id, cursor);
    const items = await toFeedItemViewModels(page.items, { listingSaves: repos.listingSaves }, user.id);
    return NextResponse.json({ items, nextCursor: page.nextCursor });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}
