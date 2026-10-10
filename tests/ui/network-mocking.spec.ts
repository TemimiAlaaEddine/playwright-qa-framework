import { test, expect } from '@playwright/test';

/**
 * Network interception with page.route(), on Playwright's own demo app which
 * loads its fruit list from GET /api/v1/fruits.
 */
const DEMO_URL = 'https://demo.playwright.dev/api-mocking';
const FRUITS_API = '*/**/api/v1/fruits';

// Different site: the saucedemo session is irrelevant here.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Network mocking', () => {
  test('replaces the API response with mock data', async ({ page }) => {
    await page.route(FRUITS_API, async (route) => {
      await route.fulfill({ json: [{ name: 'Mocked Mango', id: 1 }] });
    });

    await page.goto(DEMO_URL);

    await expect(page.getByText('Mocked Mango')).toBeVisible();
    await expect(page.getByText('Strawberry')).toBeHidden();
  });

  test('patches the real API response', async ({ page }) => {
    await page.route(FRUITS_API, async (route) => {
      const response = await route.fetch(); // let the real request go through
      const fruits = await response.json();
      fruits.push({ name: 'Injected Kiwi', id: 999 });
      await route.fulfill({ response, json: fruits });
    });

    await page.goto(DEMO_URL);

    await expect(page.getByText('Injected Kiwi')).toBeVisible();
    await expect(page.getByText('Strawberry')).toBeVisible(); // real data still there
  });

  test('waits for the API call and inspects it', async ({ page }) => {
    // Start listening BEFORE the action that triggers the request.
    const responsePromise = page.waitForResponse('**/api/v1/fruits');
    await page.goto(DEMO_URL);
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });
});
