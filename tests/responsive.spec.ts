import { test, expect } from '@playwright/test';
import { getPhotoButton, getPhotoImage } from './fixtures';

/**
 * Responsive Image Tests
 * Verifying that images are optimized and served correctly across devices
 * Tests image formats, lazy loading, and viewport-specific behavior
 *
 * Locator Priority (per Playwright best practices):
 * 1. getByRole() - First choice
 * 2. getByText(), getByLabel() - User-facing locators
 * 3. data-index selectors - For specific photo targeting (masonry reorders DOM)
 */

test.describe('Responsive Images', () => {
  test('images have proper attributes for lazy loading', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Use data-index to find specific images (masonry rearranges DOM order)
    // First 8 images (by original index) should be eager loaded
    const eagerImg = getPhotoImage(page, 0);
    await expect(eagerImg).toHaveAttribute('loading', 'eager');

    // Images after the first 8 should be lazy loaded
    const lazyImg = getPhotoImage(page, 10);
    await expect(lazyImg).toHaveAttribute('loading', 'lazy');
  });

  test('images have async decoding attribute', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // All images should have decoding="async"
    const firstImg = getPhotoImage(page, 0);
    await expect(firstImg).toHaveAttribute('decoding', 'async');
  });

  test('images use optimized format via Cloudflare Image Resizing', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Wait for image to be visible
    const firstImg = getPhotoImage(page, 0);
    await expect(firstImg).toBeVisible();

    // Check that image src uses Cloudflare Image Resizing URL format
    // Format: /cdn-cgi/image/width=800,quality=85,format=auto,fit=cover/path
    const src = await firstImg.getAttribute('src');
    expect(src).toMatch(/cdn-cgi\/image\/.*format=(auto|webp)/i);
  });

  test('event card cover image has responsive attributes', async ({ page }) => {
    await page.goto('/');

    // Using getByRole for semantic image query within article
    const eventCard = page.getByRole('article').first();
    const coverImg = eventCard.getByRole('img');
    await expect(coverImg).toBeVisible();

    // Should be lazy loaded
    await expect(coverImg).toHaveAttribute('loading', 'lazy');

    // Should use Cloudflare Image Resizing URL format
    const src = await coverImg.getAttribute('src');
    expect(src).toMatch(/cdn-cgi\/image\/.*format=(auto|webp)/i);
  });

  test('images have srcset for responsive loading', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    const firstImg = getPhotoImage(page, 0);
    const srcset = await firstImg.getAttribute('srcset');

    // srcset should contain multiple widths
    expect(srcset).toContain('400w');
    expect(srcset).toContain('800w');
  });
});

test.describe('Responsive Layout', () => {
  test('photo grid displays correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/events/react-native-conf-2024');

    // Photo grid should be visible (using role-based locator)
    const photoGrid = page.getByRole('list', { name: /Photos from/i });
    await expect(photoGrid).toBeVisible();

    // Photos should be visible - test behavior, not implementation
    const firstPhoto = getPhotoButton(page, 0);
    await expect(firstPhoto).toBeVisible();
  });

  test('photo grid displays correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/events/react-native-conf-2024');

    // Photo grid should be visible
    const photoGrid = page.getByRole('list', { name: /Photos from/i });
    await expect(photoGrid).toBeVisible();

    // Multiple photos should be visible (behavior test, not implementation)
    const photos = page.getByRole('button', { name: /View photo/i });
    await expect(photos.first()).toBeVisible();

    // At tablet width, should show multiple columns - verify multiple photos visible
    await expect(photos.nth(0)).toBeVisible();
    await expect(photos.nth(1)).toBeVisible();
  });

  test('photo grid displays correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/events/react-native-conf-2024');

    const photoGrid = page.getByRole('list', { name: /Photos from/i });
    await expect(photoGrid).toBeVisible();

    // Photos should be visible
    const firstPhoto = getPhotoButton(page, 0);
    await expect(firstPhoto).toBeVisible();

    // On desktop, multiple photos should be visible at once (behavior test)
    const photos = page.getByRole('button', { name: /View photo/i });
    await expect(photos.nth(0)).toBeVisible();
    await expect(photos.nth(1)).toBeVisible();
    await expect(photos.nth(2)).toBeVisible();
  });

  test('navigation is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check logo/navigation is visible (using getByRole)
    const logo = page.getByRole('link', { name: /Asgard Photo/i });
    await expect(logo).toBeVisible();

    // Click it and verify navigation works
    await logo.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Image Performance', () => {
  test('masonry grid prevents layout shift by hiding until initialized', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Masonry component adds 'initialized' class after layout is ready
    // Content is hidden (visibility: hidden) until then
    const masonryContainer = page.locator('[data-masonry-container]');
    await expect(masonryContainer).toHaveClass(/initialized/);
  });

  test('lazy loaded images only load when scrolled into view', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Get an image far down the page using data-index (masonry rearranges DOM)
    const bottomPhoto = getPhotoButton(page, 40);

    // Wait for the element to exist in DOM
    await expect(bottomPhoto).toBeAttached();

    // Scroll to image
    await bottomPhoto.scrollIntoViewIfNeeded();

    // Now it should be visible and loaded
    await expect(bottomPhoto).toBeVisible();
    await expect(bottomPhoto.locator('img')).toBeVisible();
  });
});
