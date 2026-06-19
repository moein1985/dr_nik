import { expect, test } from "@playwright/test";

test.describe("booking auth desktop interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto("/fa/booking");
  });

  test("active session banner shows logout and panel actions after login", async ({ page }) => {
    const uniquePhone = `0912${Date.now().toString().slice(-7)}`;
    const password = "QaPatient123!";

    await page.locator('input[placeholder="شماره موبایل"]:visible').first().fill(uniquePhone);
    await page.locator('input[placeholder="رمز عبور"]:visible').first().fill(password);
    await page.locator('input[placeholder="تکرار رمز عبور"]:visible').first().fill(password);
    await page.locator("button:visible").filter({ hasText: "ثبت نام" }).click();

    const identifierInput = page.locator('input[placeholder="موبایل یا نام کاربری"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();

    await identifierInput.fill(uniquePhone);
    await passwordInput.fill(password);
    await page.locator("button:visible").filter({ hasText: "ورود" }).first().click();

    await expect(page.getByText("نشست فعال")).toBeVisible();
    await expect(page.locator("button:visible").filter({ hasText: "خروج" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ادامه و مدیریت نوبت ها" })).toBeVisible();

    await page.locator("button:visible").filter({ hasText: "خروج" }).click();
    await expect(page.getByRole("button", { name: /بیمار جدید هستم/ })).toBeVisible();
  });

  test("register inputs stay editable on desktop", async ({ page }) => {
    const phoneInput = page.locator('input[placeholder="شماره موبایل"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();
    const confirmInput = page.locator('input[placeholder="تکرار رمز عبور"]:visible').first();

    await phoneInput.click();
    await phoneInput.fill("09120000000");
    await passwordInput.click();
    await passwordInput.fill("Password123!");
    await confirmInput.click();
    await confirmInput.fill("Password123!");

    await expect(phoneInput).toHaveValue("09120000000");
    await expect(passwordInput).toHaveValue("Password123!");
    await expect(confirmInput).toHaveValue("Password123!");
  });

  test("login inputs stay editable after switching desktop panel", async ({ page }) => {
    await page.locator("button:visible").filter({ hasText: "ورود" }).last().click();

    const identifierInput = page.locator('input[placeholder="موبایل یا نام کاربری"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();

    await expect(identifierInput).toBeVisible();
    await identifierInput.click();
    await identifierInput.fill("mohseni");
    await passwordInput.click();
    await passwordInput.fill("Secret123!");

    await expect(identifierInput).toHaveValue("mohseni");
    await expect(passwordInput).toHaveValue("Secret123!");
  });

  test("forgot password flow stays reachable and editable on desktop", async ({ page }) => {
    await page.locator("button:visible").filter({ hasText: "ورود" }).last().click();
    await page.locator("button:visible").filter({ hasText: "بازیابی رمز" }).click();

    const phoneInput = page.locator('input[placeholder="شماره موبایل"]:visible').first();
    const otpInput = page.locator('input[placeholder="کد تایید 6 رقمی"]:visible').first();

    await expect(otpInput).toBeVisible();
    await phoneInput.click();
    await phoneInput.fill("09120000000");
    await otpInput.click();
    await otpInput.fill("123456");

    await expect(phoneInput).toHaveValue("09120000000");
    await expect(otpInput).toHaveValue("123456");
  });
});
