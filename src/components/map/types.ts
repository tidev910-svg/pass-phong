import type { ListingCardViewModel } from "@/components/listings/ListingCard";

/**
 * View-model cho view "danh sách + bản đồ" — mở rộng đúng
 * `ListingCardViewModel` (không tạo type riêng biệt) để tái dùng thẳng
 * `ListingCard` ở cột trái mà không cần transform lại.
 */
export interface MapListingItem extends ListingCardViewModel {
  lat: number | null;
  lng: number | null;
  /** Nhãn giá rút gọn cho marker (vd "1,6tr đ") — bản đồ không đủ chỗ cho giá đầy đủ. */
  priceShortLabel: string;
  /** Khoảng cách tới điểm tìm kiếm — chỉ có giá trị ở chế độ "Tìm theo nhu
   * cầu" (từ `ListingWithDistance.distanceKm`), `undefined` ở chế độ khu vực. */
  distanceKm?: number;
}
