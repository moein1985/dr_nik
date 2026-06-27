import { test, expect } from "@playwright/test";

test.describe("Content Manager Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/fa");

    await page.locator("button:visible").filter({ hasText: "ورود" }).last().click();

    const identifierInput = page.locator('input[placeholder="موبایل یا نام کاربری"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();

    await identifierInput.fill("contentmanager");
    await passwordInput.fill("ContentManager123!");
    await page.locator("button:visible").filter({ hasText: "ورود" }).first().click();

    await page.waitForTimeout(2000);
    await page.goto("/fa/dashboard?panel=content-manager");
    await page.waitForLoadState("networkidle");
  });

  test("should display content manager panel with tabs", async ({ page }) => {
    await expect(page.getByText("مدیریت محتوای تازه‌ها")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("پست‌ها")).toBeVisible();
    await expect(page.getByText("کامنت‌ها")).toBeVisible();
    await expect(page.getByText("پروفایل")).toBeVisible();
  });

  test("should display posts list", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    const postCards = page.locator(".rounded-lg.border.bg-card");
    const count = await postCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should show create post form when clicking create button", async ({ page }) => {
    await page.getByText("ایجاد پست جدید").click();
    await expect(page.locator("form")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("نوع رسانه:")).toBeVisible();
    await expect(page.getByText("URL رسانه:")).toBeVisible();
  });

  test("should switch to profile tab and show avatar upload", async ({ page }) => {
    await page.getByText("پروفایل").click();
    await expect(page.getByText("عکس پروفایل")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".rounded-full").first()).toBeVisible();
  });

  test("should switch to comments tab", async ({ page }) => {
    await page.getByText("کامنت‌ها").click();
    await page.waitForTimeout(1000);
  });

  test("should show media type dropdown with IMAGE and VIDEO options", async ({ page }) => {
    await page.getByText("ایجاد پست جدید").click();
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
    const options = await select.locator("option").allTextContents();
    expect(options).toContain("تصویر");
    expect(options).toContain("ویدیو");
  });
});

test.describe("Content Manager Panel - unauthorized access", () => {
  test("should not allow patient to access content manager panel", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/fa");

    await page.locator("button:visible").filter({ hasText: "ورود" }).last().click();

    const identifierInput = page.locator('input[placeholder="موبایل یا نام کاربری"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();

    await identifierInput.fill("testpatient");
    await passwordInput.fill("TestPatient123!");
    await page.locator("button:visible").filter({ hasText: "ورود" }).first().click();

    await page.waitForTimeout(2000);
    await page.goto("/fa/dashboard?panel=content-manager");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("مدیریت محتوای تازه‌ها")).not.toBeVisible({ timeout: 5000 });
  });
});
