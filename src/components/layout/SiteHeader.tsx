"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { PublicUser } from "@/domain/auth/types";
import type { AccountStats } from "@/domain/profile/service";
import { Logo } from "@/components/decor/Logo";
import { AccountMenu } from "./AccountMenu";
import { NavIconLink } from "./NavIconLink";
import styles from "./SiteHeader.module.css";

interface NavIconLinkItem {
  href: string;
  label: string;
  /** Ảnh do người dùng cung cấp trong /public — không dùng icon font nữa. */
  iconSrc: string;
}

export function SiteHeader({
  user,
  accountStats,
}: {
  user: PublicUser | null;
  /** Chỉ cần khi `user` tồn tại — dropdown tài khoản hiển thị 3 số liệu này. */
  accountStats?: AccountStats;
}) {
  const pathname = usePathname();

  // Icon-toolbar giữa header — luôn đủ 3 mục kể cả khi chưa đăng nhập (để
  // vị trí toolbar không lệch tuỳ trạng thái đăng nhập), không gồm
  // "Đăng tin" (đã tách thành nút riêng) hay "Tìm kiếm đã lưu" (đã chuyển
  // vào dropdown tài khoản). "Bảng tin" yêu cầu đăng nhập — khách bấm vào
  // vẫn điều hướng tới /bang-tin bình thường, layout (account) tự
  // `requireSession()` redirect sang /dang-nhap, không cần xử lý riêng ở
  // đây.
  const navLinks: NavIconLinkItem[] = [
    { href: "/", label: "Tìm tin", iconSrc: "/icon_tim_tin.png" },
    { href: "/bang-tin", label: "Bảng tin", iconSrc: "/icon_bang_tin.png" },
    { href: "/tim-tin/ban-do", label: "Bản đồ", iconSrc: "/icon_ban_do.png" },
  ];

  function isActive(href: string): boolean {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Logo size="md" />
        </Link>

        <nav className={styles.iconToolbar}>
          {navLinks.map((link) => (
            <NavIconLink
              key={link.href}
              href={link.href}
              label={link.label}
              iconSrc={link.iconSrc}
              isActive={isActive(link.href)}
            />
          ))}
        </nav>

        <div className={styles.rightActions}>
          <Link href="/dang-tin">
            <Button
              type="primary"
              className={styles.postButton}
              icon={
                <span className={styles.postIcon}>
                  <PlusOutlined />
                </span>
              }
            >
              Đăng tin
            </Button>
          </Link>

          {user ? (
            <>
              <span className={styles.divider} aria-hidden />
              {/* accountStats luôn có giá trị khi user tồn tại (layout fetch
                  song song) — fallback 0 phòng trường hợp hiếm gặp lỗi fetch,
                  không để crash header vì 1 con số phụ. */}
              <AccountMenu
                user={user}
                stats={accountStats ?? { liveCount: 0, passedCount: 0, savedSearchCount: 0 }}
              />
            </>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/dang-nhap">
                <Button size="small" className={styles.authBtn}>
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/dang-ky">
                <Button size="small" type="primary" className={styles.authBtn}>
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
