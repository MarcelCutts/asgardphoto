import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Asgard Photo
 * Following best practices from https://playwright.dev/docs/test-configuration
 * and https://playwright.dev/docs/best-practices
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: process.env.CI ? 'github' : 'html',

  // Explicit timeouts (better than relying on defaults)
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000, // 5s for assertions
  },

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:4321',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Disable animations for deterministic tests
    // This triggers prefers-reduced-motion media query, preventing
    // flaky tests caused by animation timing differences across browsers
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    // Mobile Safari requires WebKit with ICU 74, but Ubuntu 25.10 has ICU 76
    // This causes ABI incompatibility: undefined symbol ureldatefmt_format_74
    // See: https://github.com/microsoft/playwright/issues/36364
    // Uncomment when using Ubuntu 24.04 LTS or containerized environment:
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
