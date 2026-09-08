import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro, Pacifico } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AntdProvider } from "@/components/providers/AntdProvider";
import "./globals.css";

// Dorm Bulletin Board — 3 font: Baloo 2 cho heading, Be Vietnam Pro cho
// body/UI, Pacifico CHỈ cho 1-2 điểm nhấn viết tay (logo, TapeLabel) —
// không dùng cho heading hay body.
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700", "800"],
});

// Pacifico thay cho Caveat (đã bỏ) — Caveat trên Google Fonts KHÔNG có
// subset "vietnamese", chữ có dấu phức (vd "ầ" trong "Cần Thơ") bị vỡ giữa
// từ khi fallback sang font khác. Pacifico có đầy đủ subset vietnamese nên
// hiển thị đúng "Cần Thơ ơi!" trong logo.
const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin", "vietnamese"],
  weight: "400",
});

const SITE_NAME = "Pass Phòng Cần Thơ";
const SITE_DESCRIPTION =
  "Đăng và tìm tin pass phòng/sang nhượng cọc ở Cần Thơ — lọc theo khu vực, giá, ngày cần pass. Lưu tìm kiếm để không bỏ lỡ tin mới.";

/**
 * `??` không bắt được chuỗi rỗng (`SITE_URL=""` — vd biến môi trường được
 * khai báo trên Vercel nhưng để trống) — `new URL("")` throw "Invalid URL",
 * sập toàn bộ build (đã gặp thật lúc deploy). Validate + fallback tường
 * minh thay vì tin thẳng giá trị env, để 1 biến môi trường thiếu/sai không
 * bao giờ làm sập cả site — chỉ log cảnh báo, ảnh Open Graph tạm sai domain.
 */
function resolveSiteUrl(): URL {
  const raw = process.env.SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      console.error(`SITE_URL không hợp lệ ("${raw}") — dùng tạm localhost, kiểm tra lại biến môi trường.`);
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: `${SITE_NAME} — Đăng & tìm tin pass phòng nhanh chóng`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "vi_VN",
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${baloo2.variable} ${pacifico.variable}`}>
      <body>
        <AntdProvider>{children}</AntdProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
