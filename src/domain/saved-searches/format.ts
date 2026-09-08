import { formatMoveOutDate, formatPriceVnd } from "@/domain/listings/format";
import type { SavedSearch } from "./types";

/** Mô tả người-đọc-được cho 1 saved search — dùng chung ở `/tim-kiem-da-luu`
 * và tab "Tìm kiếm đã lưu" của trang hồ sơ, tránh lặp lại logic này. */
export function describeSavedSearchFilter(
  search: Pick<SavedSearch, "regionId" | "priceMin" | "priceMax" | "moveOutDateTo">,
): string {
  const parts: string[] = [];
  parts.push(search.regionId ? "Khu vực đã chọn" : "Tất cả khu vực");
  if (search.priceMin || search.priceMax) {
    parts.push(
      `Giá ${search.priceMin ? formatPriceVnd(search.priceMin) : "0"} – ${
        search.priceMax ? formatPriceVnd(search.priceMax) : "không giới hạn"
      }`,
    );
  }
  if (search.moveOutDateTo) parts.push(`Cần pass trước ${formatMoveOutDate(search.moveOutDateTo)}`);
  return parts.join(" · ");
}
