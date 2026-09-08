import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import { PAGES, getHorizontalOverflow, measureTouchTarget, MIN_TOUCH_TARGET_PX } from "../pages";

// KHÔNG đặt trong `test-results/` (Playwright's `outputDir`, xem
// playwright.config.ts) — Playwright tự XOÁ SẠCH toàn bộ outputDir mỗi lần
// `playwright test` chạy, kể cả khi chỉ chạy 1 file/test lẻ (không chỉ file
// vừa chạy) — phát hiện thật khi 1 lần chạy debug ngoài suite chính xoá mất
// hết ảnh của lần chạy full suite trước đó. Thư mục riêng này không bị đụng
// tới trừ khi chính suite này ghi đè.
const SCREENSHOT_DIR = "test-results-mobile-screenshots";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

for (const spec of PAGES) {
  test.describe(`${spec.id} (${spec.path})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(spec.path);
      await page.waitForLoadState("networkidle");
    });

    // Luôn chụp ảnh full-page NGAY sau khi trang load xong, TRƯỚC mọi
    // assertion — để dù test sau đó fail, ảnh vẫn được lưu lại cho việc
    // skim trực quan (đúng yêu cầu "not just pass/fail").
    test.afterEach(async ({ page }, testInfo) => {
      const device = testInfo.project.name;
      const path = `${SCREENSHOT_DIR}/${spec.id}_${device}.png`;
      await page.screenshot({ path, fullPage: true }).catch(() => {});
    });

    test("không tràn ngang (no horizontal overflow)", async ({ page }) => {
      const { scrollWidth, viewportWidth } = await getHorizontalOverflow(page);
      expect(scrollWidth, `scrollWidth (${scrollWidth}px) vượt viewport (${viewportWidth}px)`).toBeLessThanOrEqual(
        viewportWidth + 1,
      );
    });

    if (spec.hasHeader) {
      test("header co đúng chế độ icon-only ở màn hình hẹp (<400px)", async ({ page }, testInfo) => {
        // Cả 3 device test đều <400px viewport (390/393/375) — breakpoint
        // 400px trong `SiteHeader.module.css`/`NavIconLink.module.css` LUÔN
        // phải kích hoạt chế độ chỉ-icon-không-chữ ở cả 3. Đây là "nav đúng
        // breakpoint" thực tế của app (không có bottom tab bar riêng — xem
        // trao đổi với người dùng trước khi build suite này).
        const viewportWidth = testInfo.project.use.viewport?.width ?? 0;
        expect(viewportWidth, "test giả định cả 3 device đều <400px").toBeLessThan(400);

        const homeTile = page.locator('nav a[href="/"][class*="tile"]');
        await expect(homeTile).toBeVisible();
        const label = homeTile.locator('[class*="label"]');
        await expect(label).toBeHidden();

        // Đồng thời xác nhận header không tràn ngang riêng nó (dễ vỡ nhất
        // khi co hẹp nhiều mức như header này).
        const headerBox = await page.locator("header").boundingBox();
        expect(headerBox).not.toBeNull();
        if (headerBox) {
          expect(headerBox.width).toBeLessThanOrEqual(viewportWidth + 1);
        }
      });

      test("vùng chạm icon nav >= 44x44px", async ({ page }) => {
        const tiles = page.locator('nav[class*="iconToolbar"] a[class*="tile"]');
        const count = await tiles.count();
        expect(count, "phải thấy ít nhất 1 icon nav").toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const result = await measureTouchTarget(tiles.nth(i), `nav-icon-${i}`);
          expect.soft(result?.passes, `icon nav #${i}: ${result?.width}x${result?.height}px (cần >=${MIN_TOUCH_TARGET_PX}x${MIN_TOUCH_TARGET_PX})`).toBeTruthy();
        }
      });
    }

    if (spec.primaryButtonText) {
      test(`vùng chạm nút "${spec.primaryButtonText}" >= 44x44px`, async ({ page }) => {
        // `.last()` không phải `.first()` — trang "dangtin" có 2 nút trùng
        // chữ "Đăng tin" (shortcut header LUÔN có mặt trên mọi trang có
        // header, + nút submit thật của form) — header render trước trong
        // DOM nên `.first()` từng đo nhầm nút shortcut thay vì nút chính
        // của trang (phát hiện khi số đo 86x34 khớp chính xác style riêng
        // của `.postButton` ở SiteHeader, không phải Button mặc định của
        // form). Các trang khác chỉ có đúng 1 match nên `.last()` tương
        // đương `.first()`, không đổi hành vi.
        const button = page.getByRole("button", { name: spec.primaryButtonText!, exact: true }).last();
        await expect(button).toBeVisible();
        const result = await measureTouchTarget(button, spec.primaryButtonText!);
        expect.soft(
          result?.passes,
          `"${spec.primaryButtonText}": ${result?.width}x${result?.height}px (cần >=${MIN_TOUCH_TARGET_PX}x${MIN_TOUCH_TARGET_PX})`,
        ).toBeTruthy();
      });
    }

    if (spec.formField) {
      test(`input "${spec.formField.label}" rộng gần hết bề ngang mobile`, async ({ page }, testInfo) => {
        const viewportWidth = testInfo.project.use.viewport?.width ?? 0;
        const input = page.getByLabel(spec.formField!.label, { exact: true });
        await expect(input).toBeVisible();
        const box = await input.boundingBox();
        expect(box).not.toBeNull();
        if (box) {
          // Ngưỡng 70% viewport — đủ chặt để bắt input còn "size cho desktop"
          // (vd cố định 300-400px) mà vẫn chừa khoảng cho padding card +
          // label 2 bên trên màn hẹp nhất (iPhone SE 375px).
          expect
            .soft(box.width, `input rộng ${box.width}px trên viewport ${viewportWidth}px`)
            .toBeGreaterThanOrEqual(viewportWidth * 0.7);
        }

        // Mô phỏng bàn phím ảo mở: focus input rồi kiểm tra layout không vỡ.
        await input.focus();
        await page.waitForTimeout(150);
        const { scrollWidth, viewportWidth: vw } = await getHorizontalOverflow(page);
        expect
          .soft(scrollWidth, `focus vào input làm trang tràn ngang (${scrollWidth}px > ${vw}px)`)
          .toBeLessThanOrEqual(vw + 1);

        const boxAfterFocus = await input.boundingBox();
        expect(boxAfterFocus, "input biến mất/bị đẩy khỏi màn hình sau khi focus").not.toBeNull();
        if (boxAfterFocus) {
          expect
            .soft(boxAfterFocus.x, "input bị đẩy ra ngoài mép trái viewport sau khi focus")
            .toBeGreaterThanOrEqual(-1);
          expect
            .soft(boxAfterFocus.x + boxAfterFocus.width, "input bị đẩy ra ngoài mép phải viewport sau khi focus")
            .toBeLessThanOrEqual(vw + 1);
        }
      });
    }

    if (spec.isMapPage) {
      test("Leaflet map render với chiều cao > 0 trên mobile", async ({ page }) => {
        const map = page.locator(".leaflet-container");
        await expect(map).toBeVisible({ timeout: 10_000 });
        const box = await map.boundingBox();
        expect(box, "không đo được kích thước map container").not.toBeNull();
        if (box) {
          expect(box.height, `map container cao ${box.height}px — phải > 0`).toBeGreaterThan(0);
          expect(box.width, `map container rộng ${box.width}px — phải > 0`).toBeGreaterThan(0);
        }
        // Container đúng kích thước chưa chắc đã có TILE thật (ảnh tile tải
        // từ OpenStreetMap qua mạng, cần thêm chút thời gian) — chờ ít nhất
        // 1 ảnh tile gắn vào DOM để chắc map không chỉ "đúng kích thước
        // nhưng trắng trơn".
        await expect(page.locator("img.leaflet-tile").first()).toBeAttached({ timeout: 10_000 });
      });
    }
  });
}
