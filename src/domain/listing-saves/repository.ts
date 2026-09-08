export interface ListingSaveRepository {
  /** Idempotent — bấm lưu khi đã lưu rồi không lỗi (upsert/bỏ qua trùng). */
  create(userId: string, listingId: string): Promise<void>;
  delete(userId: string, listingId: string): Promise<void>;
  isSaved(userId: string, listingId: string): Promise<boolean>;
  /** Sắp theo thời điểm lưu gần nhất trước — dùng cho tab "Tin đã lưu". */
  listListingIdsByUser(userId: string): Promise<string[]>;
  /** Đếm lượt lưu cho nhiều tin cùng lúc (1 trang feed/lưới) — tránh N+1 query.
   * Tin không có trong kết quả nghĩa là 0 lượt lưu. */
  countByListingIds(listingIds: string[]): Promise<Record<string, number>>;
}
