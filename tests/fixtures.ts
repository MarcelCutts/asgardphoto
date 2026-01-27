import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Custom Playwright fixtures for Asgard Photo tests
 * Provides reusable test setup and page navigation helpers
 *
 * Locator Priority (per Playwright best practices):
 * 1. getByRole() - First choice (user-facing, accessibility-aligned)
 * 2. getByText(), getByLabel() - Other user-facing locators
 * 3. getByTestId() - Fallback for non-semantic elements
 * 4. CSS/data-attribute selectors - Only when semantics unavailable
 *
 * Usage:
 *   import { test, expect } from './fixtures';
 *   test('my test', async ({ eventPage }) => { ... });
 */

// Test event used across tests - has 52 photos
export const TEST_EVENT_SLUG = 'react-native-conf-2024';
export const TEST_EVENT_PHOTO_COUNT = 52;

export const test = base.extend({
  // No custom fixtures needed - tests use page.goto() directly
  // This extended test is kept for future fixture additions
});

export { expect };

/**
 * Helper to get a specific photo button by its original index.
 *
 * Why use data-index instead of getByRole?
 * - Masonry layout rearranges DOM order, so nth() selectors are unreliable
 * - Photo buttons have aria-labels, but we need to target by ORIGINAL index
 * - data-index provides stable selection regardless of layout changes
 */
export function getPhotoButton(page: Page, index: number) {
  return page.locator(`.photo-button[data-index="${index}"]`);
}

/**
 * Helper to get photo image by index (for attribute checks)
 */
export function getPhotoImage(page: Page, index: number) {
  return page.locator(`.photo-button[data-index="${index}"] img`);
}
