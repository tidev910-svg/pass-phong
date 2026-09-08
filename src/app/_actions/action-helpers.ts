import { getSession } from "@/infra/session/session";
import { AppError, UnauthorizedError } from "@/domain/shared/errors";
import type { PublicUser } from "@/domain/auth/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Chuẩn hoá lỗi domain (`AppError`) thành `ActionResult` hiển thị được cho
 * người dùng — lỗi hạ tầng không mong đợi thì log ra server, không lộ chi
 * tiết cho client. Trích ra dùng chung (trước đây định nghĩa riêng lẻ ở
 * `tin/[id]/actions.ts`) vì giờ có thêm nơi thứ 2 (`listing-save-actions.ts`)
 * cần y hệt logic này — tránh lặp theo đúng nguyên tắc ở CLAUDE.md.
 */
export function toActionResult(error: unknown): ActionResult {
  if (error instanceof AppError) return { ok: false, error: error.message };
  console.error(error);
  return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
}

/**
 * Dùng `getSession` (không redirect) — dành cho Server Action được gọi
 * imperatively từ nút bấm ở Client Component, khác với action gắn vào
 * `<form action=...>` của 1 trang cần `requireSession()` redirect thẳng khi
 * thiếu session.
 */
export async function requireSessionUserForAction(): Promise<PublicUser> {
  const user = await getSession();
  if (!user) throw new UnauthorizedError();
  return user;
}
