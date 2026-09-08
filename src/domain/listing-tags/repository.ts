import type { ListingTag } from "./types";

export interface ListingTagRepository {
  /** Chỉ tag `is_active = true`, sắp theo `displayOrder` — dùng cho cả
   * TagPicker ở form đăng tin và ở form thiết lập sở thích Bảng tin. */
  listActive(): Promise<ListingTag[]>;
}
