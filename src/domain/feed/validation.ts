import { z } from "zod";
import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "@/domain/listings/validation";

// Tái dùng đúng biên độ lat/lng "hợp lệ ở Việt Nam" và bán kính đã định nghĩa
// ở domain listings — giữ 1 chỗ định nghĩa duy nhất cho toàn bộ app, không
// lặp lại hằng số.
export const upsertFeedPreferencesInputSchema = z
  .object({
    regionIds: z.array(z.number().int().positive()).max(20),
    tagIds: z
      .array(z.number().int().positive())
      .min(1, "Vui lòng chọn ít nhất 1 sở thích (loại phòng/tiện ích)."),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    lat: z.number().min(8, "Vĩ độ không hợp lệ.").max(24, "Vĩ độ không hợp lệ.").nullable().optional(),
    lng: z.number().min(102, "Kinh độ không hợp lệ.").max(110, "Kinh độ không hợp lệ.").nullable().optional(),
    radiusKm: z
      .number()
      .min(MIN_RADIUS_KM, `Bán kính tối thiểu ${MIN_RADIUS_KM}km.`)
      .max(MAX_RADIUS_KM, `Bán kính tối đa ${MAX_RADIUS_KM}km.`)
      .nullable()
      .optional(),
  })
  // Cần ít nhất 1 tín hiệu vị trí — khu vực HOẶC điểm+bán kính (đồng bộ với
  // 2 chế độ lọc theo vị trí đã có ở trang tìm kiếm).
  .refine((d) => d.regionIds.length > 0 || (d.lat != null && d.lng != null), {
    message: "Vui lòng chọn ít nhất 1 khu vực hoặc 1 vị trí trên bản đồ.",
    path: ["regionIds"],
  })
  // Khớp ràng buộc DB `chk_feed_pref_lat_lng_together`.
  .refine((d) => (d.lat == null) === (d.lng == null), {
    message: "Vui lòng chọn đủ vị trí trên bản đồ (hoặc bỏ trống cả hai).",
    path: ["lat"],
  })
  // Có toạ độ mà thiếu bán kính thì không thể chấm điểm proximity — bắt
  // buộc đi kèm, khác `radiusKm` tự nó vẫn optional khi không chọn vị trí.
  .refine((d) => d.lat == null || d.radiusKm != null, {
    message: "Vui lòng chọn bán kính quanh vị trí đã chọn.",
    path: ["radiusKm"],
  });
