# Playwright QA Framework

End-to-end UI and API test automation framework built with **Playwright** and **TypeScript**.

- **UI tests** on [Sauce Demo](https://www.saucedemo.com) (login, catalog, cart, checkout) across Chromium, Firefox and WebKit
- **API tests** on [JSONPlaceholder](https://jsonplaceholder.typicode.com) (CRUD on `/posts`)
- **Network mocking** with `page.route()` on the Playwright demo app

## Highlights

| Practice | Where |
|---|---|
| Page Object Model + reusable components | [`src/pages`](src/pages), [`src/components`](src/components) |
| Custom fixtures injecting page objects | [`src/fixtures/test.ts`](src/fixtures/test.ts) |
| Login once, reuse session (`storageState` + setup project) | [`tests/auth.setup.ts`](tests/auth.setup.ts) |
| User-facing locators (`getByRole`, `getByTestId`...) and web-first assertions | all specs |
| Data-driven tests | [`tests/ui/login.spec.ts`](tests/ui/login.spec.ts) |
| `test.step` for readable reports | [`tests/ui/checkout.spec.ts`](tests/ui/checkout.spec.ts) |
| API testing with the `request` fixture | [`tests/api`](tests/api) |
| Network interception and mocking | [`tests/ui/network-mocking.spec.ts`](tests/ui/network-mocking.spec.ts) |
| Tags (`@smoke`, `@e2e`) | run with `npm run test:smoke` |
| Environment config via `.env` | [`.env.example`](.env.example) |
| CI on GitHub Actions with HTML report artifact | [`.github/workflows`](.github/workflows/playwright.yml) |

## Project structure

```
├── .github/workflows/playwright.yml   # CI pipeline
├── playwright.config.ts               # projects, browsers, baseURL, reporters, traces
├── src/
│   ├── api/          # API clients
│   ├── components/   # UI pieces shared by several pages (header)
│   ├── data/         # test data: users, products, builders
│   ├── fixtures/     # custom `test` exposing page objects as fixtures
│   └── pages/        # Page Objects
└── tests/
    ├── auth.setup.ts # logs in once and saves the session
    ├── api/          # API specs
    └── ui/           # UI specs
```

## Getting started

Requires Node.js 20+.

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env   # optional
```

## Running tests

| Command | Description |
|---|---|
| `npm test` | all projects (setup, 3 browsers, API) |
| `npm run test:chromium` | UI tests on Chromium only |
| `npm run test:api` | API tests only |
| `npm run test:smoke` | tests tagged `@smoke` |
| `npm run test:headed` | watch the browser |
| `npm run ui` | interactive UI mode (time travel, watch mode) |
| `npm run test:debug` | step through with the Playwright Inspector |
| `npm run report` | open the last HTML report |
| `npm run codegen` | record actions and generate locators |
| `npm run typecheck` | TypeScript type checking |

On failure, screenshots and videos are kept; on CI, a trace is recorded on the first retry
(`npx playwright show-trace <trace.zip>`).
