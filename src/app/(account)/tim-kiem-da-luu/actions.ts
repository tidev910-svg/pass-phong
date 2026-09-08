"use server";

import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import { getSession, requireSession } from "@/infra/session/session";
import { createSavedSearch, deleteSavedSearch } from "@/domain/saved-searches/service";
import type { CreateSavedSearchInput } from "@/domain/saved-searches/types";
import { AppError, UnauthorizedError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

function deps() {
  const repos = getRepositories();
  return { savedSearches: repos.savedSearches, listings: repos.listings };
}

/**
 * Gọi được từ trang chủ công khai (chưa chắc đã đăng nhập) nên dùng
 * `getSession` (không redirect) — trả lỗi rõ ràng để UI mời đăng nhập,
 * thay vì để redirect cắt ngang trải nghiệm đang xem kết quả tìm kiếm.
 */
export async function createSavedSearchAction(input: CreateSavedSearchInput): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) throw new UnauthorizedError("Vui lòng đăng nhập để lưu tìm kiếm.");
    await createSavedSearch(deps(), user.id, input);
    revalidatePath("/tim-kiem-da-luu");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}

export async function deleteSavedSearchAction(id: string): Promise<ActionResult> {
  // Trang /tim-kiem-da-luu đã được (account) layout bảo vệ.
  const user = await requireSession();
  try {
    await deleteSavedSearch(deps(), user.id, id);
    revalidatePath("/tim-kiem-da-luu");
    return { ok: true };
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }
}
