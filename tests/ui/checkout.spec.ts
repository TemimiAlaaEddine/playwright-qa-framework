import { test, expect } from '../../src/fixtures/test';
import { CheckoutPage } from '../../src/pages/CheckoutPage';
import { buildCustomer, products } from '../../src/data/products';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('user can buy two products end to end', { tag: ['@smoke', '@e2e'] }, async ({
    page,
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await test.step('add products to the cart', async () => {
      await inventoryPage.addToCart(products.backpack, products.boltTShirt);
      await inventoryPage.header.openCart();
      await expect(cartPage.itemNames).toHaveText([products.backpack, products.boltTShirt]);
    });

    await test.step('fill customer information', async () => {
      await cartPage.checkout();
      await checkoutPage.fillInformation(buildCustomer());
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('verify the order totals', async () => {
      const prices = (await checkoutPage.itemPrices.allTextContents()).map(CheckoutPage.parseAmount);
      const expectedSubtotal = prices.reduce((sum, price) => sum + price, 0);

      const subtotal = CheckoutPage.parseAmount(await checkoutPage.subtotalLabel.innerText());
      const tax = CheckoutPage.parseAmount(await checkoutPage.taxLabel.innerText());
      const total = CheckoutPage.parseAmount(await checkoutPage.totalLabel.innerText());

      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await test.step('complete the order', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(inventoryPage.header.cartBadge).toBeHidden();
    });
  });

  test('first name is required', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(products.onesie);
    await cartPage.goto();
    await cartPage.checkout();

    await checkoutPage.fillInformation(buildCustomer({ firstName: '' }));

    await expect(checkoutPage.errorMessage).toHaveText('Error: First Name is required');
  });
});
