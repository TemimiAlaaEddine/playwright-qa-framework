/** Product names as displayed in the saucedemo catalog. */
export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;

export type ProductName = (typeof products)[keyof typeof products];

/** Builds unique checkout data so tests never depend on each other. */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    firstName: 'Ada',
    lastName: `Lovelace-${Date.now()}`,
    postalCode: 'H2X 1Y4',
    ...overrides,
  };
}

export type Customer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};
