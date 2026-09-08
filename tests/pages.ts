import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách trang cần kiểm tra layout mobile — mapping tên trang user yêu
 * cầu sang route thật của app (dựa theo chính nhãn nav trong `SiteHeader`):
 * "Tìm tin" trỏ `/` nên "Tìm tin (list)" = trang chủ `/`; phần "Trang chủ/
 * feed" còn lại ứng với `/bang-tin` (Bảng tin cá nhân hoá, dạng feed 1 cột
 * kiểu Facebook — đúng nghĩa "feed" nhất trong app).
 */
export interface PageSpec {
  /** Dùng làm tiền tố tên file ảnh chụp, vd "feed_iphone13.png". */
  id: string;
  path: string;
  /** Route con của `(account)` — layout tự `requireSession()`. */
  requiresAuth: boolean;
  /** `(auth)` layout (đăng nhập/đăng ký) không render `SiteHeader`. */
  hasHeader: boolean;
  /** Nút chính cần spot-check kích thước vùng chạm ở trang này — theo đúng
   * danh sách "Tìm phòng, Đăng tin, Lưu thay đổi" người dùng nêu (bổ sung
   * Đăng nhập/Đăng ký vì cùng là nút submit chính của trang, không có lý do
   * bỏ qua). `undefined` = trang không có 1 nút chính rõ ràng để chốt. */
  primaryButtonText?: string;
  /** Trang có form cần kiểm tra field full-width + hành vi khi focus input
   * (mô phỏng bàn phím ảo mở) theo yêu cầu #6. */
  formField?: { label: string; skipVisibilityWait?: boolean };
  isMapPage?: boolean;
}

export const PAGES: PageSpec[] = [
  { id: "feed", path: "/bang-tin", requiresAuth: true, hasHeader: true },
  { id: "home", path: "/", requiresAuth: false, hasHeader: true, primaryButtonText: "Tìm phòng" },
  { id: "map", path: "/tim-tin/ban-do", requiresAuth: false, hasHeader: true, isMapPage: true },
  {
    id: "dangtin",
    path: "/dang-tin",
    requiresAuth: true,
    hasHeader: true,
    primaryButtonText: "Đăng tin",
    formField: { label: "Số điện thoại" },
  },
  {
    id: "dangnhap",
    path: "/dang-nhap",
    requiresAuth: false,
    hasHeader: false,
    primaryButtonText: "Đăng nhập",
    formField: { label: "Tên đăng nhập" },
  },
  {
    id: "dangky",
    path: "/dang-ky",
    requiresAuth: false,
    hasHeader: false,
    primaryButtonText: "Đăng ký",
    formField: { label: "Tên đăng nhập" },
  },
  {
    id: "profile",
    // Deep-link thẳng tab "Cài đặt tài khoản" (`ProfileTabs.tsx` đọc
    // `?tab=`) — đây là tab có nút "Lưu thay đổi" + form cần test, tab mặc
    // định ("Tin của tôi") không có gì trong yêu cầu #3/#6 để kiểm.
    path: "/tai-khoan?tab=settings",
    requiresAuth: true,
    hasHeader: true,
    primaryButtonText: "Lưu thay đổi",
    formField: { label: "Tên hiển thị" },
  },
];

const MIN_TOUCH_TARGET_PX = 44;

export interface TouchTargetResult {
  name: string;
  width: number;
  height: number;
  passes: boolean;
}

/** Đo vùng chạm thật (bounding box) của 1 phần tử — trả `null` nếu không
 * render (thay vì throw), để test tự quyết định coi là fail hay bỏ qua tuỳ
 * ngữ cảnh thay vì lỗi mơ hồ. */
export async function measureTouchTarget(locator: Locator, name: string): Promise<TouchTargetResult | null> {
  const box = await locator.boundingBox();
  if (!box) return null;
  return {
    name,
    width: box.width,
    height: box.height,
    passes: box.width >= MIN_TOUCH_TARGET_PX && box.height >= MIN_TOUCH_TARGET_PX,
  };
}

export { MIN_TOUCH_TARGET_PX };

/** scrollWidth > viewport width (có dung sai 1px cho làm tròn subpixel) —
 * cách phát hiện tràn ngang phổ biến nhất, không cần biết PHẦN TỬ nào gây
 * tràn (chỉ cần biết CÓ tràn hay không). */
export async function getHorizontalOverflow(page: Page): Promise<{ scrollWidth: number; viewportWidth: number }> {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
}
