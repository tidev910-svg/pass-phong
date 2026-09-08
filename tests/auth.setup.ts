import { test as setup, expect } from "@playwright/test";

// Tài khoản mock có sẵn trong `supabase/mock-data.sql` (xem memory dự án
// `playwright-testing-setup`) — `mock_sv5` ưu tiên vì ít bị test trước đó
// đụng vào nhất (mock_sv1/mock_sv3 đã bị đổi state ở lần test trước).
const USERNAME = "mock_sv5";
const PASSWORD = "Test1234";

const STORAGE_STATE_PATH = "playwright/.auth/user.json";

/**
 * Đăng nhập 1 lần, lưu lại session cookie (`storageState`) để 3 project
 * device (iphone13/pixel5/iphonese) dùng chung — tránh mỗi test tự đăng
 * nhập lại (chậm + tốn quota thao tác trên DB dev thật). `/bang-tin` yêu
 * cầu đã có `feed_preferences` (xem `bang-tin/page.tsx`), redirect sang
 * `/bang-tin/thiet-lap` nếu chưa — tự hoàn tất bước thiết lập tối thiểu ở
 * đây luôn, để test suite không phụ thuộc việc tài khoản mock đã setup sẵn
 * hay chưa.
 */
setup("đăng nhập + đảm bảo có feed_preferences", async ({ page }) => {
  await page.goto("/dang-nhap");
  await page.getByLabel("Tên đăng nhập").fill(USERNAME);
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => url.pathname !== "/dang-nhap", { timeout: 15_000 });

  await page.goto("/bang-tin");
  // `redirect("/bang-tin/thiet-lap")` ở `bang-tin/page.tsx` chạy TRONG 1
  // segment con, sau khi layout cha (`(account)/layout.tsx`, có
  // `SiteHeader`) đã kịp stream ra rồi — Next.js xử lý bằng cách gửi kèm 1
  // "redirect marker" trong RSC payload để CLIENT tự điều hướng tiếp, thay
  // vì 1 HTTP 307 sạch (đã gửi header rồi nên không đổi được nữa). Lần đầu
  // ghé `/bang-tin` trong phiên `next dev` (Turbopack biên dịch on-demand),
  // việc client nhận + thực thi redirect này có thể mất vài giây — timeout
  // dài hơn bình thường ở đây là vì lý do đó, không phải bug app. Xác nhận
  // qua debug thủ công: cùng 1 tài khoản, lần ghé thứ 2 trở đi redirect gần
  // như tức thời.
  await page.waitForURL(/\/bang-tin(\/thiet-lap)?$/, { timeout: 15_000 });

  if (page.url().includes("/bang-tin/thiet-lap")) {
    // `Tag.CheckableTag` render ra role "checkbox" có tên truy cập = chính
    // text hiển thị (xác nhận qua accessibility snapshot lúc debug) — dùng
    // tên thật thay vì đoán class CSS (antd v6 hay đổi/không giữ class dự
    // đoán được, xem memory `antd-nextjs-gotchas`).
    await page.getByRole("checkbox", { name: "Ninh Kiều (gần ĐH Cần Thơ khu 2)" }).click();
    await page.getByRole("checkbox", { name: "Có máy lạnh" }).click();
    await page.getByRole("button", { name: "Xem Bảng tin" }).click();
    await page.waitForURL("**/bang-tin", { timeout: 15_000 });
  }

  await expect(page.getByText("Bảng tin của bạn")).toBeVisible({ timeout: 15_000 });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
