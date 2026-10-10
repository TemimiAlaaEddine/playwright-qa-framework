import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PostsApi } from '../api/PostsApi';

type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  postsApi: PostsApi;
};

/**
 * Custom `test` that injects page objects as fixtures.
 * Tests import { test, expect } from here instead of '@playwright/test',
 * then simply ask for what they need: async ({ inventoryPage }) => { ... }
 * Fixtures are lazy: a page object is only built if the test requests it.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  postsApi: async ({ request }, use) => {
    await use(new PostsApi(request));
  },
});

export { expect } from '@playwright/test';
