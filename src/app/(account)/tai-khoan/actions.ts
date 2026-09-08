"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { updatePassword, updateProfile } from "@/domain/auth/service";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * 1 action cho cả form "Cài đặt tài khoản" (tên hiển thị + SĐT/Zalo + mật
 * khẩu mới) — mật khẩu chỉ đổi khi field không rỗng, khớp yêu cầu "chỉ gửi
 * cập nhật khi có giá trị". Đổi mật khẩu tự hash bcrypt rồi ghi thẳng
 * `password_hash`, KHÔNG dùng `supabase.auth.updateUser()` (xem comment ở
 * `AuthRepository.updatePassword`) vì dự án không dùng Supabase Auth.
 */
export async function updateAccountAction(formData: FormData): Promise<ActionResult> {
  const user = await requireSession();
  const repos = getRepositories();

  const displayName = formData.get("displayName")?.toString().trim();
  const phoneOrZalo = formData.get("phoneOrZalo")?.toString().trim();
  const newPassword = formData.get("newPassword")?.toString();

  try {
    await updateProfile(repos.auth, user.id, {
      displayName: displayName || undefined,
      phoneOrZalo: phoneOrZalo || undefined,
    });

    if (newPassword) {
      await updatePassword(repos.auth, user.id, { newPassword });
    }
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  revalidatePath("/tai-khoan");
  return { ok: true };
}
