import Link from "next/link";
import Image from "next/image";
import styles from "./NavIconLink.module.css";

/**
 * 1 ô trong thanh icon-toolbar giữa header ("Tìm tin/Bảng tin/Bản đồ") —
 * icon ảnh (do người dùng cung cấp, không phải icon font) phía trên + nhãn
 * chữ nhỏ phía dưới, không cần hover mới biết là mục gì. Tách riêng khỏi
 * SiteHeader để tránh lặp JSX (link + active-class) mỗi khi map qua danh
 * sách mục.
 */
export function NavIconLink({
  href,
  label,
  iconSrc,
  isActive,
}: {
  href: string;
  label: string;
  /** Đường dẫn ảnh icon trong /public — ảnh đã có sẵn 2 màu forest/mustard
   *  đúng theme nên không cần tô màu lại qua CSS như icon font trước đây. */
  iconSrc: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`${styles.tile} ${isActive ? styles.tileActive : ""}`}
    >
      <Image src={iconSrc} alt="" width={40} height={40} className={styles.iconImg} />
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
