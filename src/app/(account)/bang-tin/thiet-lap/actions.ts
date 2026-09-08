"use server";

import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { saveFeedPreferences } from "@/domain/feed/service";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Lưu sở thích Bảng tin — dùng chung cho cả luồng thiết lập lần đầu
 * (`/bang-tin/thiet-lap`) và sửa lại sau này (`/tai-khoan?tab=so-thich`).
 * KHÔNG `redirect()` ở đây (khác `createListingAction`) vì hành vi sau khi
 * lưu khác nhau theo `mode` — client (`FeedPreferencesForm`) tự điều hướng
 * khi `mode="setup"`, còn `mode="edit"` chỉ cần toast và ở lại trang.
 */
export async function saveFeedPreferencesAction(formData: FormData): Promise<ActionResult> {
  const user = await requireSession();
  const repos = getRepositories();
  const deps = { feedPreferences: repos.feedPreferences, listings: repos.listings };

  const rawPriceMin = formData.get("priceMin");
  const rawPriceMax = formData.get("priceMax");
  const rawLat = formData.get("lat");
  const rawLng = formData.get("lng");
  const rawRadiusKm = formData.get("radiusKm");

  const input = {
    regionIds: formData.getAll("regionIds").map(Number).filter((n) => Number.isFinite(n)),
    tagIds: formData.getAll("tagIds").map(Number).filter((n) => Number.isFinite(n)),
    priceMin: rawPriceMin !== null ? Number(rawPriceMin) : undefined,
    priceMax: rawPriceMax !== null ? Number(rawPriceMax) : undefined,
    lat: rawLat !== null ? Number(rawLat) : undefined,
    lng: rawLng !== null ? Number(rawLng) : undefined,
    radiusKm: rawRadiusKm !== null ? Number(rawRadiusKm) : undefined,
  };

  try {
    await saveFeedPreferences(deps, user.id, input);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  return { ok: true };
}
