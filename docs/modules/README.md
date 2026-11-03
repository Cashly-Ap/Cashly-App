# Cashly Frontend Modules

This directory documents the frontend features of the Cashly application. Features are grouped by business area under `src/app/features/<area>/<feature>/`.

---

## Module Index

| Area        | Module          | Routes                                | Source                                         | Documentation                              |
| ----------- | --------------- | ------------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| Platform    | Auth            | `/platform/auth/*`                    | `features/platform/auth`                       | [auth.md](./auth.md)                       |
| Platform    | Users           | `/platform/users/*`                   | `features/platform/auth/user`                  | [users.md](./users.md)                     |
| Platform    | Roles           | `/platform/roles/*`                   | `features/platform/auth/role`                  | [users.md](./users.md)                     |
| Platform    | Departments     | `/platform/departments/*`             | `features/platform/auth/department`            | [users.md](./users.md)                     |
| Platform    | Company         | `/platform/company`                   | `features/platform/company`                    | —                                          |
| Platform    | Notifications   | Shell (notification bell)             | `features/platform/notifications`              | [notifications.md](./notifications.md)     |
| Analytics   | Dashboard       | `/analytics/dashboard`                | `features/analytics/dashboard`                 | [dashboard.md](./dashboard.md)             |
| Analytics   | Reports         | Dialogs from the main menu            | `features/*/*/reporting`                       | [reports.md](./reports.md)                 |
| Partners    | Customers       | `/partners/customers/*`               | `features/partners/customers`                  | [customers.md](./customers.md)             |
| Partners    | Suppliers       | `/partners/suppliers/*`               | `features/partners/suppliers`                  | [suppliers.md](./suppliers.md)             |
| Catalog     | Products        | `/catalog/products/*`                 | `features/catalog/products`                    | [products.md](./products.md)               |
| Catalog     | Categories      | `/catalog/categories/*`               | `features/catalog/categories`                  | [categories.md](./categories.md)           |
| Catalog     | Price Types     | `/catalog/price-types/*`              | `features/catalog/price-types`                 | [price-types.md](./price-types.md)         |
| Inventory   | Warehouses      | `/inventory/warehouses/*`             | `features/inventory/warehouses`                | [warehouses.md](./warehouses.md)           |
| Sales       | Quotes          | `/sales/quotes/*`                     | `features/sales/quotes`                        | [quotes.md](./quotes.md)                   |
| Sales       | Orders          | `/sales/orders/*`                     | `features/sales/orders`                        | [orders.md](./orders.md)                   |
| Procurement | Purchases       | `/procurement/purchases/*`            | `features/procurement/purchases`               | [purchases.md](./purchases.md)             |
| Finance     | Invoices        | `/finance/billing/invoices/*`         | `features/finance/billing/invoices`            | [invoices.md](./invoices.md)               |
| Finance     | Returns         | `/finance/billing/returns/*`          | `features/finance/billing/returns`             | [returns.md](./returns.md)                 |
| Finance     | Credit Notes    | `/finance/billing/credit-notes/*`     | `features/finance/billing/credit-notes`        | [credit-notes.md](./credit-notes.md)       |
| Finance     | Debit Notes     | `/finance/billing/debit-notes/*`      | `features/finance/billing/debit-notes`         | [debit-notes.md](./debit-notes.md)         |
| Finance     | Cash Register   | `/finance/treasury/cash-register/*`   | `features/finance/treasury/cash-register`      | [cash-register.md](./cash-register.md)     |
| Finance     | Receivables     | `/finance/treasury/receivables`       | `features/finance/treasury/receivables`        | [receivables.md](./receivables.md)         |
| Finance     | Payment Methods | `/finance/treasury/payment-methods/*` | `features/finance/treasury/payment-methods`    | [payment-methods.md](./payment-methods.md) |
| Finance     | Payment Reports | Dialogs from the main menu            | `features/finance/treasury/payments/reporting` | [payments.md](./payments.md)               |

All entries are implemented. The old `/customers`, `/products`, `/orders`, `/invoices`, `/warehouses`, `/dashboard`, and related URLs redirect to their area-prefixed equivalents through `legacyRoute` entries in `src/app/app.routes.ts`.

---

## Business Areas

| Area               | Features                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| `analytics`        | dashboard, reporting composition                                            |
| `catalog`          | products, categories, price-types                                           |
| `finance/billing`  | invoices, returns, credit-notes, debit-notes                                |
| `finance/treasury` | cash-register, payment-methods, receivables, payment reporting              |
| `inventory`        | warehouses                                                                  |
| `partners`         | customers, suppliers                                                        |
| `platform`         | auth (login, user, role, department, authorization), company, notifications |
| `procurement`      | purchases                                                                   |
| `sales`            | quotes, orders                                                              |

HTTP API URLs, permission identifiers, and lazy-loading contracts are independent of the folder layout. See [ERP business areas](../architecture/ERP-BUSINESS-AREAS.md) for the regrouping record.

---

## Module Types

### CRUD Modules

Standard modules with Create, Read, Update, Delete operations. They follow the full module structure with:

- **List Page**: Table view with filtering, sorting, and pagination
- **Form Page**: Create/Edit forms with validation
- **Details Page**: Read-only view with complete entity data
- **Services**: API (infrastructure) + Application (business logic) + Mappers where needed
- **Validators**: Custom form validators

**Examples**: Customers, Suppliers, Products, Warehouses

### Display-only Modules

Modules that only display data without modification capabilities. Typically used for dashboards, reporting, and notifications.

**Examples**: Dashboard, Notifications, Payment Reports

### Special Modules

Modules with specialized workflows that do not fit the standard CRUD pattern. They may have unique operations such as payment registration, stock confirmation, or document conversion.

**Examples**: Receivables (debt management + payment registration), Purchases (draft → confirmation), Quotes (allocation → conversion)

### Platform Modules

Authentication, authorization, and administration features.

**Examples**: Auth, Users, Roles, Departments, Company

---

## Standard Feature Structure

Each feature keeps its own presentation, contracts, and services:

```
src/app/features/<area>/<feature>/
├── actions/                  # Row/toolbar action definitions
├── components/               # Feature presentation, dialogs, form sections
├── i18n/                     # Feature translations (en.json, es.json)
├── messages/                 # Toast and error message contracts
├── models/                   # Interfaces, types, and enums
├── navigation/               # Menu and navigation contributions
├── pages/                    # Route components (list, form, details, extra pages)
├── permissions/              # Permission constants
├── reporting/                # PDF report components and services (where applicable)
├── routing/                  # Lazy-loaded route definitions
├── services/
│   ├── api/                  # HTTP services (infrastructure layer)
│   ├── application/          # Business logic services (application layer)
│   └── mappers/              # Data transformation
├── validators/               # Custom form validators
└── index.ts                  # Public API exports where present
```

---

## Documentation Schema

Each module documentation includes:

1. **Overview** - Purpose and module type
2. **Module Structure** - Folder organization
3. **Features** - Main functionality list
4. **Pages** - Routes and page descriptions
5. **Data Models** - All interfaces and enums
6. **API Endpoints** - Complete API documentation with interface mapping
7. **Validation Rules** - Field validation table
8. **Form Structure** - Tab organization (if applicable)
9. **Service Architecture** - API + Application services
10. **Business Rules** - Important logic and constraints
11. **Routes Configuration** - Angular route definitions
12. **Testing Requirements** - Test coverage checklist
13. **Related Modules** - Dependencies and relationships
14. **Notes** - Important considerations and patterns

---

## Creating New Modules

When creating a new module:

1. Place it under the owning business area: `src/app/features/<area>/<feature>/`
2. Follow the standard feature structure above.
3. Register the lazy route in `src/app/app.routes.ts` under the area path.
4. Add the permission constants and, when applicable, declare the `BusinessModule`.
5. Copy [TEMPLATE.md](./TEMPLATE.md) to `[module-name].md` and fill in the sections from the real implementation.
6. Add the module to the index table in this file.

---

## Related Documentation

- [Architecture](../ARCHITECTURE.md) - Overall application architecture
- [ERP business areas](../architecture/ERP-BUSINESS-AREAS.md) - Area-to-feature map
- [ERP area navigation](../architecture/erp-area-navigation.md) - Navigation regrouping
- [Getting Started](../GETTING_STARTED.md) - Development setup guide
- [Testing](../TESTING.md) - Testing guidelines
- [Environment](../ENVIRONMENT.md) - Environment configuration

---

**Last Updated**: 2026-11-03
