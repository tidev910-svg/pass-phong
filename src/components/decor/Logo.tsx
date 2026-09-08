import Image from "next/image";
import styles from "./Logo.module.css";

// Kích thước gốc file /public/logo-website.png — khai báo đúng tỉ lệ thật để
// next/image không méo ảnh khi CSS chỉ set `height` (xem Logo.module.css).
// Cập nhật lại số này mỗi khi thay file ảnh có tỉ lệ khung khác.
const LOGO_WIDTH = 1221;
const LOGO_HEIGHT = 534;

/**
 * Logo ảnh (glow xanh forest + vàng mustard viết tay "Cần Thơ ơi!") do người
 * dùng cung cấp — dùng nguyên file, KHÔNG dựng lại bằng CSS/text. Dùng chung
 * cho SiteHeader và (auth) layout để đổi ảnh 1 chỗ là đổi khắp nơi.
 */
export function Logo({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Image
      src="/logo-website.png"
      alt="Pass Phòng - Cần Thơ ơi!"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      // Logo luôn nằm trong header/trang đăng nhập — luôn ở trên màn hình
      // đầu tiên (above the fold) nên luôn là ứng viên Largest Contentful
      // Paint. Next.js cảnh báo thiếu `priority` trên ảnh LCP (thấy trong
      // console) — đặt priority cho mọi kích thước, không chỉ "lg".
      priority
      className={`${styles.logo} ${size === "lg" ? styles.lg : size === "md" ? styles.md : styles.sm}`}
    />
  );
}
