import { NextResponse, type NextRequest } from "next/server";
import { getRepositories } from "@/infra/container";
import { searchListings } from "@/domain/listings/service";
import { AppError } from "@/domain/shared/errors";

/**
 * Route dự phòng cho client-side fetch (vd infinite scroll sau này).
 * Hiện trang chủ đã tự fetch phía Server Component nên route này chưa được
 * gọi ở đâu, nhưng giữ sẵn theo đúng kế hoạch kiến trúc.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const toNumber = (key: string) => {
    const raw = sp.get(key);
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  };

  const repos = getRepositories();

  // `searchListings` giờ validate filter (trước đây bỏ qua) — query param ở
  // route này hoàn toàn do client tự gửi, bọc try/catch để trả lỗi JSON rõ
  // ràng (400) thay vì để lỗi rơi thành 500 mặc định của Next.js.
  try {
    const result = await searchListings(
      { listings: repos.listings, regions: repos.regions },
      {
        regionId: toNumber("regionId"),
        priceMin: toNumber("priceMin"),
        priceMax: toNumber("priceMax"),
        moveOutDateFrom: sp.get("moveOutDateFrom") || undefined,
        moveOutDateTo: sp.get("moveOutDateTo") || undefined,
        page: toNumber("page") ?? 1,
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Có lỗi xảy ra, vui lòng thử lại." }, { status: 500 });
  }
}
