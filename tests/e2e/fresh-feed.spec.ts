import { test, expect } from "@playwright/test";

test.describe("Fresh Feed - unauthenticated user", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/fa/fresh");
  });

  test("should display fresh feed page with posts", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("تازه‌ها");
  });

  test("should show login warning when clicking like without auth", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const likeButton = page.locator("button").filter({ has: page.locator(".lucide-heart") }).first();
    await likeButton.click();

    await expect(page.getByText("برای لایک و کامنت باید وارد شوید")).toBeVisible({ timeout: 5000 });
  });

  test("should show login warning when trying to comment without auth", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const commentInput = page.getByPlaceholder("Add a comment...").first();
    await commentInput.fill("Test comment");
    await commentInput.press("Enter");

    await expect(page.getByText("برای لایک و کامنت باید وارد شوید")).toBeVisible({ timeout: 5000 });
  });

  test("should display post media (image or video)", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const media = page.locator("img[src*='/api/uploads/'], video[src*='/api/uploads/']").first();
    await expect(media).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Fresh Feed - authenticated user", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/fa");

    await page.locator("button:visible").filter({ hasText: "ورود" }).last().click();

    const identifierInput = page.locator('input[placeholder="موبایل یا نام کاربری"]:visible').first();
    const passwordInput = page.locator('input[placeholder="رمز عبور"]:visible').first();

    await identifierInput.fill("testpatient");
    await passwordInput.fill("TestPatient123!");
    await page.locator("button:visible").filter({ hasText: "ورود" }).first().click();

    await page.waitForTimeout(2000);
    await page.goto("/fa/fresh");
    await page.waitForLoadState("networkidle");
  });

  test("should not show login warning when clicking like as authenticated user", async ({ page }) => {
    const likeButton = page.locator("button").filter({ has: page.locator(".lucide-heart") }).first();
    await likeButton.click();

    await expect(page.getByText("برای لایک و کامنت باید وارد شوید")).not.toBeVisible({ timeout: 3000 });
  });

  test("should allow adding a comment as authenticated user", async ({ page }) => {
    const commentInput = page.getByPlaceholder("Add a comment...").first();
    const testComment = `E2E test comment ${Date.now()}`;
    await commentInput.fill(testComment);

    const postButton = page.getByText("Post").first();
    await postButton.click();

    await expect(page.getByText(testComment)).toBeVisible({ timeout: 5000 });
  });
});
