# Back-office End-to-End Testing Proposal by Module

This proposal defines the Playwright end-to-end testing program for Cashly. It converts the existing module test-plan drafts into one executable coverage model, verifies complete operational workflows against the real API, and identifies the data, route, and authorization prerequisites required to test every implemented function reliably.

## Outcome

The target state is a repeatable browser test suite that can prove:

1. Every routed module can load, display API data, validate user input, and handle API failures.
2. Every write operation can be completed and verified from the UI without leaving orphaned test data.
3. Every business state transition is tested from its allowed starting state and rejected from invalid states.
4. Role and customer ownership rules are enforced in both navigation and API responses.
5. The main business chains work across modules: catalog → quote → order → invoice → payment → collection, and supplier purchase → stock.

The current smoke tests cover only unauthenticated login-page rendering and protected-route redirects. They are the foundation, not the complete module suite.

## Scope and test layers

| Layer | Purpose | Environment | Blocking criteria |
| --- | --- | --- | --- |
| Smoke | Confirm the back-office frontend starts, public routes render, and guards redirect unauthenticated users. | Angular dev server; API may be unavailable. | Any startup, routing, or login-shell failure. |
| Module acceptance | Exercise each page, form, filter, action, validation rule, and error state. | Seeded API and isolated test database. | Any core module function is unavailable or unverifiable. |
| Workflow | Prove state transitions across two or more modules. | Seeded API with controlled fixtures. | A downstream module cannot consume an upstream result. |
| Authorization | Verify role permissions, route guards, and 401/403 handling. | Dedicated users with restricted permissions. | UI/API authorization differs from the declared policy. |
| Resilience | Verify loading, empty, delayed, failed, expired-token, and duplicate-submit behavior. | API fault injection or deterministic route interception. | Unhandled error, stuck spinner, duplicate mutation, or data loss. |
| Presentation | Verify responsive layouts, accessible names, keyboard interactions, dialogs, downloads, and localized status labels. | Chromium at desktop and mobile viewports. | A critical action is inaccessible or unreadable. |

The live acceptance suite must use the real API for business behavior. Playwright route interception may be used only for deterministic error, latency, and browser-only cases; it must not replace the integration path for create, update, approve, cancel, confirm, payment, or stock workflows.

## Test environment and data contract

### Required services

- Cashly API on `http://localhost:8080` with MySQL, Flyway schema, storage, and deterministic test seed.
- Back-office app on `http://localhost:4200`.
- A disposable database or resettable tenant for every test run.
- Playwright Chromium installed in the CI image.

### Test identities

Credentials must come from CI secrets or a local untracked environment file; they must not be copied into test source files.

| Identity | Required access | Primary use |
| --- | --- | --- |
| Super administrator | All back-office modules | Full CRUD, administration, and workflow setup. |
| Administrator | Configured operational modules, without super-admin-only actions | Permission boundaries and operational workflows. |
| Sales operator | Sales and permitted inventory actions | Quote, order, invoice, and stock authorization. |
| Inventory operator | Inventory and purchasing actions | Warehouse, product, and purchase workflows. |
| Restricted operator | Deliberately incomplete permission set | Negative route and API authorization cases. |

### Fixture rules

- Create records with a run-specific prefix and timestamp, for example `E2E-<runId>-Customer`.
- Prefer API fixture factories for setup and cleanup; use the UI for the behavior under test.
- Capture created IDs and clean up in reverse dependency order.
- Never use production-like permanent credentials or mutate shared seed records for a test that can run in parallel.
- Preserve one immutable baseline fixture for read-only assertions and generate disposable fixtures for mutations.
- Assert response status and persisted state, not only toast messages or table text.

## Back-office module coverage

Each module below must have at least one route smoke test, one successful workflow, validation/error coverage, authorization coverage, and a persisted-state assertion. The listed cases are the minimum acceptance set; each module's existing draft under `e2e/modules/` can be split into individual Playwright specs from this matrix.

| Module and route | Functional coverage | Negative and authorization coverage | Priority |
| --- | --- | --- | --- |
| Authentication `/`, `/auth/*` | Login, logout, refresh, session reload, account configuration, change username, change password, commission-deduction preference. | Empty/invalid credentials, weak or mismatched passwords, expired access token, refresh failure, protected-route redirect, role landing route. | Critical |
| Users `/users/*` | List, search/filter/sort/pagination, details, create, edit, delete, password, email, and module-permission changes. | Duplicate email, invalid fields, protected super-admin deletion, operator/admin route restrictions, API 403. | Critical |
| Dashboard `/dashboard` | Summary cards, monthly sales, top products/customers, recent activity, low-stock indicator, loading and refresh. | Empty metrics, one failed widget request, unauthorized dashboard access, stale data after a mutation. | High |
| Customers `/customers/*` | List and picker, CRUD, contacts, phones, addresses, billing address, credit days/limit, warehouse access, customer balance, advance, refund, transaction history. | Duplicate RIF/email, invalid RIF and credit values, deleting referenced customer, negative/over-limit balance operation. | Critical |
| Suppliers `/suppliers/*` | List/filter/sort/pagination, natural/legal supplier forms, contacts/addresses, details, edit, delete. | Duplicate RIF, invalid required fields, deleting supplier with purchases, permission denial, API error recovery. | High |
| Categories `/categories/*` | List/search/status filter/pagination, create, details, edit, activate/deactivate, delete. | Duplicate name, length/required validation, deleting category with products, inactive-state display, permission denial. | High |
| Price types `/price-types/*` | List/filter/pagination, create, edit, details, activate/deactivate, use in customer/product pricing. | Duplicate name/code, invalid percentage or priority, deactivation while referenced, unauthorized mutation. | High |
| Products `/products/*` | Product list/filter/pagination, simple product CRUD, composite product composition, SKU/barcode, unit, category, price, active state, details, stock view. | Duplicate SKU/barcode, invalid price/quantity, incomplete composition, circular/self composition, delete referenced product, stock/permission denial. | Critical |
| Warehouses `/warehouses/*` | Warehouse CRUD, active state, details, stock summary, stock entry, stock exit, transfer, adjustment, movement history, PDF/Excel reports. | Duplicate code, insufficient stock, invalid quantity, same-source transfer, inactive warehouse, unauthorized inventory operation. | Critical |
| Purchases `/purchases/*` | Create/edit purchase, supplier/product/warehouse selection, line totals, details, confirm reception, cancel with reason, stock increase, purchase report. | Empty lines, invalid prices/quantities, confirm twice, cancel confirmed purchase, supplier/warehouse errors, failed stock update. | Critical |
| Quotes `/quotes/*` | List/filter/pagination, create/edit, customer and line selection, totals, details, allocate, cancel, convert to order, PDF. | Empty lines, invalid discounts, expired/cancelled quote actions, duplicate conversion, permission denial. | Critical |
| Orders `/orders/*` | List/filter/pagination, create/edit, details, line validation, merchant association, confirm/cancel, convert to invoice, PDF. | Invalid transitions, duplicate confirmation/conversion, missing customer or lines, unauthorized merchant/order access, API conflict. | Critical |
| Invoices `/invoices/*` | List/filter/pagination, direct create, order conversion, edit where allowed, details, confirm/deliver, cancel, duplicate, due date/credit days, payment history, PDF. | Stock insufficiency, invalid transition, cancel after payment/delivery, duplicate invoice, overpayment, unauthorized customer/order data. | Critical |
| Payment methods `/payment-methods/*` | List, create, edit, details, toggle active state, use in payment forms. | Duplicate name/code, invalid method, deactivation while referenced, unavailable method in dependent forms. | High |
| Payments `/payments/*` | Payment list/filter, details, status labels, invoice/customer/method/reference/date display, payment history. | Missing invoice, invalid amount/date/reference, failed proof or detail request, unauthorized payment visibility. | High |
| Receivables `/receivables` | Global summary, customer debt list, customer detail, invoice balances, full/partial/bulk payment, advance/refund, pending payment tab, approve/reject with reason, history, summary refresh after validation. | Overpayment, invalid allocation, missing reason, duplicate approval/rejection, already-processed payment, failed refresh, role denial. | Critical |
| Cash register `/cash-register/*` | Open session, active session, cash movements, movement labels, history filters, detail, close with matching/different amount, PDF/Excel/report downloads. | Second open session, negative amount, close without declaration, close twice, unauthorized movement, invalid movement type, export failure. | Critical |
| Credit notes `/credit-notes/*` | List/filter, create against invoice/return or adjustment, reason, lines/amounts, details, delete where allowed, balance effect. | Amount over invoice, invalid reason/lines, duplicate application, delete applied note, unauthorized access. | High |
| Debit notes `/debit-notes/*` | List/filter, create against invoice, reason, amount/lines, details, delete where allowed, balance effect. | Invalid/over-limit amount, duplicate application, delete applied note, missing invoice, authorization failure. | High |
| Returns `/returns/*` | Create return from invoice, select lines/quantities/reason, details, persisted status, stock reintegration, credit-note relationship. | Quantity above delivered quantity, return duplicate, invalid status transition, already-paid/invalid invoice, failed stock restoration. | Critical |
| Reports `/reports/*` | Inventory catalog/stock/movements, invoice/order/quote/purchase reports, finance receivables/payment history/collections, date/status filters, PDF and Excel downloads. | Invalid date range, empty report, unauthorized report, non-200 download, correct content type and non-empty file. | High |

### Modules requiring route or contract confirmation

The documentation lists Collections, Payables, Merchants, and Notifications, but the current `cashly-app/src/app/app.routes.ts` does not expose routes for those feature folders. The proposal treats them as API/contract verification first and UI E2E only after one of these conditions is met:

- a frontend route and page are added;
- the existing functionality is intentionally owned by another screen and documented as such; or
- the module is explicitly removed from the frontend scope.

Their acceptance targets are:

| Module | Required verification before UI E2E |
| --- | --- |
| Collections | Payment with merchant creates immutable commission record; merchant summary and date filters are visible in an owning UI. |
| Payables | Merchant commission settlement, list/detail/status/filter, and idempotent settlement behavior have a routed UI. |
| Merchants | CRUD, commission percentage, profile, and merchant-scoped order visibility have a routed UI. |
| Notifications | Role-routed list, unread/read state, navigation target, and empty/error state have a routed UI. |

## Cross-module business journeys

These journeys are the release gates because isolated module tests can pass while the business process remains broken.

### Sales-to-cash journey

1. Create or select customer, price type, product, and warehouse.
2. Create a quote and verify calculated prices/differentials.
3. Convert the quote to an order and verify line snapshots.
4. Convert/confirm the order into an invoice and verify stock deduction.
5. Register a partial payment and verify invoice balance, receivable summary, and cash movement.
6. Register the final payment and verify `PAID` state and collection creation when a merchant is attached.
7. Verify the invoice, payment, customer balance, cash movement, and receivables summary in the back-office.

### Purchasing-to-stock journey

1. Create supplier and purchase with product, warehouse, quantities, and cost.
2. Confirm reception and verify stock increase and purchase status.
3. Verify stock movement history and inventory report.
4. Attempt duplicate confirmation or cancellation and verify rejection.

### Return-to-credit journey

1. Select a delivered invoice and create a return for valid quantities.
2. Verify stock reintegration and return status.
3. Create or verify the linked credit note and customer balance effect.
4. Attempt a second return beyond delivered quantity and verify validation.

### Cash-register reconciliation journey

1. Open one session with an opening amount.
2. Receive a cash payment and register an income/expense movement.
3. Verify expected balance and movement labels in the session detail and history.
4. Close with matching amount and with a difference in separate fixtures.
5. Verify close status, difference, audit data, and report download.

## Shared assertions for every module

Each spec must include the applicable assertions below rather than stopping at a visible page:

- route and page title are correct;
- loading indicator appears and disappears;
- API request uses the expected method, path, query, and authorization;
- success response updates the view and persisted data;
- validation prevents invalid submission before the API call;
- 400/401/403/404/409/422/500 responses produce a usable message and recoverable UI;
- cancel/back actions do not create or mutate data;
- refresh/reload preserves or intentionally clears state;
- pagination, filters, sorting, and empty states are correct;
- dialogs close only after the intended action and prevent duplicate submission;
- status labels and monetary values are localized consistently;
- accessible names, keyboard activation, focus return, and mobile layout work for critical actions;
- downloads have the expected filename, MIME type, and non-zero size.

## Playwright implementation plan

### Project layout

```text
e2e/
├── fixtures/
│   ├── auth.fixture.ts
│   ├── data.fixture.ts
│   └── api.fixture.ts
├── helpers/
│   ├── navigation.ts
│   ├── assertions.ts
│   └── cleanup.ts
├── back-office/
│   ├── auth.spec.ts
│   ├── inventory.spec.ts
│   ├── sales.spec.ts
│   ├── finance.spec.ts
│   ├── purchasing.spec.ts
│   └── administration.spec.ts
└── workflows/
    ├── sales-to-cash.spec.ts
    ├── purchasing-to-stock.spec.ts
    ├── return-to-credit.spec.ts
    └── cash-reconciliation.spec.ts
```

### Fixtures and isolation

- Add Playwright projects for `super-admin`, `operator`, and restricted-user storage states.
- Generate storage state through API login, not through UI login in every test.
- Keep one UI login test per identity to verify the login experience itself.
- Expose API fixture factories for customers, products, warehouses, invoices, payments, and sessions.
- Add a teardown fixture that deletes or expires all records with the current run prefix.
- Serialize only tests that intentionally share a state transition; keep module tests parallelizable.

### Selectors and evidence

- Prefer accessible roles, labels, and visible business text.
- Add `data-testid` only to repeated table actions, ambiguous icon buttons, download controls, and state-transition controls that cannot be selected accessibly.
- Capture trace, screenshot, and video on failure; retain the API request/response summary for workflow failures.
- Use `output/playwright/` for reports and make all generated artifacts ignored by Git.

## Phased delivery

| Phase | Deliverable | Exit criteria |
| --- | --- | --- |
| 0. Contract and data readiness | Route/API inventory, stable seed, identities, cleanup strategy, selector agreement. | No undocumented route or required fixture remains unresolved. |
| 1. Foundation | Fixtures, storage states, API helpers, error interception, CI project matrix. | Smoke suite and one authenticated module pass in both frontends. |
| 2. Critical operations | Auth, users, customers, catalog, warehouses, purchases, quotes, orders, invoices. | All critical happy paths and invalid transitions pass. |
| 3. Finance | Payments, receivables, cash register, credit/debit notes, returns, reports. | Sales-to-cash, pending payment validation, return-to-credit, and reconciliation pass. |
| 5. Hardening | Resilience, accessibility, responsive, downloads, cross-browser smoke, and flaky-test cleanup. | No unexplained retries; failures have traceable evidence. |

## Definition of done

- Every routed module has a Playwright spec linked to this proposal.
- Every write operation has a success, validation, conflict, and authorization case where applicable.
- Every state machine has an allowed transition and a rejected transition test.
- Every cross-module workflow verifies persisted effects in the downstream module.
- Test data is isolated, repeatable, and cleaned after the run.
- CI runs smoke tests on every change and the full acceptance suite on protected branches.
- Failures publish traces, screenshots, videos, and request context.
- The route/module inventory is updated whenever a module is added, removed, or moved between frontends.

## Open decisions before implementation

1. Confirm whether Collections, Payables, Merchants, and Notifications require new back-office routes or are intentionally API-only.
2. Provide non-production test identities through CI secrets.
3. Choose database reset strategy: disposable schema per run, transaction rollback, or API cleanup factory.
4. Confirm whether PDF/Excel content must be byte-validated, text-validated, or only checked for successful download and MIME type.
5. Confirm the supported CI browser matrix beyond Chromium.
