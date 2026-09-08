import type {
  CreateListingInput,
  Listing,
  ListingSearchFilter,
  ListingWithDetails,
  ListingWithDistance,
  NearbySearchFilter,
  SearchResult,
} from "./types";

export interface ListingRepository {
  create(userId: string, input: CreateListingInput): Promise<Listing>;
  /** Sửa tin — chỉ áp dụng các field có trong `input` (partial update).
   * lat/lng là ngoại lệ 2 giá trị: `undefined` = không đụng tới, `null` =
   * xoá vị trí đang có, số = đặt vị trí mới (xem `CreateListingInput`). */
  update(id: string, input: Partial<CreateListingInput>): Promise<Listing>;
  attachImages(listingId: string, storagePaths: string[]): Promise<void>;
  findById(id: string): Promise<ListingWithDetails | null>;
  /** Lấy nhiều tin theo id cùng lúc — tránh N+1 khi cần hiển thị 1 danh sách
   * id đã biết trước (vd tab "Tin đã lưu"). KHÔNG lọc theo status, giữ
   * nguyên trách nhiệm lọc/loại tin đã xoá cho tầng gọi. */
  findByIds(ids: string[]): Promise<ListingWithDetails[]>;
  /** Chỉ trả tin `status = 'active'`, dùng cho trang tìm kiếm công khai. */
  search(filter: ListingSearchFilter): Promise<SearchResult<ListingWithDetails>>;
  /** Tìm theo vị trí + bán kính (km) — chế độ "Tìm theo nhu cầu" ở
   * `/tim-tin/ban-do`, TÁCH RIÊNG khỏi `search()` (khu vực). Chỉ trả tin
   * `status='active'` VÀ có toạ độ (tin chưa gắn vị trí không thể tính
   * khoảng cách nên bị loại — không phải bug). Không phân trang thật (giống
   * tiền lệ `MAP_PAGE_SIZE`), kết quả đã sort theo khoảng cách tăng dần. */
  searchNearby(filter: NearbySearchFilter): Promise<ListingWithDistance[]>;
  /** Toàn bộ tin của 1 user (trừ đã xoá) — dùng cho tab "Tin của tôi". */
  listByUser(userId: string): Promise<ListingWithDetails[]>;
  /** Đếm nhanh theo status (không join ảnh/khu vực) — dùng cho dropdown tài
   * khoản ở header, nơi cần fetch trên MỌI trang nên phải nhẹ hơn `listByUser`. */
  countByUserStatus(userId: string): Promise<{ active: number; passed: number }>;
  /** Đếm tin active khớp filter, tạo sau thời điểm `since` — phục vụ badge saved search. */
  countMatchingCreatedAfter(filter: ListingSearchFilter, since: string): Promise<number>;
  softDelete(id: string): Promise<void>;
  markPassed(id: string): Promise<void>;
  /** Dành cho trang admin — trả cả tin đã xoá/đã pass. */
  adminListAll(filter?: { status?: string }): Promise<ListingWithDetails[]>;
  /** Thay TOÀN BỘ tag gắn với 1 tin (xoá link cũ, gắn lại theo `tagIds`) —
   * gọi riêng sau `create`/`update`, cùng chiến lược "action riêng, gọi sau"
   * như ảnh (`attachImages`), vì tag không phải cột trực tiếp trên bảng
   * `listings`. `tagIds` rỗng nghĩa là bỏ hết tag hiện có. */
  setListingTags(listingId: string, tagIds: number[]): Promise<void>;
  /** Candidate pool cho Bảng tin cá nhân hoá — tin `active` mới nhất, giới
   * hạn `limit`, KHÔNG đếm total/không phân trang thật (chấm điểm + phân
   * trang qua cursor được xử lý ở tầng domain `feed`, xem
   * `src/domain/feed/service.ts`). Cùng tinh thần "fetch candidate pool"
   * như `searchNearby`. */
  listActiveForFeed(limit: number): Promise<ListingWithDetails[]>;
}
