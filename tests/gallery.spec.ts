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

    // The page is named by what it holds, not by a wordmark
    await expect(
      page.getByRole('heading', { name: 'Photographs from tech conferences and meetups', level: 1 })
    ).toBeVisible();

    // Check event card is present (article is semantic)
    const eventCard = page.getByRole('article').first();
    await expect(eventCard).toBeVisible();

    // Verify event card has required elements. Its photos are decorative
    // (alt=""): the link is named by the heading, so they have no img role.
    await expect(eventCard.getByRole('heading')).toBeVisible();
    await expect(eventCard.locator('img').first()).toBeVisible();
  });

  test('React Native Conference 2024 event page displays correctly', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Check event title (using getByRole)
    await expect(page.getByRole('heading', { name: /React Native Photobooth/i })).toBeVisible();

    // Check breadcrumb navigation (using getByRole with accessible name)
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'All events' })).toHaveAttribute('href', '/');

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

  test('home page opens on a photograph that links to its event', async ({ page }) => {
    await page.goto('/');

    const opening = page.getByRole('link', { name: /React Summit, Amsterdam, June 2023/ });
    await expect(opening.getByRole('img')).toBeVisible();
    await expect(opening).toHaveAttribute('href', '/events/react-summit-2023');
  });

  test('events are grouped under their year, newest first', async ({ page }) => {
    await page.goto('/');

    const years = await page.getByRole('heading', { level: 2, name: /^\d{4}$/ }).allTextContents();
    expect(years.length).toBeGreaterThan(1);
    expect(years).toEqual([...years].sort().reverse());
  });

  test('event page links on to the neighbouring events', async ({ page }) => {
    await page.goto('/events/react-summit-2023');

    const more = page.getByRole('navigation', { name: 'More events' });
    await expect(more.getByRole('link', { name: /Earlier/ })).toHaveAttribute(
      'href',
      '/events/jsnation-2023'
    );
    await expect(more.getByRole('link', { name: /Later/ })).toHaveAttribute(
      'href',
      '/events/react-advanced-2023'
    );
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
  // A stale `sizes` attribute makes the browser download 2-4× the bytes it
  // needs, or an image too small for its slot.
  const fetchedWidth = (src: string) => Number(src.match(/width=(\d+),/)?.[1]);

  test('desktop photo grid loads a rendition that fits its slot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/events/react-native-conf-2024');

    const img = getPhotoImage(page, 0);
    await expect(img).toBeVisible();

    const { rendered, dpr } = await img.evaluate((el) => ({
      rendered: el.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
    }));
    const needed = rendered * dpr;
    const smallest = RESPONSIVE_WIDTHS.grid[0];

    // A photo's exact width depends on how its row breaks, so `sizes` is an
    // estimate: allow a little under, and no more than double (or the
    // smallest rendition, when even that is more than double)
    await expect
      .poll(async () => fetchedWidth(await img.evaluate((el: HTMLImageElement) => el.currentSrc)))
      .toBeGreaterThanOrEqual(Math.min(needed * 0.85, RESPONSIVE_WIDTHS.grid.at(-1)!));
    expect(
      fetchedWidth(await img.evaluate((el: HTMLImageElement) => el.currentSrc))
    ).toBeLessThanOrEqual(Math.max(needed * 2, smallest));
  });

  test('desktop index strips load the smallest rendition that covers their slot', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Strip photos have a fixed height, so their width is known exactly
    const cover = page.getByRole('article').first().locator('img').first();
    await expect(cover).toBeVisible();

    const { rendered, dpr } = await cover.evaluate((el) => ({
      rendered: el.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
    }));
    const widths: readonly number[] = RESPONSIVE_WIDTHS.strip;
    const expected = widths.find((w) => w >= rendered * dpr) ?? widths[widths.length - 1];

    await expect
      .poll(async () => cover.evaluate((el: HTMLImageElement) => el.currentSrc))
      .toContain(`width=${expected},`);
  });
});
