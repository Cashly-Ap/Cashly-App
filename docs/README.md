# Cashly Documentation

Index of the frontend documentation. Start with the architecture and module index, then open the guide for the area you are working on.

## Core guides

| Document                                                 | What it covers                                            |
| -------------------------------------------------------- | --------------------------------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)                       | Project structure, feature organization, patterns, guards |
| [FRONTEND_INFRASTRUCTURE.md](FRONTEND_INFRASTRUCTURE.md) | Core and shared modules, components, services, tokens     |
| [API.md](API.md)                                         | Consolidated HTTP endpoint reference                      |
| [I18N.md](I18N.md)                                       | Languages, translation files, pipes, and coverage         |
| [GETTING_STARTED.md](GETTING_STARTED.md)                 | Local and Docker setup, scripts, project layout           |
| [ENVIRONMENT.md](ENVIRONMENT.md)                         | Environment files, proxy, Docker/runtime variables        |
| [DOCKER.md](DOCKER.md)                                   | Dockerfiles, Compose profiles, backend connectivity       |
| [DEPLOYMENT.md](DEPLOYMENT.md)                           | GitLab CI, Railway, rollback and runtime configuration    |
| [TESTING.md](TESTING.md)                                 | Vitest, Playwright, test placement and CI checks          |
| [CONTRIBUTING.md](CONTRIBUTING.md)                       | Conventions, workflow, commits, and merge requests        |
| [CHANGELOG.md](CHANGELOG.md)                             | Notable changes                                           |

## Modules

- [Module index](modules/README.md)
- [Module documentation template](modules/TEMPLATE.md)

### Platform

- [Auth](modules/auth.md)
- [Authorization](modules/authorization.md)
- [Users, Roles and Departments](modules/users.md)
- [Company](modules/company.md)
- [Notifications](modules/notifications.md)

### Analytics

- [Dashboard](modules/dashboard.md)
- [Reporting](modules/reports.md)

### Partners and catalog

- [Customers](modules/customers.md)
- [Suppliers](modules/suppliers.md)
- [Products](modules/products.md)
- [Categories](modules/categories.md)
- [Price Types](modules/price-types.md)

### Inventory and sales

- [Warehouses](modules/warehouses.md)
- [Quotes](modules/quotes.md)
- [Orders](modules/orders.md)
- [Purchases](modules/purchases.md)

### Finance

- [Invoices](modules/invoices.md)
- [Returns](modules/returns.md)
- [Credit Notes](modules/credit-notes.md)
- [Debit Notes](modules/debit-notes.md)
- [Cash Register](modules/cash-register.md)
- [Receivables](modules/receivables.md)
- [Payment Methods](modules/payment-methods.md)
- [Payments (reporting)](modules/payments.md)

## Architecture references

- [ERP business areas](architecture/ERP-BUSINESS-AREAS.md)
- [ERP area navigation](architecture/erp-area-navigation.md)
- [Business-area relocation manifest](architecture/erp-business-areas/README.md)
- [Navigation refactor plan](architecture/navigation-refactor-plan.md)

## Change records

- [Role permission editor](changes/role-permission-editor.md)
- [Effective role enforcement](changes/effective-role-enforcement.md)

## Project sources

- [Project overview](project/PROJECT_OVERVIEW.md)
- [E2E test proposal](project/E2E_TEST_PROPOSAL.md)
- [E2E test checklist](project/E2E_TEST_CHECKLIST.md)
