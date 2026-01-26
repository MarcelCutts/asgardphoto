import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 * Following WCAG 2.1 AA guidelines
 * Using axe-core for automated accessibility testing
 * Docs: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
 */

test.describe('Accessibility - Automated', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('event page has no accessibility violations', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('lightbox has no accessibility violations', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Open lightbox
    await page.locator('.photo-button').first().click();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('can navigate to all interactive elements with Tab key', async ({ page }) => {
    await page.goto('/');

    // Start from logo
    const logo = page.getByRole('link', { name: /Asgard Photo/i });
    await logo.focus();
    await expect(logo).toBeFocused();

    // Tab to first event card
    await page.keyboard.press('Tab');
    const firstEventLink = page.getByRole('article').first().getByRole('link');
    await expect(firstEventLink).toBeFocused();
  });

  test('can navigate photos with keyboard', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Tab to first photo
    const firstPhoto = page.locator('.photo-button').first();
    await firstPhoto.focus();
    await expect(firstPhoto).toBeFocused();

    // Press Enter to open
    await page.keyboard.press('Enter');

    // Lightbox should open
    await expect(page.locator('#lightbox')).toBeVisible();

    // Close button should be focused
    const closeButton = page.getByRole('button', { name: 'Close photo viewer' });
    await expect(closeButton).toBeFocused();
  });

  test('skip link works for keyboard users', async ({ page }) => {
    await page.goto('/');

    // Tab to skip link (it's the first focusable element)
    await page.keyboard.press('Tab');

    // Press Enter on skip link
    await page.keyboard.press('Enter');

    // Should jump to main content
    const main = page.locator('main');
    await expect(main).toBeInViewport();
  });

  test('can close lightbox with Escape key', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();
    await expect(page.locator('#lightbox')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toBeVisible();
  });

  test('lightbox buttons have proper keyboard navigation', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();

    // Close button should be focused initially
    const closeButton = page.getByRole('button', { name: 'Close photo viewer' });
    await expect(closeButton).toBeFocused();

    // Tab to next button
    await page.keyboard.press('Tab');
    const prevButton = page.getByRole('button', { name: 'Previous photo' });
    await expect(prevButton).toBeFocused();

    // Tab to prev button
    await page.keyboard.press('Tab');
    const nextButton = page.getByRole('button', { name: 'Next photo' });
    await expect(nextButton).toBeFocused();
  });
});

test.describe('Accessibility - Semantic HTML', () => {
  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have exactly one h1
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toHaveText('Asgard Photography');
  });

  test('event page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Should have exactly one h1
    const h1s = page.getByRole('heading', { level: 1 });
    await expect(h1s).toHaveCount(1);
    await expect(h1s).toContainText('React Native Photobooth');
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // All images should have alt attributes
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('page has valid lang attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('main landmark is present', async ({ page }) => {
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('navigation has proper ARIA labels', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Breadcrumb should have aria-label
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
  });
});

test.describe('Accessibility - ARIA Attributes', () => {
  test('lightbox dialog has proper ARIA attributes', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();

    const lightbox = page.locator('#lightbox');

    // Dialog should have aria-label
    await expect(lightbox).toHaveAttribute('aria-label', 'Photo viewer');
  });

  test('photo counter has aria-live for screen readers', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();

    const counter = page.locator('.lightbox-counter');

    // Counter should have aria-live so screen readers announce changes
    await expect(counter).toHaveAttribute('aria-live', 'polite');
  });

  test('lightbox buttons have descriptive aria-labels', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();

    // All control buttons should have aria-labels
    await expect(page.getByRole('button', { name: 'Close photo viewer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous photo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next photo' })).toBeVisible();
  });

  test('photo buttons have descriptive labels', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    const firstPhotoBtn = page.locator('.photo-button').first();

    // Should have aria-label describing the photo
    const ariaLabel = await firstPhotoBtn.getAttribute('aria-label');
    expect(ariaLabel).toContain('View photo');
    expect(ariaLabel).toContain('1 of 52');
  });
});

test.describe('Accessibility - Focus Management', () => {
  test('focus is trapped within lightbox when open', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    await page.locator('.photo-button').first().click();

    // Tab through all focusable elements in lightbox
    await page.keyboard.press('Tab'); // prev button
    await page.keyboard.press('Tab'); // next button
    await page.keyboard.press('Tab'); // should wrap back to close button

    const closeButton = page.getByRole('button', { name: 'Close photo viewer' });
    await expect(closeButton).toBeFocused();
  });

  test('focus returns to trigger element when lightbox closes', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    const photoButton = page.locator('.photo-button').nth(5);

    // Open lightbox from specific button
    await photoButton.click();
    await expect(page.locator('#lightbox')).toBeVisible();

    // Close lightbox
    await page.keyboard.press('Escape');

    // Focus should return to the button that opened it
    await expect(photoButton).toBeFocused();
  });

  test('focus outline is visible', async ({ page }) => {
    await page.goto('/');

    const logo = page.getByRole('link', { name: /Asgard Photo/i });
    await logo.focus();

    // Check that focused element has outline
    const outlineWidth = await logo.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('outline-width')
    );

    // Should have an outline when focused
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0);
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('text has sufficient contrast (checked by axe)', async ({ page }) => {
    await page.goto('/');

    // Axe will check color contrast for WCAG AA (4.5:1 ratio)
    const accessibilityScanResults = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter((violation) =>
      violation.id.includes('color-contrast')
    );

    expect(contrastViolations).toEqual([]);
  });
});
