import type { ReactNode } from "react";

/** Wrapper max-width dùng chung cho mọi trang — tránh lặp style container. */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 16px" }}>{children}</div>
  );
}
