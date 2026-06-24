import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Visual Regression Tests', () => {
  const mobileDevices = [
    devices['iPhone 12'],
    devices['Pixel 5'],
  ];

  mobileDevices.forEach(device => {
    test.describe(`${device.userAgent?.includes('iPhone') ? 'iPhone' : 'Android'}`, () => {
      test.use({ ...device });

      test('home page visual snapshot', async ({ page }) => {
        await page.goto('/fa');
        await expect(page).toHaveScreenshot(`home-${device.userAgent?.includes('iPhone') ? 'iphone' : 'android'}.png`);
      });

      test('services page visual snapshot', async ({ page }) => {
        await page.goto('/fa/services');
        await expect(page).toHaveScreenshot(`services-${device.userAgent?.includes('iPhone') ? 'iphone' : 'android'}.png`);
      });

      test('gallery page visual snapshot', async ({ page }) => {
        await page.goto('/fa/gallery');
        await expect(page).toHaveScreenshot(`gallery-${device.userAgent?.includes('iPhone') ? 'iphone' : 'android'}.png`);
      });

      test('RTL layout visual check (Persian)', async ({ page }) => {
        await page.goto('/fa');
        await expect(page).toHaveScreenshot(`rtl-persian-${device.userAgent?.includes('iPhone') ? 'iphone' : 'android'}.png`);
      });

      test('LTR layout visual check (English)', async ({ page }) => {
        await page.goto('/en');
        await expect(page).toHaveScreenshot(`ltr-english-${device.userAgent?.includes('iPhone') ? 'iphone' : 'android'}.png`);
      });
    });
  });
});
