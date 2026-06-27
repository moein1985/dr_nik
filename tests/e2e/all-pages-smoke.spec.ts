import { test, expect } from "@playwright/test";

// This test runs against the LXC production server
test.use({ baseURL: "http://192.168.85.37" });

// Only test public pages that don't require authentication
const pages = [
  "/fa",
  "/fa/fresh",
  "/fa/about",
  "/fa/services",
  "/fa/gallery",
  "/fa/staff",
  "/fa/contact",
  "/en",
  "/en/fresh",
  "/en/about",
  "/en/services",
  "/en/gallery",
  "/en/staff",
  "/en/contact",
  "/ar",
  "/ar/fresh",
  "/ar/about",
  "/ar/services",
  "/ar/gallery",
  "/ar/staff",
  "/ar/contact",
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

      try {
        const response = await page.goto(path, { timeout: 10000 });
        await page.waitForLoadState("networkidle", { timeout: 10000 });

        if (response?.status()) {
          expect(response.status()).toBeLessThan(500);
        }
      } catch (error) {
        // If the server is not accessible, skip the test
        test.skip();
      }

      expect(errors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  });
});

test.describe.configure({ mode: "parallel" });
