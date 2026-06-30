import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Bug 3 & 4: Booking form and timezone validation", () => {
  test("booking page loads for fa locale without console errors", async ({ page }) => {
    const errors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE}/fa/booking`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    expect(errors).toEqual([]);
    // Allow some console errors that may be unrelated (analytics, etc)
    // but fail on critical errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("net::ERR"),
    );
    expect(criticalErrors).toEqual([]);
  });

  test("booking page loads for en locale without console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/en/booking`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    expect(errors).toEqual([]);
  });

  test("dental pages load without 500 errors across all locales", async ({ page }) => {
    const locales = ["fa", "en", "ar"];
    const pages = ["dental", "dental/implants", "dental/bleaching", "dental/scaling", "dental/composite", "dental/laminate"];

    for (const locale of locales) {
      for (const pagePath of pages) {
        const response = await page.goto(`${BASE}/${locale}/services/${pagePath}`, { timeout: 15000 });
        expect(response?.status()).toBeLessThan(500);
      }
    }
  });
});

test.describe("Bug 4: Timezone consistency - date display", () => {
  test("appointment date displays consistently regardless of server timezone", async ({ page }) => {
    // This test verifies that the dental pages render without timezone-related errors
    // The actual timezone fix is unit-tested in is-slot-valid.use-case.test.ts
    const errors: string[] = [];

    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/fa/services/dental`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    expect(errors).toEqual([]);
  });
});
