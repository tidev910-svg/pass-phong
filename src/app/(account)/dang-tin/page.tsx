import type { Metadata } from "next";
import { getRepositories } from "@/infra/container";
import { requireSession } from "@/infra/session/session";
import { listActiveRegions } from "@/domain/regions/service";
import { getListingById } from "@/domain/listings/service";
import { listActiveListingTags } from "@/domain/listing-tags/service";
import { ListingForm, type ListingFormInitialValues } from "@/components/listings/ListingForm";

export const metadata: Metadata = { title: "Đăng tin pass phòng" };

export default async function CreateListingPage({
  searchParams,
}: {
  searchParams: Promise<{ repostFrom?: string }>;
}) {
  const { repostFrom } = await searchParams;
  const repos = getRepositories();
  const [regions, tags] = await Promise.all([listActiveRegions(repos.regions), listActiveListingTags(repos.listingTags)]);

  let initialValues: ListingFormInitialValues | undefined;

  // "Đăng lại tin" từ tab Tin của tôi — pre-fill dữ liệu tin cũ, KHÔNG copy
  // ngày cần pass (để trống cho người dùng tự chọn ngày mới) và tạo tin MỚI
  // hoàn toàn qua flow tạo tin bình thường — không sửa lại tin cũ, giữ
  // nguyên lịch sử passed_at của tin gốc.
  if (repostFrom) {
    const user = await requireSession();
    try {
      const original = await getListingById({ listings: repos.listings, regions: repos.regions }, repostFrom);
      if (original.userId === user.id) {
        initialValues = {
          regionId: original.regionId,
          price: original.price,
          description: original.description ?? undefined,
          contactPhone: original.contactPhone ?? undefined,
          contactLink: original.contactLink ?? undefined,
          // moveOutDate cố ý bỏ trống — ngày cũ đã qua, không có ý nghĩa để copy.
          // Vị trí thì ngược lại: phòng thường ở cùng chỗ cũ, giữ nguyên cho
          // đỡ phải ghim lại từ đầu (người dùng vẫn kéo ghim chỉnh lại được).
          lat: original.lat ?? undefined,
          lng: original.lng ?? undefined,
          // Tag cũng giữ nguyên cùng lý do — loại phòng/tiện ích thường không
          // đổi khi đăng lại cùng 1 phòng.
          tagIds: original.tags.map((tag) => tag.id),
        };
      }
      // Không phải chủ tin: âm thầm bỏ qua prefill, vẫn cho vào trang đăng tin
      // trống bình thường thay vì báo lỗi khó hiểu.
    } catch {
      // Tin không tồn tại — cũng bỏ qua, vào trang đăng tin trống.
    }
  }

  return <ListingForm regions={regions} tags={tags} initialValues={initialValues} />;
}
