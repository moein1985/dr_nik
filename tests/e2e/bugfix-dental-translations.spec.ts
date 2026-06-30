import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Bug 1: Dental page translations", () => {
  test("fa dental page shows Persian content", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/fa/services/dental`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Should not show hardcoded English "Cosmetic Dentistry"
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("Cosmetic Dentistry");

    // Should contain Persian dental title
    expect(bodyText).toContain("دندانپزشکی");
    expect(errors).toEqual([]);
  });

  test("en dental page shows English content", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/en/services/dental`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("Cosmetic Dentistry");
    expect(bodyText).toContain("Implants");
    expect(bodyText).toContain("Bleaching");
    expect(errors).toEqual([]);
  });

  test("ar dental page shows Arabic content", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/ar/services/dental`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("طب الأسنان");
    expect(errors).toEqual([]);
  });

  test("fa dental implants subpage shows Persian content", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/fa/services/dental/implants`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("Implants");
    expect(bodyText).toContain("ایمپلنت");
    expect(errors).toEqual([]);
  });

  test("dental page has 5 service section links", async ({ page }) => {
    await page.goto(`${BASE}/en/services/dental`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const links = page.locator("a[href*='/services/dental/']");
    await expect(links).toHaveCount(5);
  });
});

test.describe("Bug 2: Jalali calendar for fa locale", () => {
  test("booking page loads without errors for fa", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(`${BASE}/fa/booking`, { timeout: 15000 });
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // Page should load with Persian content
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toContain("رزرو");
    expect(errors).toEqual([]);
  });
});

test.describe("Bug 1: All dental subpages load without errors", () => {
  const subpages = ["implants", "bleaching", "scaling", "composite", "laminate"];

  subpages.forEach((subpage) => {
    test(`fa /services/dental/${subpage} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(`${BASE}/fa/services/dental/${subpage}`, { timeout: 15000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      expect(errors).toEqual([]);
    });

    test(`en /services/dental/${subpage} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(`${BASE}/en/services/dental/${subpage}`, { timeout: 15000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 });

      expect(errors).toEqual([]);
    });
  });
});
