# Asgard Photo - Test Suite

Comprehensive end-to-end testing for the Asgard Photo conference gallery using Playwright.

## Overview

This test suite ensures the photo gallery works correctly across devices, maintains accessibility standards, and provides a great user experience.

### Test Coverage

- **Gallery Tests** (`gallery.spec.ts`) - Event pages and photo display
- **Lightbox Tests** (`lightbox.spec.ts`) - Photo viewer functionality and keyboard navigation
- **Responsive Tests** (`responsive.spec.ts`) - Image optimization and responsive layouts
- **Accessibility Tests** (`accessibility.spec.ts`) - WCAG 2.1 AA compliance

## Getting Started

### Prerequisites

1. **Install browsers** (first time only):

   ```bash
   npx playwright install
   ```

2. **Ensure dev server can start**:
   ```bash
   npm run dev
   ```

### Running Tests

```bash
# Run all tests in headless mode
npm test

# Run tests with UI (recommended for development)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug a specific test
npm run test:debug

# View test report after running
npm run test:report
```

### Running Specific Tests

```bash
# Run only gallery tests
npx playwright test gallery

# Run only accessibility tests
npx playwright test accessibility

# Run a specific test file
npx playwright test tests/lightbox.spec.ts

# Run tests matching a pattern
npx playwright test --grep "keyboard"
```

## Test Architecture

### Configuration

Tests are configured in `playwright.config.ts` following best practices:

- **Auto-waiting**: No manual waits needed - Playwright waits for elements automatically
- **Parallel execution**: Tests run concurrently for speed
- **Multiple browsers**: Tests run on Chromium, Mobile Chrome, and Mobile Safari
- **Auto-retry**: Failed tests retry twice on CI
- **Dev server**: Automatically starts `npm run dev` before tests

### Best Practices Used

Following official Playwright documentation and 2025-2026 best practices:

1. **User-facing locators first**:
   - `getByRole()` for semantic elements
   - `getByText()` for visible text
   - `getByLabel()` for form elements
   - CSS selectors as last resort

2. **No manual waits**:
   - Playwright auto-waits for elements to be ready
   - No `setTimeout()` or `page.waitForTimeout()`

3. **Fresh context per test**:
   - Each test starts with clean browser state
   - No shared state between tests

4. **Meaningful test names**:
   - Tests describe user behavior
   - Easy to understand what failed

## Test Categories

### 1. Gallery Tests

Verifies core gallery functionality:

- ✓ Home page displays event cards
- ✓ Event pages load correctly
- ✓ All 52 photos display
- ✓ Event metadata shows correctly
- ✓ Navigation between pages works

### 2. Lightbox Tests

Tests the photo viewer:

- ✓ Opens when photo clicked
- ✓ Closes with Escape key or close button
- ✓ Arrow keys navigate photos
- ✓ Wraps around at start/end
- ✓ Focus returns to trigger element
- ✓ Displays correct photo for clicked image

### 3. Responsive Tests

Validates image optimization:

- ✓ Images lazy load (except first 8)
- ✓ WebP format used for modern browsers
- ✓ Proper width/height to prevent layout shift
- ✓ Grid adapts to mobile/tablet/desktop
- ✓ Async decoding for better performance

### 4. Accessibility Tests

Ensures WCAG 2.1 AA compliance:

#### Automated (using axe-core):

- ✓ No accessibility violations on any page
- ✓ Color contrast meets AA standards
- ✓ Semantic HTML structure

#### Keyboard Navigation:

- ✓ All interactive elements reachable via Tab
- ✓ Enter opens lightbox
- ✓ Escape closes lightbox
- ✓ Arrow keys navigate photos
- ✓ Focus trapped in lightbox when open
- ✓ Focus returns when lightbox closes

#### Semantic HTML:

- ✓ Proper heading hierarchy (single h1)
- ✓ All images have alt text
- ✓ Valid lang attribute
- ✓ Main landmark present
- ✓ ARIA labels on navigation

#### ARIA Attributes:

- ✓ Dialog has aria-label
- ✓ Counter has aria-live for announcements
- ✓ Buttons have descriptive labels

## Debugging Failed Tests

### View Test Report

```bash
npm run test:report
```

Opens an HTML report showing:

- Which tests passed/failed
- Screenshots of failures
- Step-by-step trace
- Network activity

### Debug Mode

```bash
npm run test:debug
```

Opens Playwright Inspector to:

- Step through tests line by line
- Inspect page at each step
- Record and play back tests

### Common Issues

**Tests timeout waiting for server**:

- Make sure dev server can start on port 4321
- Check `npm run dev` works independently

**Browser not installed**:

```bash
npx playwright install chromium
```

**Tests fail on focus management**:

- Ensure dev server is running in background
- Close other browser windows during test

## CI/CD Integration

Tests are ready for CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
```

The configuration automatically:

- Retries failed tests twice
- Uses GitHub reporter for CI
- Captures traces on failures
- Generates HTML report

## Adding New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code that runs before each test
    await page.goto('/');
  });

  test('descriptive test name', async ({ page }) => {
    // Test code
    await page.getByRole('button', { name: 'Click me' }).click();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Locator Priority

1. **getByRole()** - Best for semantic elements:

   ```typescript
   page.getByRole('button', { name: 'Submit' });
   page.getByRole('heading', { name: 'Title' });
   ```

2. **getByText()** - For visible text:

   ```typescript
   page.getByText('Welcome');
   ```

3. **getByLabel()** - For form fields:

   ```typescript
   page.getByLabel('Email address');
   ```

4. **CSS/data-testid** - Last resort:
   ```typescript
   page.locator('[data-testid="custom-element"]');
   ```

## Performance

Test execution time (on M1 MacBook):

- Full suite: ~45 seconds
- Single browser: ~15 seconds
- With UI mode: Interactive

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Astro Testing Guide](https://docs.astro.build/en/guides/testing/)
