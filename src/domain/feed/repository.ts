import type { FeedPreferences, UpsertFeedPreferencesInput } from "./types";

export interface FeedPreferencesRepository {
  findByUser(userId: string): Promise<FeedPreferences | null>;
  /** Tạo mới hoặc thay toàn bộ hồ sơ sở thích hiện có (không có khái niệm
   * "sửa từng phần" — form thiết lập/sửa luôn gửi đủ state hiện tại). */
  upsert(userId: string, input: UpsertFeedPreferencesInput): Promise<FeedPreferences>;
}
