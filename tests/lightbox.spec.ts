import { test, expect } from '@playwright/test';

/**
 * Lightbox Functionality Tests
 * Testing the photo lightbox viewer with keyboard navigation
 * Following best practices for modal dialogs and keyboard interaction
 */

test.describe('Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events/react-native-conf-2024');
  });

  test('opens lightbox when photo is clicked', async ({ page }) => {
    // Click first photo
    await page.locator('.photo-button').first().click();

    // Lightbox should be visible (using dialog element)
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    // Lightbox image should be displayed
    await expect(lightbox.locator('#lightbox-image')).toBeVisible();

    // Counter should show current position
    await expect(lightbox.locator('.lightbox-counter')).toHaveText('1 / 52');
  });

  test('closes lightbox when close button is clicked', async ({ page }) => {
    // Open lightbox
    await page.locator('.photo-button').first().click();

    // Click close button (using aria-label for accessibility)
    await page.getByRole('button', { name: 'Close photo viewer' }).click();

    // Lightbox should be hidden
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).not.toBeVisible();
  });

  test('closes lightbox when Escape key is pressed', async ({ page }) => {
    // Open lightbox
    await page.locator('.photo-button').first().click();

    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Lightbox should close
    await expect(lightbox).not.toBeVisible();
  });

  test('navigates to next photo with arrow button', async ({ page }) => {
    // Open lightbox
    await page.locator('.photo-button').first().click();

    // Click next button
    await page.getByRole('button', { name: 'Next photo' }).click();

    // Counter should show second photo
    await expect(page.locator('.lightbox-counter')).toHaveText('2 / 52');
  });

  test('navigates to previous photo with arrow button', async ({ page }) => {
    // Open lightbox on second photo
    await page.locator('.photo-button').nth(1).click();

    // Click previous button
    await page.getByRole('button', { name: 'Previous photo' }).click();

    // Counter should show first photo
    await expect(page.locator('.lightbox-counter')).toHaveText('1 / 52');
  });

  test('navigates with keyboard arrow keys', async ({ page }) => {
    // Open lightbox
    await page.locator('.photo-button').first().click();

    // Press right arrow key
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.lightbox-counter')).toHaveText('2 / 52');

    // Press left arrow key
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.lightbox-counter')).toHaveText('1 / 52');
  });

  test('wraps around when navigating past last photo', async ({ page }) => {
    // Open lightbox on last photo
    await page.locator('.photo-button').nth(51).click();

    // Press next
    await page.getByRole('button', { name: 'Next photo' }).click();

    // Should wrap to first photo
    await expect(page.locator('.lightbox-counter')).toHaveText('1 / 52');
  });

  test('wraps around when navigating before first photo', async ({ page }) => {
    // Open lightbox on first photo
    await page.locator('.photo-button').first().click();

    // Press previous
    await page.getByRole('button', { name: 'Previous photo' }).click();

    // Should wrap to last photo
    await expect(page.locator('.lightbox-counter')).toHaveText('52 / 52');
  });

  test('restores focus to photo button when lightbox closes', async ({ page }) => {
    const photoButton = page.locator('.photo-button').first();

    // Open lightbox
    await photoButton.click();

    // Close with Escape
    await page.keyboard.press('Escape');

    // Focus should return to the button that opened the lightbox
    // This is important for accessibility
    await expect(photoButton).toBeFocused();
  });

  test('lightbox displays correct image for clicked photo', async ({ page }) => {
    // Click third photo
    await page.locator('.photo-button').nth(2).click();

    // Should show third photo in counter
    await expect(page.locator('.lightbox-counter')).toHaveText('3 / 52');

    // Image src should contain photo-3
    const lightboxImg = page.locator('#lightbox-image');
    await expect(lightboxImg).toHaveAttribute('src', /photo.*3/i);
  });
});
