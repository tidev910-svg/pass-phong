"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import { setListingSaved } from "@/domain/listing-saves/service";
import { toActionResult, requireSessionUserForAction, type ActionResult } from "@/app/_actions/action-helpers";

/**
 * Đặt ở `_actions` (không phải route) vì `SaveListingButton` được dùng từ
 * nhiều nơi không thuộc riêng 1 route group — thẻ tin Bảng tin (`(account)`),
 * trang chi tiết tin (`(public)`), có thể cả lưới trang chủ sau này. Cùng lý
 * do `logoutAction` đã đặt ở đây.
 */
export async function toggleListingSaveAction(listingId: string, nextSaved: boolean): Promise<ActionResult> {
  try {
    const user = await requireSessionUserForAction();
    const repos = getRepositories();
    await setListingSaved({ listingSaves: repos.listingSaves, listings: repos.listings }, user.id, listingId, nextSaved);
    revalidatePath(`/tin/${listingId}`);
    revalidatePath("/tai-khoan");
    return { ok: true };
  } catch (error) {
    return toActionResult(error);
  }
}
