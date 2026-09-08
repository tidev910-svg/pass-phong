import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { listActiveRegions } from "@/domain/regions/service";
import { getListingById } from "@/domain/listings/service";
import { listActiveListingTags } from "@/domain/listing-tags/service";
import { NotFoundError } from "@/domain/shared/errors";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata: Metadata = { title: "Sửa tin đăng" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSession();
  const repos = getRepositories();

  let listing;
  try {
    listing = await getListingById({ listings: repos.listings, regions: repos.regions }, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  // Chỉ chủ tin mới sửa được — không phải trang public, 404 thay vì lộ tin
  // của người khác có tồn tại hay không.
  if (listing.userId !== user.id) notFound();
  // Chỉ sửa được tin đang hiển thị — tin đã pass/xoá thì "Sửa tin" vốn không
  // hiện nút ở UI (MyListingCard), vào thẳng URL cũng chặn ở đây (404, không
  // phải lỗi khó hiểu).
  if (listing.status !== "active") notFound();

  const [regions, tags] = await Promise.all([listActiveRegions(repos.regions), listActiveListingTags(repos.listingTags)]);

  return (
    <ListingForm
      regions={regions}
      tags={tags}
      mode="edit"
      listingId={listing.id}
      initialValues={{
        regionId: listing.regionId,
        price: listing.price,
        moveOutDate: listing.moveOutDate,
        description: listing.description ?? undefined,
        contactPhone: listing.contactPhone ?? undefined,
        contactLink: listing.contactLink ?? undefined,
        lat: listing.lat ?? undefined,
        lng: listing.lng ?? undefined,
        tagIds: listing.tags.map((tag) => tag.id),
      }}
    />
  );
}
