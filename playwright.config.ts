import { defineConfig, devices } from "@playwright/test";

/**
 * Test tự động kiểm tra layout mobile (overflow ngang, nav đúng breakpoint,
 * kích thước vùng chạm, form không vỡ khi bàn phím ảo mở...) trên 3 device
 * preset đại diện phổ biến nhất của người dùng thực tế (sinh viên Cần Thơ).
 * Đây LÀ suite duy nhất trong repo hiện tại — chưa có unit/integration test
 * nào khác, nên không cần lo ngại xung đột `testDir`.
 *
 * `iPhone SE (3rd gen)` (375x667, webkit) được chọn thay vì preset "iPhone
 * SE" trần của Playwright (thực ra là bản 2016, 320x568) — 375x667 khớp máy
 * "iPhone SE" mà người dùng thực tế hay nhắc tới (bản 2020/2022).
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // 1 worker: các test dùng chung 1 tài khoản mock đăng nhập qua storageState
  // (`tests/auth.setup.ts`) — tránh 2 test cùng lúc đụng vào state của cùng
  // 1 user (vd feed_preferences, saved-search quota) trên DB dev thật.
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  outputDir: "test-results",

  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    // Ảnh chụp được tự lưu tường minh trong từng test (đặt tên theo
    // page_device.png) — tắt screenshot tự động của Playwright để khỏi lẫn
    // 2 bộ ảnh khác quy ước đặt tên.
    screenshot: "off",
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "iphone13",
      use: { ...devices["iPhone 13"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "pixel5",
      use: { ...devices["Pixel 5"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "iphonese",
      use: { ...devices["iPhone SE (3rd gen)"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],

  // Tự khởi động `next dev` nếu chưa chạy sẵn — an toàn để chạy lại nhiều
  // lần (reuseExistingServer), không cần nhớ bật server tay trước khi test.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
