# Testing Guide

This guide covers the test strategy for the Cashly frontend.

## Stack

| Layer       | Tool                                       |
| ----------- | ------------------------------------------ |
| Unit tests  | Vitest 3 + `@analogjs/vite-plugin-angular` |
| Environment | jsdom                                      |
| E2E tests   | Playwright (`@playwright/test`)            |
| Coverage    | `@vitest/coverage-v8`                      |

## Configuration

### Vitest — `vitest.config.mts`

- `globals: true`, `environment: 'jsdom'`.
- Setup file: `src/test-setup.ts`.
- Includes `src/**/*.{test,spec}.{ts,tsx,js,jsx}`.
- Runs in forks (`maxForks: 2`, `minForks: 1`).
- Aliases match the application: `@app`, `@shared`, `@core`, `@env`, `@features`.

### Playwright — `playwright.config.ts`

- Test directory: `e2e/`.
- Base URL: `http://127.0.0.1:4300`.
- Starts `bun start -- --host 127.0.0.1 --port 4300`.
- Chromium only.
- HTML report in `output/playwright/report`.
- In CI: line reporter, 2 retries, 1 worker.

## Running tests

### Unit tests

```bash
bun run test:run       # once
bun run test:watch     # watch mode
bun run test:coverage  # coverage report
bun run e2e            # Playwright
bun run e2e:ui         # Playwright UI
bun run e2e:headed     # headed browser
```

Run a single file or filter:

```bash
bun run vitest --run src/app/features/sales/orders/models/enums/order-status.enum.spec.ts
bun run vitest --run --grep "OrderStatus"
```

### Docker

```bash
docker compose --profile test run --rm cashly-app-test
```

## Test placement

Tests live beside the code they exercise:

```
src/app/features/<area>/<feature>/
├── models/**/*.spec.ts
├── services/api/*.spec.ts
├── services/application/*.spec.ts
├── validators/*.spec.ts
├── pages/**/*.spec.ts
└── routing/*.spec.ts
```

Architecture-level tests live beside the router (`app.routes.spec.ts`) and in `src/app/features/platform/auth/tests/`.

## Writing a unit test

```typescript
import { describe, it, expect } from 'vitest';
import {
  OrderStatus,
  getOrderStatusLabel,
} from '@features/sales/orders/models/enums/order-status.enum';

describe('getOrderStatusLabel', () => {
  it('returns the Spanish label for a known status', () => {
    expect(getOrderStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmado');
  });

  it('returns the raw value for an unknown status', () => {
    expect(getOrderStatusLabel('UNKNOWN' as OrderStatus)).toBe('UNKNOWN');
  });
});
```

## Testing services

- Mock `HttpClient` with `provideHttpClientTesting()` / `HttpTestingController`.
- Assert the request URL, method, params, and payload.
- Use `flush` for success paths and `error` for failure paths.
- Application services hold Signals; assert both the emitted state and the rendered effect.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';

describe('InvoiceApiService', () => {
  let service: InvoiceApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvoiceApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the invoice list', () => {
    service.getAll({ search: 'INV' }).subscribe((items) => expect(items).toEqual([]));

    const req = http.expectOne((r) => r.url === '/api/invoices');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('INV');
    req.flush([]);
  });
});
```

## Testing components

Components are standalone. Provide dependencies explicitly and prefer testing through the DOM:

```typescript
const fixture = TestBed.createComponent(OrderListPageComponent);
await fixture.whenStable();
expect(fixture.nativeElement.textContent).toContain('Pedidos');
```

## E2E suites

`e2e/` contains Playwright suites for:

- Authentication and unauthenticated redirects
- Navigation and module access
- Customers
- Company configuration
- Preferences
- MFA
- Design consistency

The smoke suites run without backend credentials by asserting redirects and page shells.

## Coverage guidance

- Domain models, enums, mappers, and validators: high coverage expected.
- API services: every HTTP method and error branch.
- Application services: state transitions and error handling.
- Routing: lazy imports and guards (architecture tests).
- E2E: critical flows only; keep them deterministic.

## CI

The GitLab pipeline runs the Angular production build and the Vitest suite. Playwright is available locally and should be run before merging route or layout changes:

```bash
bun run test:run
bun run build
bun run e2e
```

---

[← Modules](modules/README.md) | [Back to Architecture](ARCHITECTURE.md)
