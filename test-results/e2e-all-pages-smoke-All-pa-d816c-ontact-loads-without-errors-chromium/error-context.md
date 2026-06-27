# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e\all-pages-smoke.spec.ts >> All pages smoke test >> /en/contact loads without errors
- Location: tests\e2e\all-pages-smoke.spec.ts:41:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://192.168.85.37/en/contact
Call log:
  - navigating to "http://192.168.85.37/en/contact", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | // This test runs against the LXC production server
  4  | test.use({ baseURL: "http://192.168.85.37" });
  5  | 
  6  | const pages = [
  7  |   // Persian pages
  8  |   "/fa",
  9  |   "/fa/fresh",
  10 |   "/fa/about",
  11 |   "/fa/services",
  12 |   "/fa/gallery",
  13 |   "/fa/staff",
  14 |   "/fa/contact",
  15 |   "/fa/patient",
  16 |   "/fa/dashboard",
  17 |   // English pages
  18 |   "/en",
  19 |   "/en/fresh",
  20 |   "/en/about",
  21 |   "/en/services",
  22 |   "/en/gallery",
  23 |   "/en/staff",
  24 |   "/en/contact",
  25 |   "/en/patient",
  26 |   "/en/dashboard",
  27 |   // Arabic pages
  28 |   "/ar",
  29 |   "/ar/fresh",
  30 |   "/ar/about",
  31 |   "/ar/services",
  32 |   "/ar/gallery",
  33 |   "/ar/staff",
  34 |   "/ar/contact",
  35 |   "/ar/patient",
  36 |   "/ar/dashboard",
  37 | ];
  38 | 
  39 | test.describe("All pages smoke test", () => {
  40 |   pages.forEach((path) => {
  41 |     test(`${path} loads without errors`, async ({ page }) => {
  42 |       const errors: string[] = [];
  43 |       const consoleErrors: string[] = [];
  44 | 
  45 |       page.on("pageerror", (err) => errors.push(err.message));
  46 |       page.on("console", (msg) => {
  47 |         if (msg.type() === "error") consoleErrors.push(msg.text());
  48 |       });
  49 | 
> 50 |       const response = await page.goto(path);
     |                                   ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://192.168.85.37/en/contact
  51 |       await page.waitForLoadState("networkidle");
  52 | 
  53 |       expect(response?.status()).toBeLessThan(400);
  54 |       expect(errors).toEqual([]);
  55 |       expect(consoleErrors).toEqual([]);
  56 |     });
  57 |   });
  58 | });
  59 | 
  60 | test.describe.configure({ mode: "parallel" });
  61 | 
```