import { z } from "zod";

/** Nguồn DUY NHẤT cho danh sách lý do báo cáo — UI (`ReportListingButton`)
 * import mảng này thay vì tự khai báo riêng, tránh lệch giữa lựa chọn hiển
 * thị và giá trị server chấp nhận. */
export const REPORT_REASONS = [
  "Tin lừa đảo / không có thật",
  "Phòng đã được pass, tin chưa gỡ",
  "Thông tin liên hệ không đúng",
  "Nội dung không phù hợp",
] as const;

export const createReportInputSchema = z.object({
  listingId: z.string().uuid(),
  // Khoá về đúng các lựa chọn UI cho phép — trước đây chỉ check
  // `min(1).max(200)`, cho phép gửi thẳng chuỗi bất kỳ nếu bỏ qua UI (vd gọi
  // thẳng Server Action).
  reason: z.enum(REPORT_REASONS, { error: "Vui lòng chọn lý do báo cáo." }),
  note: z.string().trim().max(1000).optional(),
});
