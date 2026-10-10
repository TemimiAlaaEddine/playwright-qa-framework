import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import { STORAGE_STATE } from './src/data/paths';

// Load local overrides (BASE_URL, credentials...) from .env if present.
// Node >= 20.12 can read .env natively, no dotenv dependency needed.
if (fs.existsSync('.env')) {
  process.loadEnvFile('.env');
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fail the CI build if a test.only was left in the code.
  forbidOnly: !!process.env.CI,
  // Retries only on CI: locally we want to see flakiness immediately.
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // Shared settings for every project below.
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // saucedemo exposes `data-test="..."` attributes: make getByTestId() use them.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. Logs in once and saves the session (cookies + localStorage) to a file.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // 2. UI tests, run on 3 browser engines, all starting already logged in.
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testDir: './tests/ui',
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: { ...devices['Desktop Safari'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
    },

    // 3. API tests: no browser is launched, only the `request` fixture is used.
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: process.env.API_URL ?? 'https://jsonplaceholder.typicode.com' },
    },
  ],
});
