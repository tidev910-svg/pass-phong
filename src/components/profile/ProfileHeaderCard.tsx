"use client";

import { Card, Tag } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { IconBadge } from "@/components/decor/IconBadge";
import { COLOR_FOREST, COLOR_FOREST_DARK } from "@/theme/tokens";
import styles from "./ProfileHeaderCard.module.css";

export interface ProfileHeaderUser {
  username: string;
  displayName: string | null;
  isVerifiedStudent: boolean;
  createdAtLabel: string;
}

/**
 * "use client" bắt buộc dù component thuần hiển thị, không state — vì dùng
 * antd `Card`/`Tag`/icon (đều cần Context nội bộ, không render được trực
 * tiếp trong Server Component, xem bug tương tự ở MapViewLink/SearchPagination).
 * Badge "Sinh viên đã xác thực" CHỈ render khi `isVerifiedStudent === true`
 * — không có phiên bản mờ/xám khi false, vì cột này chưa có cơ chế xác thực
 * thật đứng sau (xem migration 0005) nên không được ngụ ý "đang chờ duyệt".
 */
export function ProfileHeaderCard({
  user,
  liveCount,
  passedCount,
  savedSearchCount,
}: {
  user: ProfileHeaderUser;
  liveCount: number;
  passedCount: number;
  savedSearchCount: number;
}) {
  const name = user.displayName ?? user.username;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <Card variant="borderless" className="board-panel">
      <div className={styles.card}>
        <div className={styles.identity}>
          <IconBadge
            size={64}
            radius={16}
            background={COLOR_FOREST}
            shadowColor={COLOR_FOREST_DARK}
            iconColor="#fff"
            rotateDeg={-4}
            icon={<span className={styles.avatarLetter}>{initial}</span>}
          />
          <div>
            <div className={styles.nameRow}>
              <span className={styles.displayName}>{name}</span>
              {user.isVerifiedStudent && (
                <Tag color="success" icon={<CheckCircleFilled />}>
                  Sinh viên đã xác thực
                </Tag>
              )}
            </div>
            <div className={styles.metaLine}>
              @{user.username} · Tham gia từ {user.createdAtLabel}
            </div>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{liveCount}</div>
            <div className={styles.statLabel}>Đang hiển thị</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{passedCount}</div>
            <div className={styles.statLabel}>Đã pass</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{savedSearchCount}</div>
            <div className={styles.statLabel}>Tìm kiếm đã lưu</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
