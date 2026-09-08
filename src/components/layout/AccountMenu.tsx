"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Dropdown } from "antd";
import {
  DownOutlined,
  LogoutOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { PublicUser } from "@/domain/auth/types";
import type { AccountStats } from "@/domain/profile/service";
import { logoutAction } from "@/app/_actions/session-actions";
import { IconBadge } from "@/components/decor/IconBadge";
import { COLOR_FOREST, COLOR_FOREST_DARK } from "@/theme/tokens";
import styles from "./AccountMenu.module.css";

/**
 * Thay cho 3 mục text rời (username/"Tài khoản"/"Đăng xuất") trước đây ở
 * header — gộp thành 1 chip có avatar, mở dropdown mini-profile. Tái dùng
 * `IconBadge` cho cả 2 avatar (không tự vẽ lại), và `logoutAction` sẵn có
 * (dự án không dùng Supabase Auth nên không có "Supabase sign-out flow"
 * riêng để gọi).
 */
export function AccountMenu({
  user,
  stats,
}: {
  user: PublicUser;
  stats: AccountStats;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [lastRouteKey, setLastRouteKey] = useState(routeKey);
  const name = user.displayName ?? user.username;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  /**
   * Đóng dropdown khi route THỰC SỰ đã đổi (kể cả chỉ đổi query string, vd
   * "Cài đặt tài khoản" khi đang sẵn ở /tai-khoan) — set state ngay trong lúc
   * render khi phát hiện lệch (pattern chính thức của React để "điều chỉnh
   * state theo prop thay đổi", KHÔNG dùng effect — gọi setState đồng bộ
   * trong effect bị eslint chặn vì dễ gây render dây chuyền).
   *
   * KHÔNG đóng đồng bộ ngay trong onClick/onSubmit của Link/form — từng gây
   * bug thật: unmount Link/form trước khi Next.js kịp điều hướng hoặc trước
   * khi server action kịp gửi đi, khiến cả 2 âm thầm không chạy (navigation
   * bị mất, logout không thực sự đăng xuất). Riêng logout không cần lo ở
   * đây — sau khi session bị huỷ, `user` thành null nên component cha ngừng
   * render `AccountMenu`, tự "đóng" vì unmount hẳn.
   */
  if (routeKey !== lastRouteKey) {
    setLastRouteKey(routeKey);
    setOpen(false);
  }

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      classNames={{ root: styles.overlay }}
      popupRender={() => (
        <div className={styles.panel}>
          <span className={styles.tape}>tài khoản</span>

          <div className={styles.panelHeader}>
            <IconBadge
              size={48}
              radius={12}
              background={COLOR_FOREST}
              shadowColor={COLOR_FOREST_DARK}
              iconColor="#fff"
              rotateDeg={-4}
              icon={<span className={styles.avatarLetterLg}>{initial}</span>}
            />
            <div className={styles.panelName}>{name}</div>
            <div className={styles.panelUsername}>@{user.username}</div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.liveCount}</div>
              <div className={styles.statLabel}>đang đăng</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.passedCount}</div>
              <div className={styles.statLabel}>đã pass</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{stats.savedSearchCount}</div>
              <div className={styles.statLabel}>đã lưu</div>
            </div>
          </div>

          <div className={styles.menuList}>
            {/* Trước đây là 1 mục ngang hàng ở nav chính ("Tìm kiếm đã lưu")
                — dời vào đây nhưng vẫn giữ vị trí đầu danh sách để không bị
                "giáng cấp" quá nhiều so với trước. */}
            <Link href="/tim-kiem-da-luu" className={styles.menuItem}>
              <SearchOutlined className={styles.menuIcon} /> Tìm kiếm đã lưu
            </Link>
            <Link href="/tai-khoan" className={styles.menuItem}>
              <UserOutlined className={styles.menuIcon} /> Hồ sơ của tôi
            </Link>
            <Link href="/tai-khoan?tab=settings" className={styles.menuItem}>
              <SettingOutlined className={styles.menuIcon} /> Cài đặt tài khoản
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={`${styles.menuItem} ${styles.menuItemDanger}`}>
                <LogoutOutlined className={styles.menuIcon} /> Đăng xuất
              </button>
            </form>
          </div>
        </div>
      )}
    >
      <button type="button" className={styles.trigger}>
        <IconBadge
          size={30}
          radius={15}
          background={COLOR_FOREST}
          shadowColor={COLOR_FOREST_DARK}
          iconColor="#fff"
          rotateDeg={0}
          icon={<span className={styles.avatarLetterSm}>{initial}</span>}
        />
        <span className={styles.triggerName}>{name}</span>
        <DownOutlined style={{ fontSize: 10 }} />
      </button>
    </Dropdown>
  );
}
