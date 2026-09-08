export type ListingTagCategory = "room_type" | "amenity";

/**
 * Tag loại phòng/tiện ích gắn vào tin đăng — dùng cho hiển thị trên
 * card/chi tiết tin VÀ làm tín hiệu chấm điểm ở Bảng tin cá nhân hoá
 * (xem `src/domain/feed/scoring.ts`). `category` quyết định cách UI
 * `TagPicker` nhóm hiển thị và có cho chọn nhiều hay chỉ 1 (room_type).
 */
export interface ListingTag {
  id: number;
  slug: string;
  label: string;
  category: ListingTagCategory;
  displayOrder: number;
}
