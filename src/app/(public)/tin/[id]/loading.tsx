import { ListingDetailSkeleton } from "@/components/feedback/ListingCardSkeleton";

/**
 * Ghi đè `loading.tsx` ở cấp route-group `(public)` — nếu không, trang chi
 * tiết tin sẽ hiện nhầm `ListingGridSkeleton` (lưới 6 thẻ) trong lúc chờ dữ
 * liệu, sai hoàn toàn hình dạng so với layout 2 cột thật của trang này.
 */
export default function Loading() {
  return <ListingDetailSkeleton />;
}
