# ERP business areas

The Angular feature tree mirrors the backend business ownership. This directory records the source regrouping, which originally preserved public browser URLs. The subsequent [ERP area navigation change](../erp-area-navigation.md) groups browser URLs and visible menus by area, retaining legacy redirects. HTTP API URLs, permission identifiers and lazy loading retain their contracts.

| Area             | Features                                              |
| ---------------- | ----------------------------------------------------- |
| sales            | quotes, orders                                        |
| procurement      | purchases                                             |
| catalog          | products, categories, price-types                     |
| inventory        | warehouses                                            |
| finance/billing  | invoices, returns, credit-notes, debit-notes          |
| finance/treasury | payments, cash-register, receivables, payment-methods |
| partners         | customers, suppliers                                  |
| analytics        | dashboard, reporting route composition                |
| platform         | auth (including user administration), notifications   |

Each feature retains its pages, components, services/api, services/application, models, validators and messages where present. All feature routing lives under `routing/`. Models retain cohesive interface and enum files; no empty folders or duplicated contracts were introduced. Tests remain beside their corresponding production files.

Reporting belongs to its feature. Product catalogs live under catalog/products/reporting; stock and movement reports live under inventory/warehouses/reporting. Payment/history reports, receivables/collections reports and cash register reports have separate treasury owners. The shared PDF viewer is a reusable presentation component, without business rules. analytics/reporting/routing only composes the existing `/reports/inventory` route.

The former FinancePdfApiService was split into PaymentPdfApiService and ReceivablesPdfApiService, preserving all four methods, existing endpoint paths and all 16 HTTP contract tests. Cash register report filters belong to cash-register/reporting. No cross-owner finance reporting facade remains.

`relocation-manifest.json` inventories every original source file with its original SHA-256, final location and final SHA-256. Removed cross-owner/empty barrel files are explicitly recorded. `split-manifest.json` documents one-to-many service, test and model changes. The existing full Vitest suite and production build remain the behavioral verification; architecture tests additionally exercise lazy route imports and guard contracts.
