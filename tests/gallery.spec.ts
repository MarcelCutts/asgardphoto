import { test, expect } from '@playwright/test';

/**
 * Photo Gallery Tests
 * Testing the core functionality of the event photo gallery
 * Following best practices: https://playwright.dev/docs/best-practices
 */

test.describe('Event Gallery', () => {
  test('home page displays event cards', async ({ page }) => {
    await page.goto('/');

    // Check hero heading using getByRole (user-facing locator)
    await expect(
      page.getByRole('heading', { name: 'Conference Photography', level: 1 })
    ).toBeVisible();

    // Check event card is present
    const eventCard = page.getByRole('article').first();
    await expect(eventCard).toBeVisible();

    // Verify event card has required elements
    await expect(eventCard.getByRole('heading')).toBeVisible();
    await expect(eventCard.getByRole('img')).toBeVisible();
  });

  test('React Native Conference 2024 event page displays correctly', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Check event title
    await expect(
      page.getByRole('heading', { name: /React Native Conference 2024/i })
    ).toBeVisible();

    // Check breadcrumb navigation
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/');

    // Check metadata is displayed
    await expect(page.getByText('London, UK')).toBeVisible();
    await expect(page.getByText(/52 photos/i)).toBeVisible();
  });

  test('event page displays all 52 photos', async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');

    // Wait for photos to load (Playwright auto-waits for elements)
    const photoButtons = page.locator('.photo-button');

    // Verify correct number of photos
    await expect(photoButtons).toHaveCount(52);

    // Check first photo has loaded
    const firstPhoto = photoButtons.first();
    await expect(firstPhoto).toBeVisible();

    // Verify image has proper attributes
    const img = firstPhoto.locator('img');
    await expect(img).toHaveAttribute('alt');
    await expect(img).toHaveAttribute('loading');
  });

  test('event card links to correct event page', async ({ page }) => {
    await page.goto('/');

    // Click on the event card
    await page.getByRole('article').first().getByRole('link').click();

    // Should navigate to event page
    await expect(page).toHaveURL(/\/events\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('photo count badge displays on event card', async ({ page }) => {
    await page.goto('/');

    const eventCard = page.getByRole('article').first();

    // Look for photo count text (using text locator)
    await expect(eventCard.getByText(/\d+ photos?/i)).toBeVisible();
  });
});
