/**
 * Test accounts for https://www.saucedemo.com.
 * These are the public demo accounts displayed on the site's login page.
 * They can be overridden through environment variables (see .env.example),
 * which is how real secrets would be injected on CI.
 */
const password = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const users = {
  standard: { username: process.env.SAUCE_USERNAME ?? 'standard_user', password },
  lockedOut: { username: 'locked_out_user', password },
  problem: { username: 'problem_user', password },
} as const;
