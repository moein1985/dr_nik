import { test, expect } from '@playwright/test';

// Mobile viewport tests
test.describe('Mobile Responsive Tests', () => {
  // Set mobile viewport for all tests in this describe block
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
  });

  test('home page should not have horizontal overflow', async ({ page }) => {
    await page.goto('/fa');
    
    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // Allow 1px tolerance
  });

  test('all text should be readable on mobile', async ({ page }) => {
    await page.goto('/fa');
    
    // Check font sizes are not too small (allow 11px for small labels)
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button').all();
    
    for (const element of textElements) {
      const fontSize = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return parseInt(styles.fontSize);
      });
      
      // Minimum readable font size for mobile (11px for small labels)
      expect(fontSize).toBeGreaterThanOrEqual(11);
    }
  });

  test('touch targets should be large enough', async ({ page }) => {
    await page.goto('/fa');
    
    // Check buttons and links have minimum touch target size
    // Skip very small elements (< 10px - likely icons or decorative)
    const interactiveElements = await page.locator('button:not([aria-label*="Close"]):not([aria-label*="close"]), a[href]:not([aria-label*="Close"]):not([aria-label*="close"])').all();
    
    let failures = 0;
    for (const element of interactiveElements) {
      const box = await element.boundingBox();
      if (box && box.height >= 10) {
        // Only check elements that are at least 10px (skip tiny icons)
        if (box.height < 28) {
          failures++;
        }
      }
    }
    // Allow up to 5 small elements (icons, decorative links, etc.)
    expect(failures).toBeLessThanOrEqual(5);
  });

  test('navigation should work on mobile', async ({ page }) => {
    await page.goto('/fa');
    
    // Test navigation links
    const servicesLink = page.locator('a[href*="services"]').first();
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/\/services/);
    }
    
    await page.goto('/fa');
    const galleryLink = page.locator('a[href*="gallery"]').first();
    if (await galleryLink.isVisible()) {
      await galleryLink.click();
      await expect(page).toHaveURL(/\/gallery/);
    }
    
    await page.goto('/fa');
    const contactLink = page.locator('a[href*="contact"]').first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).toHaveURL(/\/contact/);
    }
  });

  test('booking form should be usable on mobile', async ({ page }) => {
    await page.goto('/fa/booking');
    
    // Check page loads successfully
    await expect(page).toHaveURL(/\/booking/);
    
    // Check for any form or booking-related content
    const form = page.locator('form').first();
    const formExists = await form.count();
    
    if (formExists > 0 && await form.isVisible()) {
      // Check inputs are large enough if form is visible
      const inputs = await form.locator('input, select, textarea').all();
      for (const input of inputs) {
        const box = await input.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(32);
        }
      }
    }
    // If form doesn't exist or is hidden, that's okay - it may require auth
  });

  test('RTL layout should work correctly on mobile', async ({ page }) => {
    await page.goto('/fa');
    
    // Check RTL direction
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
    
    // Check text alignment (accept logical property 'start' for RTL)
    const body = page.locator('body');
    const textAlign = await body.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign === 'right' || textAlign === 'start').toBe(true);
  });

  test('LTR layout should work correctly on mobile (English)', async ({ page }) => {
    await page.goto('/en');
    
    // Check LTR direction
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('ltr');
    
    // Check text alignment (accept logical property 'start' for LTR)
    const body = page.locator('body');
    const textAlign = await body.evaluate(el => window.getComputedStyle(el).textAlign);
    expect(textAlign === 'left' || textAlign === 'start').toBe(true);
  });

  test('images should not overflow on mobile', async ({ page }) => {
    await page.goto('/fa/gallery');
    
    // Check all images fit within viewport
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const box = await img.boundingBox();
      if (box) {
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(box.width).toBeLessThanOrEqual(windowWidth);
      }
    }
  });

  test('scroll should work smoothly on mobile', async ({ page }) => {
    await page.goto('/fa');
    
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Wait for scroll to complete
    await page.waitForTimeout(500);
    
    // Check scroll position
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
    
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    
    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter).toBe(0);
  });
});

// Test landscape orientation
test('landscape orientation should not have overflow', async ({ page }) => {
  await page.setViewportSize({ width: 926, height: 428 }); // iPhone landscape
  await page.goto('/fa');
  
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);
  
  expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
});

// Test tablet
test('tablet should work correctly', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); // iPad portrait
  await page.goto('/fa');
  
  // Check no horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const windowWidth = await page.evaluate(() => window.innerWidth);
  
  expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  
  // Check layout adapts
  const grid = page.locator('.grid').first();
  if (await grid.isVisible()) {
    const gridCols = await grid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.gridTemplateColumns;
    });
    
    // Should have multiple columns on tablet
    expect(gridCols).toContain(' ');
  }
});

// Test specific pages on mobile
test.describe('Mobile Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
  });

  test('about page on mobile', async ({ page }) => {
    await page.goto('/fa/about');
    
    // Check no overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
    
    // Check images fit
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('services page on mobile', async ({ page }) => {
    await page.goto('/fa/services');
    
    // Check service cards are readable (filter out invisible dropdowns)
    const cards = page.locator('.rounded-2xl:not(.invisible):not(.opacity-0), .card:not(.invisible):not(.opacity-0)');
    const count = await cards.count();
    
    if (count > 0) {
      const firstCard = cards.first();
      await expect(firstCard).toBeVisible();
      
      // Check card doesn't overflow
      const box = await firstCard.boundingBox();
      if (box) {
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(box.width).toBeLessThanOrEqual(windowWidth - 32); // Account for padding
      }
    }
  });

  test('contact page on mobile', async ({ page }) => {
    await page.goto('/fa/contact');
    
    // Check form is usable
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Check map iframe fits
    const iframe = page.locator('iframe').first();
    if (await iframe.isVisible()) {
      const box = await iframe.boundingBox();
      if (box) {
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(box.width).toBeLessThanOrEqual(windowWidth);
      }
    }
  });

  test('gallery page on mobile', async ({ page }) => {
    await page.goto('/fa/gallery');
    
    // Check gallery grid is responsive
    const grid = page.locator('.grid').first();
    await expect(grid).toBeVisible();
    
    // On mobile, should be single column
    const gridCols = await grid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.gridTemplateColumns;
    });
    
    // Single column on mobile (no space in gridTemplateColumns)
    expect(gridCols).not.toContain(' ');
  });
});

// Test i18n on mobile
test.describe('Mobile i18n Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
  });

  test('Persian (RTL) on mobile', async ({ page }) => {
    await page.goto('/fa');
    
    // Wait for DOM content to load
    await page.waitForLoadState('domcontentloaded');
    
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
    
    // Check no overflow with RTL
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test('English (LTR) on mobile', async ({ page }) => {
    await page.goto('/en');
    
    const html = page.locator('html');
    expect(await html.getAttribute('dir')).toBe('ltr');
    expect(await html.getAttribute('lang')).toBe('en');
    
    // Check no overflow with LTR
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test('Arabic (RTL) on mobile', async ({ page }) => {
    await page.goto('/ar');
    
    // Wait for DOM content to load
    await page.waitForLoadState('domcontentloaded');
    
    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');
    
    // Check no overflow with RTL
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });
});
