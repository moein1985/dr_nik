# Mobile Testing Guide

## Overview
This guide covers automated mobile testing for the Dr. Nik Clinic website to ensure responsive design and no overflow issues on mobile devices.

## Prerequisites
- Playwright installed: `npm install -D @playwright/test`
- Mobile browsers installed: `npx playwright install --with-deps`

## Test Files

### 1. Functional Mobile Tests (`mobile.spec.ts`)
Tests for:
- Horizontal overflow detection
- Readable font sizes
- Touch target sizes (minimum 44x44px)
- Navigation functionality
- Form usability
- RTL/LTR layout correctness
- Image fitting
- Modal/overlay sizing
- Smooth scrolling

### 2. Visual Regression Tests (`mobile-visual.spec.ts`)
Screenshot comparisons for:
- Home page
- Services page
- Gallery page
- RTL layout (Persian)
- LTR layout (English)

## Running Tests

### Run all mobile tests
```bash
npx playwright test mobile.spec.ts
```

### Run with UI (recommended for debugging)
```bash
npx playwright test mobile.spec.ts --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test mobile.spec.ts --headed
```

### Run visual regression tests
```bash
npx playwright test mobile-visual.spec.ts
```

### Update visual snapshots (after intentional changes)
```bash
npx playwright test mobile-visual.spec.ts --update-snapshots
```

### Run specific device tests
```bash
npx playwright test mobile.spec.ts --project="chromium"
```

## Test Devices Covered
- iPhone 12 (390x844)
- iPhone 12 Pro (390x844)
- Pixel 5 (393x851)
- Galaxy S9+ (360x740)
- iPad (768x1024)
- Landscape orientation (926x428)

## Manual Testing Checklist

### 1. Real Device Testing
Test on actual devices:
- [ ] iPhone (iOS Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Small Android phone (e.g., Galaxy S series)

### 2. Browser DevTools
Chrome DevTools:
1. Open DevTools (F12)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select device from dropdown
4. Test different orientations

### 3. Key Areas to Check

#### Typography
- [ ] Font sizes are readable (minimum 12px)
- [ ] Line height is sufficient (1.4-1.6)
- [ ] Text doesn't overflow containers
- [ ] Persian/Arabic text renders correctly

#### Touch Targets
- [ ] Buttons are at least 44x44px
- [ ] Links have adequate spacing
- [ ] Form inputs are tappable
- [ ] No overlapping interactive elements

#### Layout
- [ ] No horizontal scroll on any page
- [ ] Content fits within viewport
- [ ] Padding/margins are adequate
- [ ] Grid layouts adapt to mobile
- [ ] Flex containers wrap correctly

#### Images
- [ ] Images scale properly
- [ ] No image overflow
- [ ] Alt text is present
- [ ] Lazy loading works

#### Navigation
- [ ] Menu is accessible on mobile
- [ ] Hamburger menu works
- [ ] Back navigation works
- [ ] Deep links work

#### Forms
- [ ] Input fields are large enough
- [ ] Select dropdowns work
- [ ] Date pickers are mobile-friendly
- [ ] Form validation messages are visible
- [ ] Submit buttons are tappable

#### RTL/LTR
- [ ] Persian (RTL) layout correct
- [ ] English (LTR) layout correct
- [ ] Arabic (RTL) layout correct
- [ ] Text alignment correct
- [ ] Margins/paddings mirrored correctly

#### Performance
- [ ] Page loads quickly (< 3s)
- [ ] Images are optimized
- [ ] No layout shift (CLS)
- [ ] Smooth scrolling

## Common Issues & Solutions

### Horizontal Overflow
**Cause:** Fixed widths, large images, or long text
**Solution:** Use `max-width: 100%`, `overflow-x: hidden`, or responsive units

### Touch Targets Too Small
**Cause:** Small buttons or links
**Solution:** Increase padding or use `min-height: 44px`

### Text Overflow
**Cause:** Long words or insufficient space
**Solution:** Use `text-overflow: ellipsis`, `word-break: break-word`, or truncate

### RTL Issues
**Cause:** Hardcoded left/right values
**Solution:** Use logical properties (`margin-inline-start` instead of `margin-left`)

## CI/CD Integration

Add to `.github/workflows/playwright.yml`:
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test mobile.spec.ts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Recommended Tools

### Browser DevTools
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Safari Web Inspector (requires iOS device)

### Online Tools
- BrowserStack (real device testing)
- LambdaTest (cross-browser testing)
- Responsinator (quick viewport check)
- MobileTest.me (online emulators)

### Performance Tools
- Lighthouse (Chrome DevTools)
- WebPageTest (detailed performance)
- GTmetrix (performance analysis)

## Best Practices

1. **Mobile-First Design:** Design for mobile first, then enhance for desktop
2. **Responsive Units:** Use `%`, `rem`, `vw`, `vh` instead of fixed `px`
3. **Touch-Friendly:** Ensure all interactive elements are at least 44x44px
4. **Test Early:** Test mobile responsiveness during development
5. **Automate:** Use Playwright for regression testing
6. **Real Devices:** Test on actual devices before production
7. **Performance:** Optimize images and minimize JavaScript
8. **Accessibility:** Ensure mobile screens are accessible

## Next Steps

1. Run the automated tests: `npx playwright test mobile.spec.ts`
2. Fix any failing tests
3. Test on real devices
4. Add tests for new features
5. Update visual snapshots after design changes
