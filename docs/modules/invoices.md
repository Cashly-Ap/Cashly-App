# Invoices Module

## Overview

The Invoices module manages sales invoices in the billing area. An invoice belongs to a customer, can be created directly or from orders/quotes, supports cash or credit payment terms, tracks payments and returns, and can be confirmed, cancelled, duplicated, or downloaded as PDF.

**Module Type**: `CRUD` with document actions (confirm, cancel, duplicate, PDF)

---

## Module Structure

```
src/app/features/finance/billing/invoices/
├── actions/                  # Cancel, confirm, duplicate, delete, and PDF action providers
├── components/               # Invoice dialogs and form sections
├── i18n/                     # Translations
├── messages/                 # Toast and error messages
├── models/                   # Interfaces and enums
├── navigation/               # Menu and navigation contributions
├── pages/                    # List, form, and details pages
├── permissions/              # Invoice permission constants
├── reporting/                # Invoice PDF report
├── routing/                  # Lazy-loaded routes
├── services/                 # API and application services
└── index.ts
```

---

## Routes

| Route                                | Page            |
| ------------------------------------ | --------------- |
| `/finance/billing/invoices`          | Invoice list    |
| `/finance/billing/invoices/new`      | Create invoice  |
| `/finance/billing/invoices/:id`      | Invoice details |
| `/finance/billing/invoices/:id/edit` | Edit invoice    |

Legacy `/invoices` redirects to `/finance/billing/invoices`.

---

## Features

- List with search, status, return status, customer, payment type, date, and due-status filters
- Create invoices manually or from orders/quotes
- Cash (`CASH`) and credit (`CREDIT`) payment terms
- Per-line warehouse allocations
- Confirm, cancel with reason, duplicate, and download PDF
- Credit/debit note application and partial/full return tracking
- Permission-driven actions and route guards

---

## Data Models

```typescript
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FULLY_RETURNED = 'FULLY_RETURNED',
}

export enum PaymentType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
}

export interface InvoiceList {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  statusLabel: string;
  paymentType: PaymentType;
  subtotal: number;
  total: number;
  paidAmount: number;
  creditApplied: number;
  debitApplied: number;
  lineCount: number;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string;
  issueDate?: string;
  dueDate?: string;
  returnStatus: 'PARTIAL' | 'FULL' | null;
  overdue?: boolean;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  orderId: string | null;
  orderNumber: string | null;
  status: InvoiceStatus;
  statusLabel: string;
  paymentType: PaymentType;
  notes: string | null;
  subtotal: number;
  creditApplied: number;
  debitApplied: number;
  total: number;
  notesList: NoteInfo[];
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  issueDate?: string;
  dueDate?: string;
  lines: InvoiceLineDetail[];
  returnedTotal: number;
  returnStatus: 'PARTIAL' | 'FULL' | null;
  returns: ReturnDetail[];
}

export interface InvoiceCreate {
  customerId: string;
  issueDate?: string;
  orderIds?: string[];
  quoteIds?: string[];
  paymentType: PaymentType;
  notes?: string;
  useBalance?: boolean;
  balanceAmount?: number;
  paymentMethodId?: string;
  lines: InvoiceLineCreate[];
}

export interface InvoiceUpdate {
  issueDate?: string;
  paymentType: PaymentType;
  notes: string | null;
  lines: InvoiceLineCreate[];
}
```

---

## API Endpoints

Base URL: `/api/invoices`

| Method | Endpoint                      | Description                                      |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/api/invoices`               | List with search, status, customer, date filters |
| GET    | `/api/invoices/:id`           | Invoice details                                  |
| POST   | `/api/invoices`               | Create invoice                                   |
| PUT    | `/api/invoices/:id`           | Update invoice                                   |
| PUT    | `/api/invoices/:id/confirm`   | Confirm invoice                                  |
| PUT    | `/api/invoices/:id/cancel`    | Cancel invoice (`{ reason }`)                    |
| POST   | `/api/invoices/:id/duplicate` | Duplicate invoice (`{ customerId? }`)            |
| DELETE | `/api/invoices/:id`           | Delete invoice                                   |

Confirm payload:

```typescript
interface InvoiceConfirmRequest {
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
| `paymentType`          | Required (`CASH` or `CREDIT`)                            |
| `issueDate`            | Optional; defaults on the API                            |
| `lines`                | At least one line                                        |
| `quantity`             | Greater than zero                                        |
| `unitPrice`            | Greater than or equal to zero                            |
| `warehouseAllocations` | Sum of allocated quantities must equal the line quantity |
| `allocated`            | Must not exceed available stock                          |
| `reason`               | Required when cancelling                                 |

---

## Business Rules

1. A customer is required for every invoice.
2. Invoices can be created standalone or from orders/quotes; source documents are referenced.
3. Credit invoices calculate `dueDate` from the customer credit terms; cash invoices are due immediately.
4. Confirmation applies stock and payment effects; the API is the source of truth for balance and credit limits.
5. Cancellation requires a reason and is only allowed while the invoice is in a cancellable state.
6. Duplication creates a new draft; the customer can be overridden.
7. Returns update `returnedQuantity`, `returnedTotal`, and `returnStatus`.
8. Actions and routes are permission-checked; unknown row actions fail closed.

---

## Permissions

`FINANCE_BILLING_INVOICES_VIEW_LIST`, `FINANCE_BILLING_INVOICES_VIEW_DETAIL`, `FINANCE_BILLING_INVOICES_CREATE`, `FINANCE_BILLING_INVOICES_EDIT`, `FINANCE_BILLING_INVOICES_DELETE`, `FINANCE_BILLING_INVOICES_CONFIRM`, `FINANCE_BILLING_INVOICES_CANCEL`, `FINANCE_BILLING_INVOICES_DUPLICATE`, `FINANCE_BILLING_INVOICES_REPORT_PDF`, `FINANCE_BILLING_INVOICES_DOWNLOAD_PDF`.

Invoice creation from orders/quotes also requires `FINANCE_BILLING_INVOICES_CREATE` in addition to the source-document conversion permission.

---

## Related Modules

- [Customers](./customers.md) - Invoice customer and credit terms
- [Orders](./orders.md) - Source document for invoice conversion
- [Quotes](./quotes.md) - Source document for invoice conversion
- [Returns](./returns.md) - Return handling and stock effects
- [Credit Notes](./credit-notes.md) and [Debit Notes](./debit-notes.md) - Balance adjustments
- [Receivables](./receivables.md) - Payment registration and approval
- [Reporting](./reports.md) - Invoice PDF report
