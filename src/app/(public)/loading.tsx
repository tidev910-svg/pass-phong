import { HomeSkeleton } from "@/components/feedback/HomeSkeleton";

/**
 * Chỉ còn áp dụng cho `/` — `/tin/[id]` đã có `loading.tsx` riêng ghi đè
 * (xem tin/[id]/loading.tsx), `/dieu-khoan-su-dung` không async nên Next
 * không kích hoạt loading.tsx cho nó.
 */
export default function Loading() {
  return <HomeSkeleton />;
}
