"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/infra/session/session";

/**
 * Đặt ở thư mục `_actions` (không phải route) vì được dùng từ SiteHeader —
 * hiển thị xuyên suốt mọi route group, không thuộc riêng (auth) hay (account).
 */
export async function logoutAction() {
  await destroySession();
  redirect("/");
}
