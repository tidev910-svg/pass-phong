import type { ReactNode } from "react";
import { getSession } from "@/infra/session/session";
import { getRepositories } from "@/infra/container";
import { getAccountStats } from "@/domain/profile/service";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PageContainer } from "@/components/layout/PageContainer";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const user = await getSession();
  const repos = getRepositories();
  const accountStats = user
    ? await getAccountStats({ listings: repos.listings, savedSearches: repos.savedSearches }, user.id)
    : undefined;

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
