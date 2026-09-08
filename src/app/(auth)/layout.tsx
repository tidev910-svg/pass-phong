import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/decor/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <Link href="/" style={{ marginBottom: 32, color: "inherit" }}>
        <Logo size="lg" />
      </Link>
      <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
    </div>
  );
}
