import { ValidationError } from "@/domain/shared/errors";
import type { ListingRepository } from "@/domain/listings/repository";
import type { FeedPreferencesRepository } from "./repository";
import { upsertFeedPreferencesInputSchema } from "./validation";
import { scoreListing } from "./scoring";
import { encodeFeedCursor } from "./cursor";
import type { FeedCursor, FeedItem, FeedPage, FeedPreferences, UpsertFeedPreferencesInput } from "./types";

export interface FeedServiceDeps {
  feedPreferences: FeedPreferencesRepository;
  listings: ListingRepository;
}

// Candidate pool tối đa lấy về trước khi chấm điểm/sort — cùng tinh thần
// `NEARBY_CANDIDATE_LIMIT` (searchNearby). Ở quy mô 1 thành phố hiện tại đủ
// dùng; xem ghi chú rủi ro trong plan nếu tin active vượt mốc này.
const FEED_CANDIDATE_LIMIT = 300;
const FEED_PAGE_SIZE = 12;

export async function getFeedPreferences(
  deps: FeedServiceDeps,
  userId: string,
): Promise<FeedPreferences | null> {
  return deps.feedPreferences.findByUser(userId);
}

export async function hasFeedPreferences(deps: FeedServiceDeps, userId: string): Promise<boolean> {
  return (await deps.feedPreferences.findByUser(userId)) !== null;
}

export async function saveFeedPreferences(
  deps: FeedServiceDeps,
  userId: string,
  input: UpsertFeedPreferencesInput,
): Promise<FeedPreferences> {
  const parsed = upsertFeedPreferencesInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  }
  return deps.feedPreferences.upsert(userId, parsed.data);
}

/**
 * 1 trang Bảng tin đã xếp hạng theo sở thích — chiến lược "lấy hết candidate
 * rồi chấm điểm/sort/cắt trang ở app" (không phải SQL `ORDER BY`/`OFFSET`),
 * vì điểm số không phải cột ổn định trong DB. Cursor mang theo điểm số + id
 * của item cuối trang trước để xác định đúng vị trí cắt tiếp theo trong
 * danh sách đã sort (xem `FeedCursor`).
 */
export async function getFeedPage(
  deps: FeedServiceDeps,
  userId: string,
  cursor?: FeedCursor,
): Promise<FeedPage> {
  const prefs = await deps.feedPreferences.findByUser(userId);
  if (!prefs) {
    throw new ValidationError("Chưa thiết lập sở thích Bảng tin.");
  }

  const candidates = await deps.listings.listActiveForFeed(FEED_CANDIDATE_LIMIT);
  // Đóng băng `now` từ trang đầu tiên (không có cursor) và truyền lại y
  // nguyên cho các trang sau qua cursor — xem giải thích ở `FeedCursor.now`.
  const now = cursor ? new Date(cursor.now) : new Date();
  const nowIso = now.toISOString();
  const scored = candidates
    .map((listing) => {
      const { score, reasons, distanceKm } = scoreListing(listing, prefs, now);
      return { listing, score, reasons, distanceKm };
    })
    // Điểm cao trước; hoà điểm thì sort theo id để thứ tự ổn định giữa các
    // lần gọi (cursor dựa vào thứ tự này để không lặp/lọt tin).
    .sort((a, b) => b.score - a.score || a.listing.id.localeCompare(b.listing.id));

  const startIndex = cursor
    ? scored.findIndex(
        (entry) => entry.score < cursor.score || (entry.score === cursor.score && entry.listing.id > cursor.lastId),
      )
    : 0;
  const from = startIndex === -1 ? scored.length : startIndex;
  const pageEntries = scored.slice(from, from + FEED_PAGE_SIZE);
  const last = pageEntries.at(-1);
  const nextCursor =
    pageEntries.length === FEED_PAGE_SIZE && last
      ? encodeFeedCursor({ score: last.score, lastId: last.listing.id, now: nowIso })
      : null;

  const items: FeedItem[] = pageEntries.map(({ listing, score, reasons, distanceKm }) => ({
    ...listing,
    matchScore: score,
    matchReasons: reasons,
    distanceKm,
  }));

  return { items, nextCursor };
}
