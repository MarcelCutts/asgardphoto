import { test, expect } from '@playwright/test';
import { getPhotoImage, TEST_EVENT_PHOTO_COUNT } from './fixtures';
import { RESPONSIVE_WIDTHS } from '../src/lib/images';

/**
 * Photo Gallery Tests
 * Testing the core functionality of the event photo gallery
 *
 * Locator Priority (per Playwright best practices):
 * 1. getByRole() - First choice (user-facing, accessibility-aligned)
 * 2. getByText(), getByLabel() - Other user-facing locators
 * 3. getByTestId() - Fallback for non-semantic elements
 */

test.describe('Event Gallery', () => {
  test('home page displays event cards', async ({ page }) => {
    await page.goto('/');

    // Check hero wordmark using getByRole (user-facing locator)
    await expect(page.getByRole('heading', { name: 'Asgard.photo', level: 1 })).toBeVisible();

    // Check event card is present (article is semantic)
    const eventCard = page.getByRole('article').first();
    await expect(eventCard).toBeVisible();

    // Verify event card has required elements (scoped role queries)
    await expect(eventCard.getByRole('heading')).toBeVisible();
    await expect(eventCard.getByRole('img')).toBeVisible();
  });

  test('React Native Conference 2024 event page displays correctly', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Check event title (using getByRole)
    await expect(page.getByRole('heading', { name: /React Native Photobooth/i })).toBeVisible();

    // Check breadcrumb navigation (using getByRole with accessible name)
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Index' })).toHaveAttribute('href', '/');

    // Check metadata is displayed (using getByText for visible content)
    await expect(page.getByText('London, UK')).toBeVisible();
    await expect(page.getByText(`${TEST_EVENT_PHOTO_COUNT} frames`)).toBeVisible();
  });

  test('event page displays all photos', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Wait for photos to load - using role query for buttons
    const photoButtons = page.getByRole('button', { name: /View photo/i });

    // Verify correct number of photos
    await expect(photoButtons).toHaveCount(TEST_EVENT_PHOTO_COUNT);

    // Check first photo has loaded
    const firstPhoto = photoButtons.first();
    await expect(firstPhoto).toBeVisible();

    // Verify image inside button has proper attributes
    const img = firstPhoto.locator('img');
    await expect(img).toHaveAttribute('alt', /.+/);
    await expect(img).toHaveAttribute('loading');
  });

  test('event card links to correct event page', async ({ page }) => {
    await page.goto('/');

    // Click on the event card (using semantic article and link)
    await page.getByRole('article').first().getByRole('link').click();

    // Should navigate to event page
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('frame count displays on event card', async ({ page }) => {
    await page.goto('/');

    const eventCard = page.getByRole('article').first();

    // Look for frame count text (using getByText)
    await expect(eventCard.getByText(/\d+ frames?/i)).toBeVisible();
  });
});

test.describe('Image variant selection', () => {
  // The browser should fetch the smallest srcset rendition that covers the
  // rendered slot (rendered CSS px × devicePixelRatio) — a stale `sizes`
  // attribute makes it download 2-4× the needed bytes.
  const expectedVariant = (widths: readonly number[], renderedPx: number, dpr: number) =>
    widths.find((w) => w >= renderedPx * dpr) ?? widths[widths.length - 1];

  test('desktop photo grid loads the smallest rendition that covers its columns', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/events/react-native-conf-2024');

    const img = getPhotoImage(page, 0);
    await expect(img).toBeVisible();

    const { rendered, dpr } = await img.evaluate((el) => ({
      rendered: el.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
    }));
    const expected = expectedVariant(RESPONSIVE_WIDTHS.grid, rendered, dpr);

    await expect
      .poll(async () => img.evaluate((el: HTMLImageElement) => el.currentSrc))
      .toContain(`width=${expected},`);
  });

  test('desktop index covers load the smallest rendition that covers their slot', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const cover = page.getByRole('article').first().getByRole('img');
    await expect(cover).toBeVisible();

    const { rendered, dpr } = await cover.evaluate((el) => ({
      rendered: el.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
    }));
    const expected = expectedVariant(RESPONSIVE_WIDTHS.cover, rendered, dpr);

    await expect
      .poll(async () => cover.evaluate((el: HTMLImageElement) => el.currentSrc))
      .toContain(`width=${expected},`);
  });
});
