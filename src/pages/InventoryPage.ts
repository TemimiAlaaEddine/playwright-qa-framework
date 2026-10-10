import { type Locator, type Page } from '@playwright/test';
import { Header } from '../components/Header';
import { type ProductName } from '../data/products';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage {
  readonly page: Page;
  readonly header: Header;
  readonly title: Locator;
  readonly items: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async goto() {
    await this.page.goto('/inventory.html');
  }

  /** Narrows the product list down to the card containing `name`. */
  item(name: ProductName): Locator {
    return this.items.filter({ hasText: name });
  }

  async addToCart(...names: ProductName[]) {
    for (const name of names) {
      await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
    }
  }

  async removeFromCart(name: ProductName) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option);
  }

  async getNames(): Promise<string[]> {
    // allTextContents() does NOT auto-wait, so wait for the list to render first.
    await this.items.first().waitFor();
    return this.itemNames.allTextContents();
  }

  async getPrices(): Promise<number[]> {
    await this.items.first().waitFor();
    const texts = await this.itemPrices.allTextContents();
    return texts.map((text) => Number(text.replace('$', '')));
  }
}
