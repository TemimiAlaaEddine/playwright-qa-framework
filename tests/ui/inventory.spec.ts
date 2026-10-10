import { test, expect } from '../../src/fixtures/test';
import { products } from '../../src/data/products';

// The session comes from the `setup` project: no login step needed here.
test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('displays the 6 products', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  test('sorts products by price, low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('sorts products by name, Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    const names = await inventoryPage.getNames();
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  test('cart badge reflects added and removed products', async ({ inventoryPage }) => {
    const { cartBadge } = inventoryPage.header;
    await expect(cartBadge).toBeHidden();

    await inventoryPage.addToCart(products.backpack, products.bikeLight);
    await expect(cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(products.backpack);
    await expect(cartBadge).toHaveText('1');
  });
});
