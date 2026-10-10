import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { users } from '../src/data/users';
import { STORAGE_STATE } from '../src/data/paths';

/**
 * Runs once before the UI projects (see `dependencies` in playwright.config.ts).
 * Logs in through the UI and saves cookies + localStorage, so every UI test
 * starts already authenticated instead of repeating the login steps.
 */
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: STORAGE_STATE });
});
