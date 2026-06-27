import { test, expect } from "@playwright/test";

const pages = [
  // Persian pages
  "/fa",
  "/fa/fresh",
  "/fa/about",
  "/fa/services",
  "/fa/gallery",
  "/fa/staff",
  "/fa/contact",
  "/fa/patient",
  "/fa/dashboard",
  // English pages
  "/en",
  "/en/fresh",
  "/en/about",
  "/en/services",
  "/en/gallery",
  "/en/staff",
  "/en/contact",
  "/en/patient",
  "/en/dashboard",
  // Arabic pages
  "/ar",
  "/ar/fresh",
  "/ar/about",
  "/ar/services",
  "/ar/gallery",
  "/ar/staff",
  "/ar/contact",
  "/ar/patient",
  "/ar/dashboard",
];

test.describe("All pages smoke test", () => {
  pages.forEach((path) => {
    test(`${path} loads without errors`, async ({ page }) => {
      const errors: string[] = [];
      const consoleErrors: string[] = [];

      page.on("pageerror", (err) => errors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const response = await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(response?.status()).toBeLessThan(400);
      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  });
});
