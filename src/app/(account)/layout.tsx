import type { ReactNode } from "react";
import { requireSession } from "@/infra/session/session";
import { getRepositories } from "@/infra/container";
import { getAccountStats } from "@/domain/profile/service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageContainer } from "@/components/layout/PageContainer";

/**
 * Mọi route con của `(account)` bắt buộc đăng nhập — check ở đúng 1 chỗ
 * (layout) thay vì lặp lại `requireSession()` ở từng page.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireSession();
  const repos = getRepositories();
  const accountStats = await getAccountStats(
    { listings: repos.listings, savedSearches: repos.savedSearches },
    user.id,
  );

  return (
    <>
      <SiteHeader user={user} accountStats={accountStats} />
      <main style={{ padding: "24px 0 40px" }}>
        <PageContainer>{children}</PageContainer>
      </main>
      <SiteFooter />
    </>
  );
}
