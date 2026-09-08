import { ListingGridSkeleton } from "@/components/feedback/ListingCardSkeleton";

/** Trang này render `ListingGrid` y hệt trang chủ — tái dùng đúng skeleton đó. */
export default function Loading() {
  return <ListingGridSkeleton />;
}
