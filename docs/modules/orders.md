# Orders Module

## Overview

The Orders module manages sales orders (pedidos). An order belongs to a customer, contains product lines with optional warehouse allocations, and moves through a draft → confirmed → invoiced lifecycle. Orders can be cancelled while editable and converted into invoices.

**Module Type**: `CRUD` with document actions (confirm, cancel, convert to invoice, PDF)

---

## Module Structure

```
src/app/features/sales/orders/
├── actions/                  # Confirm, cancel, convert, delete, and PDF action providers
├── components/               # Pickers, line tables, and confirmation dialogs
├── i18n/                     # Translations
├── messages/                 # Toast and error messages
├── models/                   # Interfaces and enums
├── navigation/               # Menu and navigation contributions
├── pages/                    # List, form, and details pages
├── permissions/              # Order permission constants
├── reporting/                # Order PDF report
├── routing/                  # Lazy-loaded routes
├── services/                 # API, application, and mapper services
└── index.ts
```

---

## Routes

| Route                    | Page             |
| ------------------------ | ---------------- |
| `/sales/orders`          | Order list       |
| `/sales/orders/new`      | Create order     |
| `/sales/orders/:id`      | Order details    |
| `/sales/orders/:id/edit` | Edit draft order |

Legacy `/orders` redirects to `/sales/orders`.

---

## Features

- List with search, status, date, customer, product, and category filters
- Create and edit draft orders with customer and line selection
- Per-line warehouse allocations validated against available stock
- Confirm order, cancel with a reason, and convert to invoice
- Download the order PDF
- Permission-driven actions and route guards

---

## Data Models

```typescript
export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  INVOICED = 'INVOICED',
}

export interface OrderList {
  id: string;
  orderNumber: string;
  customerAlias: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  customerId: string;
  customerAlias: string;
  customerLegalName: string;
  status: OrderStatus;
  notes: string | null;
  totalAmount: number;
  creditLimit?: number;
  availableCredit?: number;
  items: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  warehouseAllocations: OrderItemAllocationDetail[];
  warehouseStocks?: WarehouseStockItem[];
}

export interface OrderCreate {
  customerId: string;
  notes: string | null;
  lines: OrderItemCreate[];
}

export interface OrderItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: { warehouseId: string; allocated: number }[];
}

export interface OrderEdit {
  notes: string | null;
  lines: OrderItemEdit[];
}
```

`OrderEdit` can change notes and lines only; the customer is fixed after creation.

---

## API Endpoints

Base URL: `/api/orders`

| Method | Endpoint                             | Description                    |
| ------ | ------------------------------------ | ------------------------------ |
| GET    | `/api/orders`                        | List orders with filters       |
| GET    | `/api/orders/:id`                    | Order details                  |
| POST   | `/api/orders`                        | Create order                   |
| PUT    | `/api/orders/:id`                    | Update draft order             |
| PUT    | `/api/orders/:id/confirm`            | Confirm order                  |
| PUT    | `/api/orders/:id/cancel`             | Cancel order (`{ reason }`)    |
| POST   | `/api/orders/:id/convert-to-invoice` | Convert to invoice             |
| DELETE | `/api/orders/:id`                    | Delete order                   |
| GET    | `/api/products`                      | Product picker (order filters) |

Conversion payload:

```typescript
interface ConvertToInvoiceRequest {
  paymentType: string;
  confirmationPassword?: string;
  useBalance?: boolean;
  balanceAmount?: number;
  paymentMethodId?: string;
}
```

---

## Validation Rules

| Field                  | Rule                                                     |
| ---------------------- | -------------------------------------------------------- |
| `customerId`           | Required on create; immutable afterwards                 |
| `lines`                | At least one line                                        |
| `productId`            | Required per line                                        |
| `quantity`             | Greater than zero                                        |
| `unitPrice`            | Greater than or equal to zero                            |
| `warehouseAllocations` | Sum of allocated quantities must equal the line quantity |
| `allocated`            | Must not exceed available stock in that warehouse        |
| `reason`               | Required when cancelling                                 |

---

## Business Rules

1. Only `DRAFT` orders can be edited, confirmed, cancelled, or deleted.
2. Confirming an order is the step that reserves stock through its warehouse allocations.
3. An `INVOICED` order keeps a reference to the generated invoice and cannot be modified.
4. Cancelling records the reason and timestamp; cancelled orders are read-only.
5. Conversion to invoice requires invoice-creation permission in addition to order conversion permission.
6. Actions and routes are permission-checked; unknown row actions fail closed.

---

## Permissions

`SALES_ORDERS_VIEW_LIST`, `SALES_ORDERS_VIEW_DETAIL`, `SALES_ORDERS_CREATE`, `SALES_ORDERS_EDIT`, `SALES_ORDERS_DELETE`, `SALES_ORDERS_CONFIRM`, `SALES_ORDERS_CANCEL`, `SALES_ORDERS_CONVERT_TO_INVOICE`, `SALES_ORDERS_REPORT_PDF`, `SALES_ORDERS_DOWNLOAD_PDF`.

---

## Related Modules

- [Customers](./customers.md) - Order customer
- [Products](./products.md) - Order lines and warehouse stock
- [Quotes](./quotes.md) - Quotes can be converted into orders
- [Invoices](./invoices.md) - Order conversion target
- [Reporting](./reports.md) - Order PDF report
