# API Reference

Consolidated index of the HTTP endpoints consumed by the Cashly frontend. Per-module request/response models and examples live in each [module document](modules/README.md).

## Conventions

- Base URL: `environment.apiUrl` (`/api` in development, the Railway API URL in production).
- Authentication: `Authorization: Bearer <token>` is added by `authInterceptor`.
- Language: `Accept-Language: es|en` is added by `languageInterceptor`.
- Pagination uses `page`, `size`, `orderBy`, and `orderDir` where supported. Paged responses return `content`, `totalElements`, `totalPages`, and `number`.
- Errors are handled by the shared HTTP error handler and translated messages.
- A `403` triggers an access refresh unless the failing request is `/auth/access`.

---

## Auth and platform

| Method | Endpoint                                | Purpose                                   |
| ------ | --------------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`                    | Register a user                           |
| POST   | `/api/auth/login`                       | Log in (may return an MFA challenge)      |
| POST   | `/api/auth/mfa/verify`                  | Verify an MFA challenge                   |
| GET    | `/api/auth/mfa`                         | MFA status                                |
| POST   | `/api/auth/mfa/setup`                   | Start MFA setup                           |
| POST   | `/api/auth/mfa/enable`                  | Enable MFA                                |
| POST   | `/api/auth/mfa/disable`                 | Disable MFA                               |
| POST   | `/api/auth/refresh`                     | Refresh the session                       |
| POST   | `/api/auth/logout`                      | Log out                                   |
| GET    | `/api/auth/access`                      | Current role, department, and permissions |
| GET    | `/api/auth/profile`                     | Authenticated user profile                |
| PUT    | `/api/auth/profile`                     | Update the authenticated profile          |
| PATCH  | `/api/auth/change-username`             | Change username                           |
| PATCH  | `/api/auth/change-password`             | Change password                           |
| PUT    | `/api/auth/change-commission-deduction` | Change commission deduction               |
| GET    | `/api/auth/preferences`                 | Load user preferences                     |
| PUT    | `/api/auth/preferences`                 | Save user preferences                     |
| GET    | `/api/auth/profile/photo`               | Current user photo (blob)                 |
| POST   | `/api/auth/profile/photo`               | Upload current user photo                 |
| DELETE | `/api/auth/profile/photo`               | Remove current user photo                 |

### Users, roles, departments

| Method | Endpoint                   | Purpose                       |
| ------ | -------------------------- | ----------------------------- |
| GET    | `/api/users`               | List users with filters       |
| GET    | `/api/users/:id`           | User details                  |
| POST   | `/api/users`               | Create user                   |
| PUT    | `/api/users/:id`           | Update user                   |
| DELETE | `/api/users/:id`           | Delete user                   |
| PUT    | `/api/users/:id/password`  | Change user password          |
| PUT    | `/api/users/:id/email`     | Change user email             |
| GET    | `/api/users/:id/photo`     | User photo (blob)             |
| POST   | `/api/users/:id/photo`     | Upload user photo             |
| DELETE | `/api/users/:id/photo`     | Remove user photo             |
| GET    | `/api/roles`               | List roles                    |
| POST   | `/api/roles`               | Create role                   |
| PUT    | `/api/roles/:id`           | Update role and permissions   |
| DELETE | `/api/roles/:id`           | Delete role                   |
| GET    | `/api/roles/options`       | Assignable role options       |
| GET    | `/api/departments`         | List departments              |
| POST   | `/api/departments`         | Create department             |
| PUT    | `/api/departments/:id`     | Update department             |
| DELETE | `/api/departments/:id`     | Delete department             |
| GET    | `/api/departments/options` | Assignable department options |
| GET    | `/api/permissions/catalog` | Permission catalog            |

### Company and notifications

| Method | Endpoint                          | Purpose                       |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/company`                    | Company record                |
| PUT    | `/api/company`                    | Update company                |
| GET    | `/api/company/logo`               | Company logo (blob)           |
| POST   | `/api/company/logo`               | Upload company logo           |
| DELETE | `/api/company/logo`               | Remove company logo           |
| GET    | `/api/company/pdf-logo`           | PDF logo (blob)               |
| POST   | `/api/company/pdf-logo`           | Upload PDF logo               |
| DELETE | `/api/company/pdf-logo`           | Remove PDF logo               |
| POST   | `/api/company/pdf-logo/preview`   | Preview logos in a sample PDF |
| GET    | `/api/notifications`              | List notifications (`unread`) |
| GET    | `/api/notifications/unread-count` | Unread count                  |
| PUT    | `/api/notifications/:id/read`     | Mark one as read              |
| PUT    | `/api/notifications/read-all`     | Mark all as read              |

---

## Analytics

| Method | Endpoint                              | Purpose                 |
| ------ | ------------------------------------- | ----------------------- |
| GET    | `/api/dashboard/summary`              | Summary indicators      |
| GET    | `/api/dashboard/monthly-sales`        | Monthly sales           |
| GET    | `/api/dashboard/top-products`         | Top products (`limit`)  |
| GET    | `/api/dashboard/top-customers`        | Top customers (`limit`) |
| GET    | `/api/dashboard/recent-activity`      | Recent activity         |
| GET    | `/api/dashboard/invoice-due-schedule` | Invoice due schedule    |

---

## Partners

| Method | Endpoint                                     | Purpose                   |
| ------ | -------------------------------------------- | ------------------------- |
| GET    | `/api/customers`                             | List customers            |
| GET    | `/api/customers/picker`                      | Customer picker           |
| GET    | `/api/customers/:id`                         | Customer details          |
| POST   | `/api/customers`                             | Create customer           |
| PUT    | `/api/customers/:id`                         | Update customer           |
| DELETE | `/api/customers/:id`                         | Delete customer           |
| GET    | `/api/customers/:id/warehouses`              | Customer warehouse access |
| POST   | `/api/customers/:id/warehouses`              | Grant warehouse access    |
| DELETE | `/api/customers/:id/warehouses/:warehouseId` | Revoke warehouse access   |
| GET    | `/api/customers/:id/balance`                 | Customer balance          |
| GET    | `/api/customers/:id/balance/transactions`    | Balance transactions      |
| POST   | `/api/customers/:id/balance/advance`         | Register balance advance  |
| POST   | `/api/customers/:id/balance/refund`          | Register balance refund   |
| GET    | `/api/suppliers`                             | List suppliers            |
| GET    | `/api/suppliers/:id`                         | Supplier details          |
| POST   | `/api/suppliers`                             | Create supplier           |
| PUT    | `/api/suppliers/:id`                         | Update supplier           |
| DELETE | `/api/suppliers/:id`                         | Delete supplier           |

---

## Catalog

| Method | Endpoint                     | Purpose                                                   |
| ------ | ---------------------------- | --------------------------------------------------------- |
| GET    | `/api/products`              | List products (also used by order/quote/purchase pickers) |
| GET    | `/api/products/:id`          | Product details                                           |
| POST   | `/api/products`              | Create product                                            |
| PUT    | `/api/products/:id`          | Update product                                            |
| PATCH  | `/api/products/:id/active`   | Toggle product active                                     |
| DELETE | `/api/products/:id`          | Delete product                                            |
| GET    | `/api/products/:id/stock`    | Product stock by warehouse                                |
| POST   | `/api/products/:id/photo`    | Upload product photo                                      |
| DELETE | `/api/products/:id/photo`    | Remove product photo                                      |
| GET    | `/api/files/:path`           | Product photo file (blob)                                 |
| GET    | `/api/categories`            | List categories                                           |
| GET    | `/api/categories/:id`        | Category details                                          |
| POST   | `/api/categories`            | Create category                                           |
| PUT    | `/api/categories/:id`        | Update category                                           |
| PATCH  | `/api/categories/:id/active` | Toggle category active                                    |
| DELETE | `/api/categories/:id`        | Delete category                                           |
| GET    | `/api/price-types`           | List price types                                          |
| GET    | `/api/price-types/:id`       | Price type details                                        |
| POST   | `/api/price-types`           | Create price type                                         |
| PUT    | `/api/price-types/:id`       | Update price type                                         |
| DELETE | `/api/price-types/:id`       | Delete price type                                         |

---

## Inventory

| Method | Endpoint                          | Purpose                 |
| ------ | --------------------------------- | ----------------------- |
| GET    | `/api/warehouses`                 | List warehouses         |
| GET    | `/api/warehouses/:id`             | Warehouse details       |
| POST   | `/api/warehouses`                 | Create warehouse        |
| PUT    | `/api/warehouses/:id`             | Update warehouse        |
| PATCH  | `/api/warehouses/:id/active`      | Toggle warehouse active |
| DELETE | `/api/warehouses/:id`             | Delete warehouse        |
| POST   | `/api/warehouses/:id/stock/entry` | Register stock entry    |
| POST   | `/api/warehouses/:id/stock/exit`  | Register stock exit     |
| GET    | `/api/warehouses/:id/movements`   | Warehouse movements     |
| GET    | `/api/warehouses/stock`           | Stock overview          |
| GET    | `/api/warehouses/movements`       | Movement overview       |

---

## Sales and procurement

| Method | Endpoint                             | Purpose                 |
| ------ | ------------------------------------ | ----------------------- |
| GET    | `/api/quotes`                        | List quotes             |
| GET    | `/api/quotes/:id`                    | Quote details           |
| POST   | `/api/quotes`                        | Create quote            |
| PUT    | `/api/quotes/:id`                    | Update quote            |
| DELETE | `/api/quotes/:id`                    | Delete quote            |
| PUT    | `/api/quotes/:id/cancel`             | Cancel quote            |
| GET    | `/api/quotes/warehouses`             | Quote warehouses        |
| POST   | `/api/quotes/:id/convert-to-order`   | Convert to order        |
| POST   | `/api/quotes/:id/convert-to-invoice` | Convert to invoice      |
| GET    | `/api/orders`                        | List orders             |
| GET    | `/api/orders/:id`                    | Order details           |
| POST   | `/api/orders`                        | Create order            |
| PUT    | `/api/orders/:id`                    | Update order            |
| DELETE | `/api/orders/:id`                    | Delete order            |
| PUT    | `/api/orders/:id/confirm`            | Confirm order           |
| PUT    | `/api/orders/:id/cancel`             | Cancel order            |
| POST   | `/api/orders/:id/convert-to-invoice` | Convert to invoice      |
| GET    | `/api/purchases`                     | List purchases          |
| GET    | `/api/purchases/:id`                 | Purchase details        |
| POST   | `/api/purchases`                     | Create purchase         |
| PUT    | `/api/purchases/:id`                 | Update purchase         |
| DELETE | `/api/purchases/:id`                 | Delete purchase         |
| PUT    | `/api/purchases/:id/confirm`         | Confirm purchase        |
| PUT    | `/api/purchases/:id/cancel`          | Cancel purchase         |
| GET    | `/api/purchases/products`            | Purchase product picker |
| GET    | `/api/purchases/warehouses`          | Purchase warehouses     |

---

## Finance

| Method | Endpoint                          | Purpose                |
| ------ | --------------------------------- | ---------------------- |
| GET    | `/api/invoices`                   | List invoices          |
| GET    | `/api/invoices/:id`               | Invoice details        |
| POST   | `/api/invoices`                   | Create invoice         |
| PUT    | `/api/invoices/:id`               | Update invoice         |
| PUT    | `/api/invoices/:id/confirm`       | Confirm invoice        |
| PUT    | `/api/invoices/:id/cancel`        | Cancel invoice         |
| POST   | `/api/invoices/:id/duplicate`     | Duplicate invoice      |
| DELETE | `/api/invoices/:id`               | Delete invoice         |
| GET    | `/api/returns`                    | List returns           |
| GET    | `/api/returns/:id`                | Return details         |
| POST   | `/api/returns`                    | Create return          |
| DELETE | `/api/returns/:id`                | Delete return          |
| GET    | `/api/credit-notes`               | List credit notes      |
| GET    | `/api/credit-notes/:id`           | Credit note details    |
| POST   | `/api/credit-notes`               | Create credit note     |
| DELETE | `/api/credit-notes/:id`           | Delete credit note     |
| GET    | `/api/debit-notes`                | List debit notes       |
| GET    | `/api/debit-notes/:id`            | Debit note details     |
| POST   | `/api/debit-notes`                | Create debit note      |
| DELETE | `/api/debit-notes/:id`            | Delete debit note      |
| GET    | `/api/payment-methods`            | List payment methods   |
| GET    | `/api/payment-methods/:id`        | Payment method details |
| POST   | `/api/payment-methods`            | Create payment method  |
| PUT    | `/api/payment-methods/:id`        | Update payment method  |
| PATCH  | `/api/payment-methods/:id/toggle` | Toggle payment method  |
| DELETE | `/api/payment-methods/:id`        | Delete payment method  |

### Treasury

| Method | Endpoint                                         | Purpose                      |
| ------ | ------------------------------------------------ | ---------------------------- |
| POST   | `/api/cash-register/open`                        | Open cash register           |
| GET    | `/api/cash-register/active`                      | Active session               |
| POST   | `/api/cash-register/:id/close`                   | Close session                |
| POST   | `/api/cash-register/:id/movements`               | Register movement            |
| GET    | `/api/cash-register/history`                     | Session history              |
| GET    | `/api/cash-register/:id/report`                  | Session report (blob)        |
| GET    | `/api/cash-register/export`                      | Export history (blob)        |
| GET    | `/api/cash-register/reports`                     | Cash-register reports (blob) |
| GET    | `/api/receivables/summary`                       | Global debt summary          |
| GET    | `/api/receivables/customers`                     | Customers with debt          |
| GET    | `/api/receivables/customers/:id`                 | Customer debt summary        |
| GET    | `/api/receivables/customers/:id/invoices`        | Customer invoices with debt  |
| POST   | `/api/payments/invoices/:id/pay`                 | Pay one invoice              |
| POST   | `/api/payments/customers/:id/pay-all`            | Pay all customer debt        |
| POST   | `/api/payments/customers/:id/pay-partial`        | Partial customer payment     |
| GET    | `/api/payments`                                  | Payments by status           |
| GET    | `/api/receivables/payments/pending`              | Pending payments             |
| GET    | `/api/receivables/payments/history`              | Payment history              |
| GET    | `/api/receivables/customers/:id/payment-history` | Customer payment history     |
| POST   | `/api/payments/:id/approve`                      | Approve payment              |
| POST   | `/api/payments/:id/reject`                       | Reject payment               |
| GET    | `/api/customers/:id/credit`                      | Customer credit status       |

---

## Reports (PDF / Excel)

| Method | Endpoint                                        | Format       |
| ------ | ----------------------------------------------- | ------------ |
| GET    | `/api/reports/quotes/:id/pdf`                   | PDF          |
| GET    | `/api/reports/quotes/pdf`                       | PDF          |
| GET    | `/api/reports/orders/:id/pdf`                   | PDF          |
| GET    | `/api/reports/orders/pdf`                       | PDF          |
| GET    | `/api/reports/purchases/:id/pdf`                | PDF          |
| GET    | `/api/reports/purchases/pdf`                    | PDF          |
| GET    | `/api/reports/invoices/:id/pdf`                 | PDF          |
| GET    | `/api/reports/invoices/pdf`                     | PDF          |
| GET    | `/api/reports/inventory/catalog`                | JSON (paged) |
| GET    | `/api/reports/inventory/catalog/pdf`            | PDF          |
| GET    | `/api/reports/inventory/commercial-catalog/pdf` | PDF          |
| GET    | `/api/reports/inventory/stock/pdf`              | PDF          |
| GET    | `/api/reports/inventory/stock/excel`            | Excel        |
| GET    | `/api/reports/inventory/movements/pdf`          | PDF          |
| GET    | `/api/reports/inventory/movements/excel`        | Excel        |
| GET    | `/api/reports/finance/accounts-receivable/pdf`  | PDF          |
| GET    | `/api/reports/finance/collections/pdf`          | PDF          |
| GET    | `/api/reports/finance/payments/:id/pdf`         | PDF          |
| GET    | `/api/reports/finance/payment-history/pdf`      | PDF          |

Report components are launched from the main menu; see [Reporting](modules/reports.md).

---

## Related documentation

- [Module index](modules/README.md)
- [Authorization](modules/authorization.md)
- [Architecture](ARCHITECTURE.md)
