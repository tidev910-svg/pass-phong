import type { CSSProperties, ReactNode } from "react";
import styles from "./IconBadge.module.css";

/**
 * Huy hiệu vuông nghiêng có hard offset shadow (không blur) — thiết bị thị
 * giác dùng ở cột brand footer (`SiteFooter.tsx`) và các nơi khác cần badge
 * tương tự.
 * Nhận màu qua props (luôn truyền từ hằng số `src/theme/tokens.ts`, không
 * hardcode hex ở nơi gọi) để 1 component phục vụ nhiều bộ màu/kích thước
 * khác nhau mà không lặp CSS.
 */
export function IconBadge({
  size = 40,
  radius = 10,
  background,
  shadowColor,
  iconColor,
  rotateDeg = -6,
  tapeColor,
  icon,
}: {
  size?: number;
  radius?: number;
  background: string;
  shadowColor: string;
  iconColor: string;
  rotateDeg?: number;
  tapeColor?: string;
  icon: ReactNode;
}) {
  const badgeStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: radius,
    background,
    color: iconColor,
    fontSize: Math.round(size * 0.45),
    transform: `rotate(${rotateDeg}deg)`,
    boxShadow: `2px 2px 0 ${shadowColor}`,
  };

  return (
    <span className={styles.wrap} style={{ width: size, height: size }} aria-hidden>
      {tapeColor && <span className={styles.tape} style={{ background: tapeColor }} />}
      <span className={styles.badge} style={badgeStyle}>
        {icon}
      </span>
    </span>
  );
}
