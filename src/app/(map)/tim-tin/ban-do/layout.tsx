import type { ReactNode } from "react";
import { getSession } from "@/infra/session/session";
import { getRepositories } from "@/infra/container";
import { getAccountStats } from "@/domain/profile/service";
import { SiteHeader } from "@/components/layout/SiteHeader";

/**
 * Layout riêng cho view "danh sách + bản đồ" — KHÔNG dùng chung layout
 * `(public)` vì trang này cần chiếm toàn bộ chiều rộng/chiều cao viewport
 * (trừ header), trong khi `(public)/layout.tsx` luôn bọc `PageContainer`
 * (max-width 1080px + padding) và `SiteFooter` cho mọi trang bên trong nó —
 * không có cách "thoát" layout cha trong Next.js App Router, nên phải tách
 * route group riêng thay vì cố ép layout cũ.
 */
export default async function MapLayout({ children }: { children: ReactNode }) {
  const user = await getSession();
  const repos = getRepositories();
  const accountStats = user
    ? await getAccountStats({ listings: repos.listings, savedSearches: repos.savedSearches }, user.id)
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <SiteHeader user={user} accountStats={accountStats} />
      {/* `overflowY: "auto"` — bù cho trường hợp nội dung con (vd panel "Tìm
          theo nhu cầu" khi mở) cao hơn phần còn lại của viewport: thay vì
          `MapSearchView` bị bóp xuống gần như biến mất (flex `min-height: 0`
          bên trong nó), cả khối này tự cuộn được. Không ảnh hưởng trường hợp
          bình thường (nội dung vừa khít) vì khi đó không có gì để cuộn. */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
