import { test, expect } from '../../src/fixtures/test';
import { users } from '../../src/data/users';

// These tests exercise the login itself, so they must start logged OUT:
// override the storageState set for the project in playwright.config.ts.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in', { tag: '@smoke' }, async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('locked out user sees an error', async ({ page, loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  // Data-driven tests: one test is generated per row.
  const invalidCredentials = [
    { case: 'empty username', username: '', password: 'secret_sauce', error: 'Username is required' },
    { case: 'empty password', username: 'standard_user', password: '', error: 'Password is required' },
    { case: 'wrong password', username: 'standard_user', password: 'wrong', error: 'do not match any user' },
  ];

  for (const { case: name, username, password, error } of invalidCredentials) {
    test(`rejects login with ${name}`, async ({ loginPage }) => {
      await loginPage.login(username, password);

      await expect(loginPage.errorMessage).toContainText(error);
    });
  }

  test('user can log out', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.header.logout();

    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
