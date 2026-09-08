"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { attachListingImages, createListing, setListingTags } from "@/domain/listings/service";
import { uploadListingImage } from "@/infra/storage/image-storage";
import { AppError } from "@/domain/shared/errors";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createListingAction(formData: FormData): Promise<ActionResult> {
  // Ngoài try/catch: trang /dang-tin đã được (account) layout bảo vệ, nhưng
  // nếu session hết hạn đúng lúc submit thì để redirect tới /dang-nhap tự
  // nhiên, không bị catch nhầm thành lỗi nghiệp vụ.
  const user = await requireSession();

  const repos = getRepositories();
  const deps = { listings: repos.listings, regions: repos.regions };
  // lat/lng: chọn không bắt buộc qua map picker ở form — chỉ có mặt trong
  // formData khi người dùng đã ghim vị trí (xem `ListingForm.handleFinish`).
  const rawLat = formData.get("lat");
  const rawLng = formData.get("lng");
  const input = {
    regionId: Number(formData.get("regionId")),
    price: Number(formData.get("price")),
    moveOutDate: String(formData.get("moveOutDate") ?? ""),
    description: formData.get("description")?.toString() || undefined,
    contactPhone: formData.get("contactPhone")?.toString() || undefined,
    contactLink: formData.get("contactLink")?.toString() || undefined,
    lat: rawLat !== null ? Number(rawLat) : undefined,
    lng: rawLng !== null ? Number(rawLng) : undefined,
  };

  let listingId: string;
  try {
    const listing = await createListing(deps, user.id, input);
    listingId = listing.id;

    const imageFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (imageFiles.length > 0) {
      const storagePaths = await Promise.all(imageFiles.map((file) => uploadListingImage(file, listing.id)));
      await attachListingImages(deps, listing.id, storagePaths);
    }

    // Tag không bắt buộc — set riêng sau khi tạo tin (cùng cách xử lý ảnh),
    // vì không phải cột trực tiếp trên bảng `listings`. Đi qua service (không
    // gọi thẳng repository) để được validate như mọi field khác.
    const tagIds = formData.getAll("tagIds").map(Number).filter((n) => Number.isFinite(n));
    await setListingTags(deps, listing.id, tagIds);
  } catch (error) {
    if (error instanceof AppError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "Có lỗi xảy ra, vui lòng thử lại." };
  }

  revalidatePath("/");
  redirect(`/tin/${listingId}?posted=1`);
}
