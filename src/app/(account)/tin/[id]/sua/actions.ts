"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { attachListingImages, setListingTags, updateListing } from "@/domain/listings/service";
import { uploadListingImage } from "@/infra/storage/image-storage";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateListingAction(listingId: string, formData: FormData): Promise<ActionResult> {
  const user = await requireSession();

  const repos = getRepositories();
  const deps = { listings: repos.listings, regions: repos.regions };
  // lat/lng: khác với các field optional khác — form sửa tin luôn hiển thị
  // đầy đủ trạng thái vị trí hiện tại (map picker prefill sẵn), nên "không
  // có trong formData" ở đây có nghĩa là người dùng đã bấm "Xoá vị trí", KHÔNG
  // phải "không đụng tới". Vì vậy map về `null` (xoá) thay vì `undefined`.
  const rawLat = formData.get("lat");
  const rawLng = formData.get("lng");
  const input = {
    regionId: Number(formData.get("regionId")),
    price: Number(formData.get("price")),
    moveOutDate: String(formData.get("moveOutDate") ?? ""),
    description: formData.get("description")?.toString() || undefined,
    contactPhone: formData.get("contactPhone")?.toString() || undefined,
    contactLink: formData.get("contactLink")?.toString() || undefined,
    lat: rawLat !== null ? Number(rawLat) : null,
    lng: rawLng !== null ? Number(rawLng) : null,
  };

  try {
    await updateListing(deps, user.id, listingId, input);

    // Sửa tin bản này chỉ hỗ trợ THÊM ảnh mới, không xoá/sắp lại ảnh cũ —
    // đủ dùng cho MVP, tránh phải build UI quản lý ảnh phức tạp hơn.
    const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (imageFiles.length > 0) {
      const storagePaths = await Promise.all(imageFiles.map((file) => uploadListingImage(file, listingId)));
      await attachListingImages(deps, listingId, storagePaths);
    }

    // Tag thì khác ảnh — form sửa tin hiển thị đầy đủ tag hiện có nên thay
    // TOÀN BỘ theo lựa chọn mới, không phải chỉ thêm. Đi qua service (không
    // gọi thẳng repository) để được validate như mọi field khác.
    const tagIds = formData.getAll("tagIds").map(Number).filter((n) => Number.isFinite(n));
    await setListingTags(deps, listingId, tagIds);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  revalidatePath(`/tin/${listingId}`);
  revalidatePath("/tai-khoan");
  redirect(`/tin/${listingId}?updated=1`);
}
