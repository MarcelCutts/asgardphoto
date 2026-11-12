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

    // Check the page heading using getByRole (user-facing locator)
    await expect(
      page.getByRole('heading', { name: /JavaScript conference circuit/, level: 1 })
    ).toBeVisible();

    // Check event card is present (article is semantic)
    const eventCard = page.getByRole('article').first();
    await expect(eventCard).toBeVisible();

    // Verify event card has required elements (scoped role queries)
    await expect(eventCard.getByRole('heading')).toBeVisible();
    await expect(eventCard.getByRole('img', { name: /Cover photo from/ })).toBeVisible();
  });

  test('React Native Conference 2024 event page displays correctly', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Check event title (using getByRole)
    await expect(page.getByRole('heading', { name: /React Native Photobooth/i })).toBeVisible();

    // Check breadcrumb navigation (using getByRole with accessible name)
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'All events' })).toHaveAttribute(
      'href',
      '/#events'
    );

    // Check metadata is displayed (using getByText for visible content)
    await expect(page.getByText('London, UK')).toBeVisible();
    await expect(page.getByText(`${TEST_EVENT_PHOTO_COUNT} photos`)).toBeVisible();
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

  test('photo count displays on event card', async ({ page }) => {
    await page.goto('/');

    const eventCard = page.getByRole('article').first();

    // Look for photo count text (using getByText)
    await expect(eventCard.getByText(/\d+ photos?/i)).toBeVisible();
  });

  test('home page opens on selected photographs that link to their frame', async ({ page }) => {
    await page.goto('/');

    const wall = page.getByRole('list', { name: 'Selected photographs' });
    await expect(wall).toBeVisible();

    const firstSelect = wall.getByRole('link').first();
    await expect(firstSelect).toHaveAttribute('href', /^\/events\/[^/]+\/#photo-\d+$/);
  });

  test('events are grouped by year, newest first', async ({ page }) => {
    await page.goto('/');

    const years = page.getByRole('heading', { level: 3, name: /^\d{4}$/ });
    const labels = await years.allTextContents();
    const numbers = labels.map((label) => parseInt(label, 10));
    expect(numbers.length).toBeGreaterThan(1);
    expect(numbers).toEqual([...numbers].sort((a, b) => b - a));
  });

  test('event page links to the neighbouring events', async ({ page }) => {
    await page.goto('/events/react-advanced-meetup-may-2023');

    const more = page.getByRole('navigation', { name: 'More events' });
    await expect(more.getByRole('link', { name: /Older/ })).toBeVisible();
    await expect(more.getByRole('link', { name: /Newer/ })).toBeVisible();
  });

  test('masthead persists across client-side navigation', async ({ page }) => {
    await page.goto('/');

    // Tag the live node: transition:persist must carry it through the
    // ClientRouter swap (so its entrance animation doesn't replay per nav)
    await page
      .locator('header.masthead')
      .evaluate((el) => el.setAttribute('data-persist-probe', '1'));

    await page.getByRole('article').first().getByRole('link').click();
    await expect(page).toHaveURL(/\/events\/.+/);

    await expect(page.locator('header.masthead')).toHaveAttribute('data-persist-probe', '1');
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

    const cover = page
      .getByRole('article')
      .first()
      .getByRole('img', { name: /Cover photo from/ });
    // The index sits below the selects wall and its covers are lazy, so
    // bring it into view (Firefox only loads lazy images near the viewport)
    await cover.scrollIntoViewIfNeeded();
    await expect(cover).toBeVisible();

    const { rendered, dpr } = await cover.evaluate((el) => ({
      rendered: el.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
    }));
    const expected = expectedVariant(RESPONSIVE_WIDTHS.grid, rendered, dpr);

    await expect
      .poll(async () => cover.evaluate((el: HTMLImageElement) => el.currentSrc))
      .toContain(`width=${expected},`);
  });
});
