import { test, expect } from '@playwright/test';
import { TEST_EVENT_PHOTO_COUNT } from './fixtures';

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

    // Check hero heading using getByRole (user-facing locator)
    await expect(page.getByRole('heading', { name: 'Asgard Photography', level: 1 })).toBeVisible();

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
    await expect(breadcrumb.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/');

    // Check metadata is displayed (using getByText for visible content)
    await expect(page.getByText('London, UK')).toBeVisible();
    await expect(page.getByText(/52 photos/i)).toBeVisible();
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

  test('photo count badge displays on event card', async ({ page }) => {
    await page.goto('/');

    const eventCard = page.getByRole('article').first();

    // Look for photo count text (using getByText)
    await expect(eventCard.getByText(/\d+ photos?/i)).toBeVisible();
  });
});
