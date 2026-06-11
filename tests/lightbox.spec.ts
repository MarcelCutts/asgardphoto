import {
  test,
  expect,
  frameCounter,
  getPhotoButton,
  TEST_EVENT_PHOTO_COUNT,
  TEST_EVENT_SLUG,
} from './fixtures';

/**
 * Lightbox Functionality Tests
 * Testing the photo lightbox viewer with keyboard navigation
 * Following best practices for modal dialogs and keyboard interaction
 *
 * Note: Masonry layout rearranges DOM order, so we use data-index selectors
 * to target specific photos by their original index. See fixtures.ts for details.
 */

test.describe('Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/events/${TEST_EVENT_SLUG}`);
  });

  test('opens lightbox when photo is clicked', async ({ page }) => {
    // Click first photo (by data-index, not DOM order)
    await getPhotoButton(page, 0).click();

    // Lightbox should be visible (using dialog element)
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    // Lightbox image should be displayed
    await expect(lightbox.locator('#lightbox-image')).toBeVisible();

    // Counter should show current position (using data-testid for non-semantic element)
    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(1, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('closes lightbox when close button is clicked', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    // Click close button (using getByRole - first choice per best practices)
    await page.getByRole('button', { name: 'Close photo viewer' }).click();

    await expect(page.locator('#lightbox')).not.toBeVisible();
  });

  test('closes lightbox when Escape key is pressed', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(lightbox).not.toBeVisible();
  });

  test('navigates to next photo with arrow button', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    // Using getByRole for button with accessible name
    await page.getByRole('button', { name: 'Next photo' }).click();

    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(2, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('navigates to previous photo with arrow button', async ({ page }) => {
    await getPhotoButton(page, 1).click();

    await page.getByRole('button', { name: 'Previous photo' }).click();

    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(1, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('navigates with keyboard arrow keys', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(2, TEST_EVENT_PHOTO_COUNT)
    );

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(1, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('wraps around when navigating past last photo', async ({ page }) => {
    await getPhotoButton(page, TEST_EVENT_PHOTO_COUNT - 1).click();

    await page.getByRole('button', { name: 'Next photo' }).click();

    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(1, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('wraps around when navigating before first photo', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    await page.getByRole('button', { name: 'Previous photo' }).click();

    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(TEST_EVENT_PHOTO_COUNT, TEST_EVENT_PHOTO_COUNT)
    );
  });

  test('restores focus to photo button when lightbox closes', async ({ page }) => {
    const photoButton = getPhotoButton(page, 0);

    await photoButton.click();
    await page.keyboard.press('Escape');

    // Focus should return to the button that opened the lightbox (accessibility)
    await expect(photoButton).toBeFocused();
  });

  test('lightbox displays correct image for clicked photo', async ({ page }) => {
    await getPhotoButton(page, 2).click();

    await expect(page.getByTestId('lightbox-counter')).toHaveText(
      frameCounter(3, TEST_EVENT_PHOTO_COUNT)
    );

    // Image src should contain photo-3
    const lightboxImg = page.locator('#lightbox-image');
    await expect(lightboxImg).toHaveAttribute('src', /photo.*3/i);
  });

  test('lightbox has spinner element for loading states', async ({ page }) => {
    await getPhotoButton(page, 0).click();
    // Using data-testid for non-semantic spinner element
    await expect(page.getByTestId('loading-spinner')).toBeAttached();
  });

  test('lightbox clears image when closed', async ({ page }) => {
    await getPhotoButton(page, 0).click();
    const lightboxImg = page.locator('#lightbox-image');

    // Wait for image to load
    await expect(lightboxImg).toHaveAttribute('src', /.+/);

    await page.keyboard.press('Escape');

    // Image src should be cleared to avoid stale content on next open
    await expect(lightboxImg).not.toHaveAttribute('src');
  });

  test('closes when the backdrop beside the photo is clicked', async ({ page }) => {
    await getPhotoButton(page, 0).click();

    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toBeVisible();

    // Dark area top-left: clear of the image (centered), the close button
    // (top-right), and the prev arrow (vertically centered at the left edge)
    await page.mouse.click(40, 100);

    await expect(lightbox).not.toBeVisible();
  });

  test('clears image when dismissed natively (back gesture / CloseWatcher)', async ({ page }) => {
    await getPhotoButton(page, 0).click();
    const lightboxImg = page.locator('#lightbox-image');
    await expect(lightboxImg).toHaveAttribute('src', /.+/);

    // dialog.close() without a keydown is what Android's back gesture does;
    // teardown must not depend on the Escape handler
    await page.evaluate(() => {
      (document.getElementById('lightbox') as HTMLDialogElement).close();
    });

    await expect(page.locator('#lightbox')).not.toBeVisible();
    await expect(lightboxImg).not.toHaveAttribute('src');
  });

  test('keeps the page from scrolling behind the open lightbox', async ({ page }) => {
    await getPhotoButton(page, 0).click();
    await expect(page.locator('#lightbox')).toBeVisible();

    const before = await page.evaluate(() => window.scrollY);

    // Wheel over the non-scrollable dialog: without a scroll lock this
    // chains to the document and the page drifts behind the overlay
    await page.mouse.move(200, 300);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(250);

    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });
});
