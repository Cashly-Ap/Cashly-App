# Back-office E2E Implementation Checklist

This checklist turns [E2E_TEST_PROPOSAL.md](E2E_TEST_PROPOSAL.md) into implementation work. Check an item only after the test, fixture, and evidence have been verified in the target environment.

## Phase 0 — Contract and environment

- [ ] Confirm every back-office route in `src/app/app.routes.ts` and map it to a spec.
- [ ] Resolve the documented route gap for Collections, Payables, Merchants, and Notifications.
- [ ] Confirm API base URL, Docker ports, storage, and database reset procedure.
- [ ] Create isolated E2E database/tenant configuration.
- [ ] Add CI secrets for super administrator, administrator, sales operator, inventory operator, and restricted operator.
- [ ] Add run-specific data prefix and a cleanup endpoint/factory.
- [ ] Seed baseline category, price type, product, composite product, warehouse, supplier, customer, merchant, and payment method data.
- [ ] Seed invoices in pending, delivered, partially paid, paid, and cancelled states.
- [ ] Seed open/closed cash sessions and pending/approved/rejected payments.

## Phase 1 — Playwright foundation

- [ ] Add authenticated storage-state projects for each required role.
- [ ] Add API login and fixture helpers without hard-coded credentials.
- [ ] Add fixture factories for customer, supplier, product, warehouse, quote, order, invoice, payment, and cash session.
- [ ] Add teardown that removes run-scoped data in dependency order.
- [ ] Add navigation helpers for list, create, details, and edit routes.
- [ ] Add shared assertions for toast, loading, empty, error, status, pagination, and download behavior.
- [ ] Add request assertions for method, path, query, response status, and authorization.
- [ ] Add trace, screenshot, video, and request-summary output under `output/playwright/`.
- [ ] Add desktop and mobile Chromium projects.
- [ ] Add CI commands for smoke, module acceptance, and full workflow suites.

## Phase 2 — Authentication and administration

### Auth

- [ ] Successful login for each supported role.
- [ ] Invalid credentials and client-side required-field validation.
- [ ] Session persistence after reload.
- [ ] Access-token refresh and refresh failure.
- [ ] Logout and protected-route redirect.
- [ ] Account configuration page.
- [ ] Change username validation and success.
- [ ] Change password complexity, mismatch, wrong-current-password, and success.
- [ ] Commission-deduction preference where applicable.

### Users

- [ ] List, search, filters, sorting, pagination, and details.
- [ ] Create valid user and verify persisted role/permissions.
- [ ] Required-field, invalid-email, password, and duplicate-email validation.
- [ ] Edit user and module permissions.
- [ ] Change user password and email.
- [ ] Delete disposable user and reject protected super-admin deletion.
- [ ] Verify super-admin, admin, operator, and restricted route/API permissions.

## Phase 3 — Inventory and purchasing

### Dashboard

- [ ] Summary cards, monthly sales, top products/customers, recent activity.
- [ ] Low-stock indicator and refresh after stock mutation.
- [ ] Empty widget, delayed request, and failed widget recovery.

### Customers

- [ ] List, picker, filters, sorting, pagination, details, and balance.
- [ ] Create/edit legal and natural customers.
- [ ] Contacts, phones, addresses, billing address, RIF, and credit validation.
- [ ] Customer warehouse access management.
- [ ] Advance, refund, balance transactions, and invalid amount cases.
- [ ] Duplicate RIF/email, referenced delete, and unauthorized access.

### Suppliers

- [ ] List, filters, pagination, details, create, edit, and delete.
- [ ] Legal/natural supplier forms, contacts, and addresses.
- [ ] Duplicate RIF, invalid fields, referenced delete, and permission denial.

### Categories and price types

- [ ] List, search, active-state filter, sorting, pagination, details.
- [ ] Create/edit/toggle/delete with required, duplicate, length, and referenced-state cases.
- [ ] Verify price type selection and price calculation in dependent product/sales forms.

### Products

- [ ] List, search/filter/pagination, details, and active state.
- [ ] Create/edit simple product with SKU, barcode, unit, category, and prices.
- [ ] Create/edit composite product and composition quantities.
- [ ] Duplicate SKU/barcode, invalid price/quantity, circular composition, and referenced delete.
- [ ] Verify product visibility and price in quote, order, and invoice.

### Warehouses

- [ ] Warehouse CRUD, status, details, stock summary, and filters.
- [ ] Stock entry, exit, adjustment, transfer, and movement history.
- [ ] Insufficient stock, invalid quantity, same-warehouse transfer, inactive warehouse.
- [ ] Inventory PDF/Excel downloads and content validation.

### Purchases

- [ ] Create/edit purchase with supplier, warehouse, products, quantities, and costs.
- [ ] Required line validation and total calculation.
- [ ] Confirm reception and verify stock increase.
- [ ] Cancel with reason and reject duplicate/terminal transitions.
- [ ] Purchase detail, filters, and purchase report download.

## Phase 4 — Sales and financial documents

### Quotes

- [ ] List/filter/pagination, create/edit, details, totals, and PDF.
- [ ] Allocate customer/product lines and verify differential pricing.
- [ ] Cancel with reason and reject invalid/duplicate conversion.
- [ ] Convert quote to order and verify line snapshots.

### Orders

- [ ] List/filter/pagination, create/edit, details, totals, merchant association.
- [ ] Confirm, cancel with reason, convert to invoice, and PDF.
- [ ] Reject missing customer/lines, duplicate actions, invalid status, and unauthorized data.

### Invoices

- [ ] Direct create and order conversion.
- [ ] List/filter/pagination, details, due dates, credit days, and payment history.
- [ ] Confirm/deliver/cancel/duplicate according to state rules.
- [ ] Verify stock deduction, cancellation restoration, partial/full payment, and balance.
- [ ] Invoice PDF and report downloads.

### Payments and payment methods

- [ ] Payment-method CRUD, details, toggle, duplicate, and referenced deactivation.
- [ ] Payment list/filter/detail and localized method/status labels.
- [ ] Invalid amount/date/reference, overpayment, missing invoice, and unauthorized payment.

### Receivables

- [ ] Global summary, customer debt list/detail, invoice balances, and history.
- [ ] Full, partial, bulk, advance, and refund operations.
- [ ] Pending payment tab with customer, invoice, method, date, reference, and proof details.
- [ ] Approve/reject with required reason and verify duplicate decision rejection.
- [ ] Verify summary, invoice balance, cash, collection, and history refresh after approval.

### Cash register

- [ ] Open session, active session, one-open-session rule, and opening amount validation.
- [ ] Register every movement type and verify Spanish display labels.
- [ ] Session detail, history filters, expected balance, declared balance, and difference.
- [ ] Close matching/different amounts, notes, close-twice rejection.
- [ ] Session PDF, history export, and report downloads.

### Returns and notes

- [ ] Create return from delivered invoice with valid line quantities.
- [ ] Reject quantities above delivered, duplicate return, and invalid status.
- [ ] Verify stock reintegration and linked credit-note/balance effect.
- [ ] Credit-note list/create/detail/delete, reasons, amount limits, and applied-state rules.
- [ ] Debit-note list/create/detail/delete, reasons, amount limits, and applied-state rules.

### Reports and remaining modules

- [ ] Inventory catalog, stock, movements, and commercial catalog reports.
- [ ] Invoice, order, quote, purchase, receivable, payment-history, and collection reports.
- [ ] Validate date/status filters, empty report, authorization, MIME type, filename, and file size.
- [ ] Implement or explicitly defer Collections, Payables, Merchants, and Notifications after route ownership is decided.

## Phase 5 — Cross-module workflows

- [ ] Catalog → quote → order → invoice → partial payment → final payment.
- [ ] Supplier purchase → reception → stock movement/report.
- [ ] Delivered invoice → return → stock reintegration → credit note.
- [ ] Cash opening → payment/movement → reconciliation → close/report.
- [ ] Verify each workflow with an operator and with a restricted role where applicable.

## Phase 6 — Quality and release

- [ ] Add accessible names and keyboard coverage for all critical actions.
- [ ] Run critical flows at desktop and mobile viewports.
- [ ] Verify dialogs, focus return, loading states, and duplicate-submit protection.
- [ ] Remove fixed delays and replace them with state-based waits.
- [ ] Run smoke suite on every change.
- [ ] Run full module suite on protected branches.
- [ ] Run cross-module suite nightly/release.
- [ ] Publish traces, screenshots, videos, and API context on failure.
- [ ] Record flaky tests and reduce retries to zero for release criteria.
- [ ] Update this checklist and the proposal when routes or business rules change.

## Completion gate

- [ ] Every routed module has a linked Playwright spec.
- [ ] Every mutation has success, validation, authorization, and server-error coverage where applicable.
- [ ] Every state transition has an allowed and rejected case.
- [ ] Every created fixture is cleaned or isolated.
- [ ] Full suite passes in CI with no unexplained retries.
