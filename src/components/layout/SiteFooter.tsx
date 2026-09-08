"use client";

import Link from "next/link";
import { FacebookOutlined, HomeOutlined, InstagramOutlined } from "@ant-design/icons";
import { IconBadge } from "@/components/decor/IconBadge";
import { COLOR_INK, COLOR_MUSTARD, COLOR_MUSTARD_DARK } from "@/theme/tokens";
import styles from "./SiteFooter.module.css";

/**
 * ⚠️ Route/link chưa có trang thật (placeholder, sẽ 404 tới khi build):
 * /cau-hoi-thuong-gap, /huong-dan-dang-tin, /lien-he, /chinh-sach-bao-mat.
 * ⚠️ Social: chưa có URL Facebook/Instagram thật của dự án — href để "#".
 * Kênh thứ 3 (spec cho phép "nếu có") — dự án chưa có kênh nào khác, không
 * thêm icon giả cho đủ số.
 */
const NAV_LINKS = [
  { href: "/", label: "Tìm tin" },
  { href: "/dang-tin", label: "Đăng tin" },
  { href: "/tim-kiem-da-luu", label: "Tìm kiếm đã lưu" },
];

const SUPPORT_LINKS = [
  { href: "/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp", placeholder: true },
  { href: "/huong-dan-dang-tin", label: "Hướng dẫn đăng tin", placeholder: true },
  { href: "/lien-he", label: "Liên hệ", placeholder: true },
];

const LEGAL_LINKS = [
  { href: "/dieu-khoan-su-dung", label: "Điều khoản sử dụng", placeholder: false },
  { href: "/chinh-sach-bao-mat", label: "Chính sách bảo mật", placeholder: true },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <IconBadge
                size={34}
                radius={9}
                background={COLOR_MUSTARD}
                shadowColor={COLOR_MUSTARD_DARK}
                iconColor={COLOR_INK}
                rotateDeg={-6}
                icon={<HomeOutlined />}
              />
              <span className={styles.brandName}>Pass Phòng Cần Thơ</span>
            </div>
            <span className={styles.tagline}>Cần Thơ ơi, pass phòng nè!</span>
            <p className={styles.description}>
              Kết nối người pass phòng và người tìm phòng ở Cần Thơ — nhanh, gọn, đúng khu vực bạn cần.
            </p>
            <div className={styles.socialRow}>
              <a href="#" className={styles.socialBadge} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <FacebookOutlined />
              </a>
              <a href="#" className={styles.socialBadge} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <InstagramOutlined />
              </a>
            </div>
          </div>

          <div>
            <div className={styles.colTitle}>Điều hướng</div>
            <div className={styles.colLinks}>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.colLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.colTitle}>Hỗ trợ</div>
            <div className={styles.colLinks}>
              {SUPPORT_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.colLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.colTitle}>Pháp lý</div>
            <div className={styles.colLinks}>
              {LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={styles.colLink}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.divider} aria-hidden />

        <div className={styles.bottomBar}>
          <span>© {year} Pass Phòng Cần Thơ. Làm bởi sinh viên, cho sinh viên.</span>
          <div className={styles.bottomLinks}>
            <Link href="/dieu-khoan-su-dung">Điều khoản</Link>
            <Link href="/chinh-sach-bao-mat">Bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
