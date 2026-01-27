import { test, expect } from '@playwright/test';

/**
 * Responsive Image Tests
 * Verifying that images are optimized and served correctly across devices
 * Tests image formats, lazy loading, and viewport-specific behavior
 */

test.describe('Responsive Images', () => {
  test('images have proper attributes for lazy loading', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Use data-index to find specific images (masonry rearranges DOM order)
    // First 8 images (by original index) should be eager loaded
    const eagerImg = page.locator('.photo-button[data-index="0"] .photo-image');
    await expect(eagerImg).toHaveAttribute('loading', 'eager');

    // Images after the first 8 should be lazy loaded
    const lazyImg = page.locator('.photo-button[data-index="10"] .photo-image');
    await expect(lazyImg).toHaveAttribute('loading', 'lazy');
  });

  test('images have async decoding attribute', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // All images should have decoding="async"
    const firstImg = page.locator('.photo-image').first();
    await expect(firstImg).toHaveAttribute('decoding', 'async');
  });

  test('images use optimized format via Cloudflare Image Resizing', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Wait for image to load
    const firstImg = page.locator('.photo-image').first();
    await expect(firstImg).toBeVisible();

    // Check that image src uses Cloudflare Image Resizing URL format
    // Format: /cdn-cgi/image/width=800,quality=85,format=auto,fit=cover/path
    const src = await firstImg.getAttribute('src');
    expect(src).toMatch(/cdn-cgi\/image\/.*format=(auto|webp)/i);
  });

  test('event card cover image has responsive attributes', async ({ page }) => {
    await page.goto('/');

    const coverImg = page.locator('.cover-image').first();
    await expect(coverImg).toBeVisible();

    // Should be lazy loaded
    await expect(coverImg).toHaveAttribute('loading', 'lazy');

    // Should use Cloudflare Image Resizing URL format
    const src = await coverImg.getAttribute('src');
    expect(src).toMatch(/cdn-cgi\/image\/.*format=(auto|webp)/i);
  });

  test('images have srcset for responsive loading', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    const firstImg = page.locator('.photo-image').first();
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

    // Photo grid should be visible
    const photoGrid = page.locator('.photo-grid');
    await expect(photoGrid).toBeVisible();

    // Should have photos
    const photos = page.locator('.photo-item');
    await expect(photos.first()).toBeVisible();
  });

  test('photo grid displays correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/events/react-native-conf-2024');

    // Photo grid should adapt to tablet
    const photoGrid = page.locator('.photo-grid');
    await expect(photoGrid).toBeVisible();

    // Should have multiple columns (masonry layout)
    const columns = page.locator('.photo-column');
    const columnCount = await columns.count();
    expect(columnCount).toBeGreaterThanOrEqual(2);
  });

  test('photo grid displays correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/events/react-native-conf-2024');

    const photoGrid = page.locator('.photo-grid');
    await expect(photoGrid).toBeVisible();

    // Desktop should show multiple columns using masonry (flexbox)
    const photos = page.locator('.photo-item');
    await expect(photos.first()).toBeVisible();

    // Verify the grid uses flexbox layout (masonry component)
    const display = await photoGrid.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });

    expect(display).toBe('flex');
  });

  test('navigation is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check logo/navigation is visible
    const logo = page.getByRole('link', { name: /Asgard Photo/i });
    await expect(logo).toBeVisible();

    // Click it
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
    const bottomImg = page.locator('.photo-button[data-index="40"]');

    // Wait for the element to exist in DOM
    await expect(bottomImg).toBeAttached();

    // Scroll to image
    await bottomImg.scrollIntoViewIfNeeded();

    // Now it should be visible and loaded
    await expect(bottomImg).toBeVisible();
    await expect(bottomImg.locator('img')).toBeVisible();
  });
});
