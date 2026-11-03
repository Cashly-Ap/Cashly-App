# Authorization Module

## Overview

Authorization controls what an authenticated user can see and do. It lives under `platform/auth/authorization` and is shared by every feature. The backend is the source of truth; the frontend mirrors grants for route guards, directives, and menu/action visibility.

**Module Type**: `Platform` (cross-cutting capability, no routes)

---

## Module Structure

```
src/app/features/platform/auth/authorization/
├── directives/               # appPermission directive
├── models/                   # Access models, legacy mapping, URL→module context
└── services/                 # AuthorizationService and AccessManagementService
```

---

## Permission Model

Permissions are flat `MODULE_ACTION` codes.

```typescript
export type PermissionAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'EXECUTE'
  | 'CONFIRM'
  | 'CANCEL'
  | 'DUPLICATE'
  | 'DETAILS'
  | 'BALANCE'
  | 'HISTORY'
  | 'OPEN'
  | 'CLOSE'
  | 'REPORT'
  | 'PARTIAL_PAYMENT'
  | 'REFUND'
  | 'ADVANCE'
  | 'CUSTOMER_BALANCE'
  | 'REPORT_QUOTES'
  | 'REPORT_ORDERS'
  | 'REPORT_PURCHASES'
  | 'REPORT_PRODUCTS'
  | 'REPORT_COMMERCIAL_CATALOG'
  | 'REPORT_STOCK'
  | 'REPORT_MOVEMENTS'
  | 'REPORT_INVOICES'
  | 'REPORT_CASH_REGISTER'
  | 'REPORT_RECEIVABLES'
  | 'CASH_HISTORY'
  | 'INVOICE_DUPLICATE'
  | 'STOCK'
  | 'MOVEMENT_HISTORY'
  | 'RECORD_ENTRY'
  | 'RECORD_EXIT'
  | 'PAY_WITH_VALIDATION'
  | 'PAY_DIRECT'
  | 'PAY_ALL'
  | 'PAY_PARTIAL'
  | 'APPROVE_PAYMENT'
  | 'REJECT_PAYMENT';

export interface CurrentAccess {
  roleId: string;
  roleName: string;
  departmentId: string;
  systemAdministrator: boolean;
  permissions: AppPermission[];
}
```

`BusinessModule` identifies the owner (for example `CATALOG_PRODUCTS`, `FINANCE_INVOICES`). The code is built as `<MODULE>_<ACTION>`.

---

## Services

### `AuthorizationService`

```typescript
can(permission: AppPermission): boolean;
can(module: BusinessModule, action?: PermissionAction): boolean;
```

- With `(module, action)`, checks the exact grant.
- With a module only, checks `READ`.
- With a permission code, checks that code directly.

### `AccessManagementService`

Loads and saves roles and departments used by the user/role/department screens:

| Method                  | Endpoint                                              |
| ----------------------- | ----------------------------------------------------- |
| `roles(action?)`        | `GET /api/roles`                                      |
| `roleOptions()`         | `GET /api/roles/options`                              |
| `saveRole(value)`       | `POST /api/roles` or `PUT /api/roles/:id`             |
| `departments(action?)`  | `GET /api/departments`                                |
| `departmentOptions()`   | `GET /api/departments/options`                        |
| `saveDepartment(value)` | `POST /api/departments` or `PUT /api/departments/:id` |
| `delete(kind, id)`      | `DELETE /api/roles/:id` or `/api/departments/:id`     |

The permission catalog comes from `GET /api/permissions/catalog`. Current grants come exclusively from `GET /api/auth/access` as `permissions: string[]`.

---

## Permission Directive

```html
<button
  type="button"
  appPermission="UPDATE"
  [appRequiredPermissions]="['INVENTORY_WAREHOUSES:EXECUTE']"
  (click)="save()"
>
  Guardar
</button>
```

- `appPermission` is the action to check.
- `appPermissionModule` overrides the owner; otherwise the directive resolves it from the current URL with `moduleForUrl`.
- `appRequiredPermissions` adds cross-owner grants (for example stock execution on a sales document).
- Denied elements are hidden (`display: none`, `aria-hidden="true"`), and `click`, `keydown`, and `submit` events are cancelled before the handler runs.
- Self-service pages under `/platform/auth` do not require a business module grant.
- The directive recalculates when navigation reuses the same component (it listens to `NavigationEnd`).

---

## Route Guards

| Guard                   | Behavior                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authGuard`             | Redirects unauthenticated users to `/platform/auth/login`.                                                                                                                  |
| `modulePermissionGuard` | Resolves the owner from route `data.module`; checks `data.permission` or derives `READ`/`CREATE`/`UPDATE` from the path; enforces `data.requiredPermissions`; fails closed. |
| `adminGuard`            | Requires authentication and `isSuperAdmin()`.                                                                                                                               |
| `homeRedirectGuard`     | Loads access and redirects to the first accessible destination for the current area.                                                                                        |

`modulePermissionGuard` also rechecks ancestor route modules, so a child owned by another area requires `READ` on each ancestor owner. Denied routes redirect to `/platform/auth/configuration`; access-load failures redirect to login.

---

## URL → Module Mapping

`moduleForUrl` maps the current URL prefix to a `BusinessModule`:

| URL prefix                          | Module                    |
| ----------------------------------- | ------------------------- |
| `/platform/users`                   | `USERS`                   |
| `/platform/roles`                   | `ROLES`                   |
| `/platform/departments`             | `DEPARTMENTS`             |
| `/catalog/products`                 | `CATALOG_PRODUCTS`        |
| `/catalog/categories`               | `CATALOG_CATEGORIES`      |
| `/catalog/price-types`              | `CATALOG_PRICES`          |
| `/inventory/warehouses`             | `INVENTORY_WAREHOUSES`    |
| `/sales/quotes`                     | `SALES_QUOTES`            |
| `/sales/orders`                     | `SALES_ORDERS`            |
| `/partners/customers`               | `CONTACTS_CUSTOMERS`      |
| `/partners/suppliers`               | `CONTACTS_SUPPLIERS`      |
| `/procurement/purchases`            | `PURCHASES`               |
| `/finance/billing/invoices`         | `FINANCE_INVOICES`        |
| `/finance/billing/returns`          | `FINANCE_RETURNS`         |
| `/finance/billing/credit-notes`     | `FINANCE_CREDIT_NOTES`    |
| `/finance/billing/debit-notes`      | `FINANCE_DEBIT_NOTES`     |
| `/finance/treasury/cash-register`   | `FINANCE_CASH_REGISTER`   |
| `/finance/treasury/receivables`     | `FINANCE_RECEIVABLES`     |
| `/finance/treasury/payment-methods` | `FINANCE_PAYMENT_METHODS` |
| `/analytics/dashboard`              | `DASHBOARD`               |

Customer balance URLs (`/partners/customers/:id/balance`) map to `CONTACTS_CUSTOMERS`.

---

## Business Rules

1. The API is authoritative; the frontend never invents grants.
2. Access is loaded on login, token refresh, guarded navigation, and after a `403`.
3. If the access lookup fails, grants are cleared and protected routes fail closed.
4. Departments organize users but do not grant access.
5. `SYSTEM_ADMIN` is protected and cannot be edited.
6. Unknown row actions and missing route metadata fail closed.
7. Cross-owner operations require explicit `requiredPermissions` grants.

---

## Related Documentation

- [Users, Roles and Departments](./users.md) - Administration screens and role editor
- [Auth](./auth.md) - Login, session, and access loading
- [Architecture](../ARCHITECTURE.md) - Guards and permission conventions
