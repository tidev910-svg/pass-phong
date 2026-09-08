import { z } from "zod";

const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
const urlRegex = /^https?:\/\/.+/i;

export const createListingInputSchema = z
  .object({
    regionId: z.number().int().positive("Vui lòng chọn khu vực."),
    price: z
      .number({ error: "Vui lòng nhập giá." })
      .int("Giá phải là số nguyên.")
      .min(0, "Giá không hợp lệ.")
      .max(1_000_000_000, "Giá không hợp lệ."),
    // Trước đây chỉ check "không rỗng" — chuỗi rác bất kỳ vẫn qua được, chỉ vỡ
    // khi tới tận DB (cột `date`). Thêm định dạng ISO khớp đúng cách
    // `formatMoveOutDate` đang parse (`YYYY-MM-DD`).
    moveOutDate: z
      .string()
      .min(1, "Vui lòng chọn ngày cần pass.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày cần pass không hợp lệ."),
    description: z.string().max(2000, "Mô tả tối đa 2000 ký tự.").optional(),
    contactPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Số điện thoại không hợp lệ.")
      .optional()
      .or(z.literal("")),
    contactLink: z
      .string()
      .trim()
      .regex(urlRegex, "Link liên hệ phải bắt đầu bằng http:// hoặc https://")
      .optional()
      .or(z.literal("")),
    // Optional — chọn qua map picker, không bắt buộc (giống ảnh). Giới hạn
    // biên độ Việt Nam thay vì -90..90/-180..180 chung chung, để bắt lỗi rõ
    // ràng hơn nếu client gửi nhầm toạ độ. `nullable` thêm để form sửa tin có
    // cách gửi "xoá vị trí đang có" (null) khác với "không đụng tới" (undefined).
    lat: z.number().min(8, "Vĩ độ không hợp lệ.").max(24, "Vĩ độ không hợp lệ.").nullable().optional(),
    lng: z.number().min(102, "Kinh độ không hợp lệ.").max(110, "Kinh độ không hợp lệ.").nullable().optional(),
  })
  // Yêu cầu cứng của CLAUDE.md: bắt buộc ít nhất 1 cách liên hệ.
  .refine((data) => Boolean(data.contactPhone) || Boolean(data.contactLink), {
    message: "Vui lòng để lại ít nhất một cách liên hệ (số điện thoại hoặc link Facebook/Instagram).",
    path: ["contactPhone"],
  })
  // Khớp ràng buộc DB `chk_lat_lng_together` — có lat thì phải có lng. `== null`
  // cố ý dùng lỏng (không phải `===`) để gộp chung 2 trạng thái "không đụng
  // tới" (undefined) và "xoá vị trí" (null) làm một, chỉ tách với "có toạ độ".
  .refine((data) => (data.lat == null) === (data.lng == null), {
    message: "Vui lòng chọn đủ vị trí trên bản đồ (hoặc bỏ trống cả hai).",
    path: ["lat"],
  });

// Trước đây `tagIds` được set thẳng qua repository ở tầng action, không đi
// qua bất kỳ validate nào (khác feed preferences, đã validate qua
// `upsertFeedPreferencesInputSchema`) — thêm schema này để cùng mức kiểm
// soát. 20 dư dả so với ~12 tag hiện có trong taxonomy, cùng cách feed
// preferences giới hạn `regionIds.max(20)`.
export const listingTagIdsSchema = z.array(z.number().int().positive()).max(20, "Chọn tối đa 20 tag.");

export const listingSearchFilterSchema = z.object({
  regionId: z.number().int().positive().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  moveOutDateFrom: z.string().optional(),
  moveOutDateTo: z.string().optional(),
  page: z.number().int().min(1).optional(),
  // Trần 100 vì trang bản đồ (`MAP_PAGE_SIZE` ở `(map)/tim-tin/ban-do/page.tsx`)
  // cố ý lấy toàn bộ kết quả 1 lần thay vì phân trang — từng để cap 50 và bị
  // chính request đó vỡ validate.
  pageSize: z.number().int().min(1).max(100).optional(),
});

// Bán kính cho chế độ "Tìm theo nhu cầu" — tối thiểu 0.5km (tránh vòng tròn
// vô nghĩa quá nhỏ), tối đa 15km (đủ phủ toàn bộ nội ô Cần Thơ ở 1 lần chọn
// điểm, không cần quét cả tỉnh).
export const MIN_RADIUS_KM = 0.5;
export const MAX_RADIUS_KM = 15;

// Cùng biên độ lat/lng đã dùng ở `createListingInputSchema` — giữ nhất quán
// 1 chỗ định nghĩa "toạ độ hợp lệ ở Việt Nam" cho toàn domain listings.
export const nearbySearchFilterSchema = z.object({
  lat: z.number().min(8, "Vĩ độ không hợp lệ.").max(24, "Vĩ độ không hợp lệ."),
  lng: z.number().min(102, "Kinh độ không hợp lệ.").max(110, "Kinh độ không hợp lệ."),
  radiusKm: z
    .number()
    .min(MIN_RADIUS_KM, `Bán kính tối thiểu ${MIN_RADIUS_KM}km.`)
    .max(MAX_RADIUS_KM, `Bán kính tối đa ${MAX_RADIUS_KM}km.`),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
});
