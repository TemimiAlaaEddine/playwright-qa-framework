import { type Locator, type Page } from '@playwright/test';
import { Header } from '../components/Header';

export class CartPage {
  readonly page: Page;
  readonly header: Header;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
