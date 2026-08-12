# Invoices Module

## Overview

The Invoices module manages sales invoices (facturas) in the invoicing system. Invoices can be created directly (standalone) or generated from an existing Order. Each invoice contains invoice lines with product details, applies differential pricing, manages stock deduction, and tracks payments with due dates.

**Key Concepts**:

- **Customer Required**: Every invoice MUST have a customer associated
- **Merchant Optional**: Invoices MAY have a merchant associated (inherited from Order or set directly)
- **Two Creation Paths**: Can be created standalone OR converted from an Order
- **Differential Pricing**: Invoice lines apply differential pricing rules based on customer/product
- **Stock Management**: Stock is deducted when invoice is created (if products are from warehouse)
- **Credit Days**: Due date calculated from `Customer.creditDays` OR set manually (0-365 days)
- **Delivery Required**: Invoices MUST be marked as DELIVERED before payments can be registered
- **Delivery Justification**: When a dispatcher marks an invoice as delivered, they MUST provide a justification note
- **Payment Tracking**: Supports partial and full payments (only after delivery)
- **Payment Schedules**: Support for installment plans

**Module Type**: `CRUD` with special actions (cancel, register payment, view delivery justification)

---

## Invoice Status Flow

> **Important**: `OVERDUE` is **NOT** a status. Overdue detection is done via a query filter (`dueDate < today AND balance > 0`). Invoices remain in `DELIVERED` or `PARTIALLY_PAID` status even when past their due date.

```
type InvoiceStatus = 'PENDING' | 'DELIVERED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
```

| Status         | Description                | Can Be Delivered | Can Receive Payment | Can Be Cancelled |
| -------------- | -------------------------- | ---------------- | ------------------- | ---------------- |
| PENDING        | Created, awaiting delivery | ✅ Yes           | ❌ No               | ✅ Yes           |
| DELIVERED      | Delivered to customer      | ❌ No            | ✅ Yes              | ❌ No            |
| PARTIALLY_PAID | Partially paid             | ❌ No            | ✅ Yes              | ❌ No            |
| PAID           | Fully paid                 | ❌ No            | ❌ No               | ❌ No            |
| CANCELLED      | Cancelled                  | ❌ No            | ❌ No               | ❌ No            |

### Status Transitions

```
PENDING ──┬──► DELIVERED (dispatcher marks as delivered)
          └──► CANCELLED (cancel action)

DELIVERED ──┬──► PARTIALLY_PAID (partial payment)
            └──► PAID (full payment)

PARTIALLY_PAID ──► PAID (final payment)
```

### Key Flow Rules

1. **PENDING** → Can only be marked as DELIVERED or CANCELLED
2. **DELIVERED** → Can receive payments (partial or full)
3. **PARTIALLY_PAID** → Has some payments, awaiting more
4. **PAID** → Fully paid, final status
5. **CANCELLED** → Only from PENDING status
6. **OVERDUE** → NOT a status; use `GET /api/invoices/overdue` query to find overdue invoices

### Payment Restriction

- ❌ **PENDING invoices CANNOT receive payments**
- ✅ **Only DELIVERED or PARTIALLY_PAID invoices can receive payments**

---

## Invoice Creation Paths

### Path 1: From Order (Convert)

```
Order (PENDING) --> [convert-to-invoice] --> Invoice (PENDING)
```

- Inherits: customerId, merchantId, lines, notes
- Stock deducted at conversion time
- Order status changes to INVOICED
- **This happens in the Orders module, not here**

### Path 2: Direct Creation (Standalone)

```
[Create Invoice API] --> Invoice (PENDING)
```

- Requires: customerId, lines
- Optional: merchantId, creditDays, notes
- Stock deducted at creation time

---

## Module Structure

```
src/app/features/invoices/
├── components/
│   ├── invoice-general-section/
│   ├── invoice-lines-section/
│   ├── invoice-installments-section/
│   ├── invoice-filters/
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── invoice-list.interface.ts
│   │   ├── invoice-details.interface.ts
│   │   ├── invoice-create.interface.ts
│   │   ├── invoice-line.interface.ts
│   │   ├── invoice-payment.interface.ts
│   │   ├── invoice-cancel.interface.ts
│   │   ├── invoice-filter.interface.ts
│   │   ├── payment-schedule.interface.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── invoice-status.enum.ts
│   │   ├── payment-method.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── invoices-list-page/
│   ├── invoices-form-page/
│   ├── invoices-details-page/
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── invoice-api.service.ts
│   │   ├── invoice.service.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── invoice.mapper.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── invoice.validators.ts
│   └── index.ts
├── messages/
│   ├── error-messages.ts
│   ├── success-messages.ts
│   └── index.ts
├── router/
│   ├── invoice.routes.ts
│   └── index.ts
└── index.ts
```

---

## API Endpoints

### Endpoint Summary

| Method | Endpoint                      | Description                          | Roles                   |
| ------ | ----------------------------- | ------------------------------------ | ----------------------- |
| POST   | /api/invoices                 | Create direct invoice                | USER, ADMIN             |
| GET    | /api/invoices                 | List invoices with filters           | USER, ADMIN, MERCHANT   |
| GET    | /api/invoices/{id}            | Get invoice by ID                    | USER, ADMIN, MERCHANT   |
| PUT    | /api/invoices/{id}/deliver    | Mark as delivered                    | USER, ADMIN, DISPATCHER |
| POST   | /api/invoices/{id}/payments   | Register payment (direct)            | USER, ADMIN             |
| PUT    | /api/invoices/{id}/cancel     | Cancel invoice                       | USER, ADMIN             |
| GET    | /api/invoices/{id}/pdf        | Download PDF                         | USER, ADMIN, MERCHANT   |
| GET    | /api/invoices/overdue         | List overdue invoices (query filter) | USER, ADMIN             |
| GET    | /api/invoices/due-soon        | List invoices due soon               | USER, ADMIN, MERCHANT   |
| GET    | /api/invoices/with-debt       | List invoices with balance > 0       | USER, ADMIN, MERCHANT   |
| POST   | /api/invoices/process-overdue | Batch: trigger overdue check         | ADMIN                   |

---

### POST /api/invoices

**Purpose**: Create a direct invoice (not from order)

**Roles**: USER, ADMIN

**Request Body**:

```typescript
interface CreateInvoiceRequest {
  customerId: string; // UUID - REQUIRED
  merchantId?: string; // UUID - Optional
  creditDays?: number; // 0-365 - Optional (uses customer.creditDays if not sent)
  dueDate?: string; // YYYY-MM-DD - Optional (calculated if not sent)
  currency?: string; // USD, EUR, VES - Optional (default: USD)
  notes?: string; // Max 1000 chars - Optional
  lines: InvoiceLineRequest[]; // At least 1 line REQUIRED
}

interface InvoiceLineRequest {
  productId: string; // UUID - REQUIRED
  quantity: number; // > 0 - REQUIRED
  warehouseId?: number; // Optional - for stock deduction; differential pricing is applied automatically
}
```

**Response (201 Created)**:

```typescript
interface InvoiceCreateResponse {
  id: string;
  invoiceNumber: string; // e.g., "INV-2026-00001"
  customerId: string;
  customerName: string;
  merchantId: string | null;
  status: 'PENDING';
  issueDate: string; // "2026-01-13"
  dueDate: string; // "2026-02-12"
  creditDays: number;
  subtotal: number;
  lineCount: number;
  createdAt: string;
}
```

**Errors**:

- 400 - Invalid data
- 404 - Customer not found
- 422 - Insufficient stock

---

### GET /api/invoices

**Purpose**: List invoices with filters and pagination

**Roles**: USER, ADMIN (all), MERCHANT (only their own)

**Query Parameters**:

| Parameter  | Type    | Default        | Description                                                                         |
| ---------- | ------- | -------------- | ----------------------------------------------------------------------------------- |
| search     | string  | -              | Search by invoice number or customer name                                           |
| status     | string  | -              | Filter by status: PENDING, DELIVERED, PARTIALLY_PAID, PAID, CANCELLED               |
| customerId | UUID    | -              | Filter by customer                                                                  |
| merchantId | UUID    | -              | Filter by merchant (ignored for MERCHANT role)                                      |
| fromDate   | date    | -              | Issue date from (YYYY-MM-DD)                                                        |
| toDate     | date    | -              | Issue date to                                                                       |
| overdue    | boolean | false          | Filter overdue invoices (dueDate < today AND status IN (DELIVERED, PARTIALLY_PAID)) |
| page       | number  | 0              | Page number                                                                         |
| size       | number  | 20             | Page size                                                                           |
| sort       | string  | createdAt,desc | Sort field and direction                                                            |

**Response (200 OK)**:

```typescript
interface Page<InvoiceListResponse> {
  content: InvoiceListResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface InvoiceListResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  merchantId: string | null;
  merchantName: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  totalPaid: number;
  balance: number;
  currency: string;
  lineCount: number;
  createdAt: string;
}
```

---

### GET /api/invoices/{id}

**Purpose**: Get invoice by ID with full details

**Roles**: USER, ADMIN (any), MERCHANT (only their own)

**Response (200 OK)**:

```typescript
interface InvoiceDetailResponse {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  merchantId: string | null;
  merchantName: string | null;
  merchantCommission: number | null;
  orderId: string | null;
  orderNumber: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  creditDays: number;
  notes: string | null;
  subtotal: number;
  totalPaid: number;
  balance: number;
  currency: string;
  // Cancellation information
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: InvoiceLineResponse[];
  payments: InvoicePaymentResponse[];
}

interface DispatcherSummary {
  id: string;
  code: number;
  name: string;
}

interface InvoiceLineResponse {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  baseUnitPrice: number;
  differentialId: number | null;
  differentialPercentage: number | null;
  unitPrice: number;
  lineTotal: number;
  warehouseId: number | null;
}

interface InvoicePaymentResponse {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string; // CASH, TRANSFER, CHECK, CARD, OTHER
  reference: string | null;
  createdAt: string;
}

interface PaymentScheduleResponse {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: string; // PENDING, PAID, OVERDUE
  paidAmount: number;
  paidAt: string | null;
}
```

**Errors**:

- 404 - Invoice not found
- 403 - MERCHANT trying to view another merchant's invoice

---

### PUT /api/invoices/{id}/deliver

**Purpose**: Mark a PENDING invoice as DELIVERED

**Roles**: USER, ADMIN, DISPATCHER

**Request Body** (optional):

```typescript
interface DeliverInvoiceRequest {
  dispatcherId?: string; // UUID - Optional dispatcher reference
  deliveryProofUrl?: string; // URL of delivery proof file - Optional
}
```

**Response (200 OK)**: `InvoiceDetailResponse` with `status: 'DELIVERED'`

**Errors**:

- 404 - Invoice not found
- 409 - Invoice is not in PENDING status

---

### POST /api/invoices/{id}/payments

**Purpose**: Register partial or full payment

**Roles**: USER, ADMIN

**Request Body**:

```typescript
interface RegisterPaymentRequest {
  amount: number; // > 0, <= balance - REQUIRED
  paymentDate: string; // "YYYY-MM-DD" - REQUIRED
  paymentMethod: string; // CASH, TRANSFER, CHECK, CARD, OTHER - REQUIRED
  reference?: string; // Max 100 chars - Optional
}
```

**Response (201 Created)**:

```typescript
interface InvoicePaymentResponse {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string | null;
  createdAt: string;
}
```

**Errors**:

- 404 - Invoice not found
- 409 - Invoice cancelled or already paid
- 422 - Amount exceeds balance

**Notes**:

- If payment completes balance → status changes to PAID
- If partial payment → status changes to PARTIAL
- If invoice has merchant → Collection record is generated

---

### PUT /api/invoices/{id}/cancel

**Purpose**: Cancel a pending invoice

**Roles**: USER, ADMIN

**Request Body**:

```typescript
interface CancelInvoiceRequest {
  reason: string; // REQUIRED, max 500 chars
}
```

**Response (200 OK)**: `InvoiceDetailResponse` with `status: 'CANCELLED'`, `cancelledAt`, and `cancelledReason` populated.

**Errors**:

- 404 - Invoice not found
- 409 - Invoice not in PENDING status or has payments

**Notes**:

- Only PENDING invoices can be cancelled
- Invoices with registered payments CANNOT be cancelled
- Stock is restored to warehouse if it was deducted

---

### GET /api/invoices/{id}/pdf

**Purpose**: Generate and download invoice PDF

**Roles**: USER, ADMIN, MERCHANT (only their own)

**Response (200 OK)**:

- Content-Type: application/pdf
- Content-Disposition: attachment; filename="invoice-{id}.pdf"
- Body: Binary PDF file

---

### GET /api/invoices/overdue

**Purpose**: List invoices that are past due date and not fully paid (query filter — NOT a status change)

**Roles**: USER, ADMIN

**Note**: `OVERDUE` is NOT a status. Invoices returned by this endpoint remain in `DELIVERED` or `PARTIALLY_PAID` status. This endpoint is equivalent to filtering with `dueDate < today AND status IN (DELIVERED, PARTIALLY_PAID) AND balance > 0`.

**Query Parameters**:

| Parameter  | Type   | Default     | Description        |
| ---------- | ------ | ----------- | ------------------ |
| customerId | UUID   | -           | Filter by customer |
| merchantId | UUID   | -           | Filter by merchant |
| page       | number | 0           | Page number        |
| size       | number | 20          | Page size          |
| sort       | string | dueDate,asc | Sort               |

**Response**: Same as GET /api/invoices

---

### GET /api/invoices/due-soon

**Purpose**: List invoices that will be due in the next X days

**Roles**: USER, ADMIN (all), MERCHANT (only their own)

**Query Parameters**:

| Parameter  | Type   | Default     | Description        |
| ---------- | ------ | ----------- | ------------------ |
| days       | number | 7           | Days ahead (1-90)  |
| customerId | UUID   | -           | Filter by customer |
| merchantId | UUID   | -           | Filter by merchant |
| page       | number | 0           | Page number        |
| size       | number | 20          | Page size          |
| sort       | string | dueDate,asc | Sort               |

**Response (200 OK)**:

```typescript
interface DueSoonInvoiceResponse extends InvoiceListResponse {
  daysUntilDue: number; // Days until due
}
```

**Use Cases**:

- days=7 → See what's due this week
- days=3 → See urgent (next 3 days)
- days=30 → Monthly planning

---

### POST /api/invoices/process-overdue

**Purpose**: Batch process to mark overdue invoices

**Roles**: ADMIN only

**Request Body**: None

**Response (200 OK)**:

```typescript
interface ProcessOverdueResponse {
  processedAt: string;
  totalFound: number;
  totalMarked: number;
  invoicesMarked: OverdueInvoiceMarkedResponse[];
}

interface OverdueInvoiceMarkedResponse {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  daysOverdue: number;
  balance: number;
  previousStatus: string; // PENDING or PARTIAL
}
```

**Notes**:

- Only ADMIN can execute this endpoint
- Runs automatically every day at midnight (CRON job)
- Idempotent: running multiple times doesn't affect already marked invoices

---

## Data Models

### Frontend Interfaces

#### InvoiceList

**Usage**: List page table rows

```typescript
export interface InvoiceList {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  merchantId: string | null;
  merchantName: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  totalPaid: number;
  balance: number;
  currency: string;
  lineCount: number;
  createdAt: string;
}
```

---

#### InvoiceDetails

**Usage**: Details page display

```typescript
export interface InvoiceLineDetails {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  baseUnitPrice: number;
  differentialId: number | null;
  differentialPercentage: number | null;
  unitPrice: number;
  lineTotal: number;
  warehouseId: number | null;
}

export interface InvoicePaymentDetails {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  createdAt: string;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  orderId: string | null;
  orderNumber: string | null;
  customerId: string;
  customerName: string;
  customerRif: string;
  merchantId: string | null;
  merchantName: string | null;
  merchantCommission: number | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  creditDays: number;
  subtotal: number;
  totalPaid: number;
  balance: number;
  currency: string;
  notes: string | null;
  // Cancellation information
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: InvoiceLineDetails[];
  payments: InvoicePaymentDetails[];
}
```

---

#### InvoiceCreate

**Usage**: Create form submission

```typescript
export interface InvoiceLineCreate {
  productId: string;
  quantity: number;
  warehouseId?: number; // Optional - differential pricing is applied automatically
}

export interface InvoiceCreate {
  customerId: string;
  merchantId?: string;
  creditDays?: number;
  dueDate?: string; // YYYY-MM-DD
  currency?: string; // USD, EUR, VES (default: USD)
  notes?: string;
  lines: InvoiceLineCreate[];
}
```

---

### Enums

#### InvoiceStatus

```typescript
export enum InvoiceStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: 'Pendiente',
  [InvoiceStatus.DELIVERED]: 'Entregada',
  [InvoiceStatus.PARTIALLY_PAID]: 'Pago Parcial',
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.CANCELLED]: 'Cancelada',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING]: 'warning',
  [InvoiceStatus.DELIVERED]: 'info',
  [InvoiceStatus.PARTIALLY_PAID]: 'info',
  [InvoiceStatus.PAID]: 'success',
  [InvoiceStatus.CANCELLED]: 'secondary',
};
```

#### PaymentMethod

```typescript
export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CHECK = 'CHECK',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Efectivo',
  [PaymentMethod.TRANSFER]: 'Transferencia',
  [PaymentMethod.CHECK]: 'Cheque',
  [PaymentMethod.CARD]: 'Tarjeta',
  [PaymentMethod.OTHER]: 'Otro',
};
```

---

## UI Status Colors

```typescript
const statusColors = {
  PENDING: { bg: '#FFF3CD', text: '#856404' }, // Yellow - Awaiting delivery
  DELIVERED: { bg: '#D1ECF1', text: '#0C5460' }, // Cyan - Delivered, ready for payment
  PARTIALLY_PAID: { bg: '#CCE5FF', text: '#004085' }, // Blue - Has partial payments
  PAID: { bg: '#D4EDDA', text: '#155724' }, // Green - Fully paid
  CANCELLED: { bg: '#E2E3E5', text: '#383D41' }, // Gray - Cancelled
};
```

---

## Role Permissions

| Endpoint                  | USER   | ADMIN  | MERCHANT       | DISPATCHER |
| ------------------------- | ------ | ------ | -------------- | ---------- |
| Create invoice            | ✅     | ✅     | ❌             | ❌         |
| List invoices             | ✅ All | ✅ All | ✅ Only theirs | ❌         |
| View invoice              | ✅     | ✅     | ✅ Only theirs | ❌         |
| Deliver invoice           | ✅     | ✅     | ❌             | ✅         |
| Register payment (direct) | ✅     | ✅     | ❌             | ❌         |
| Cancel invoice            | ✅     | ✅     | ❌             | ❌         |
| Download PDF              | ✅     | ✅     | ✅ Only theirs | ❌         |
| View overdue (query)      | ✅     | ✅     | ❌             | ❌         |
| View due soon             | ✅     | ✅     | ✅ Only theirs | ❌         |
| Batch process overdue     | ❌     | ✅     | ❌             | ❌         |

---

## Pages

### List Page

**Route**: `/invoices`

**Features**:

- PrimeNG DataTable with server-side sorting and pagination
- Search by invoice number, customer name (debounced 400ms)
- Filter by status (including DELIVERED), customer, merchant, date range, overdue only
- Action buttons: View, Edit (PENDING only), Print PDF, Delete (PENDING only)
- Status badges with colors (including DELIVERED status)
- Balance/total display

### Form Page

**Route**: `/invoices/new` (Create), `/invoices/:id/edit` (Edit PENDING only)

**Features**:

- Tab-based layout (General, Lines, Payment Plan)
- Customer selection (required)
- Merchant selection (optional)
- Credit days input
- Dynamic invoice lines management
- Payment schedule/installments management
- Real-time subtotal calculation

**Note**: Only PENDING invoices can be edited.

### Details Page

**Route**: `/invoices/:id`

**Features**:

- Complete invoice data display
- Customer and merchant information
- Invoice lines table with differential pricing
- Payments history table
- Payment schedules table
- Balance and totals display
- Status indicator
- **Delivery information section** (if delivered)
- **"Ver Justificante" button** (enabled when status is DELIVERED, PARTIAL, PAID, or OVERDUE)
- Cancellation info (if cancelled)
- Order link (if created from order)
- Action buttons: Back, Edit (PENDING only), Print PDF, **Ver Justificante** (if delivered)

#### "Ver Justificante" Button Logic

The "Ver Justificante" (View Delivery Justification) button should be:

| Condition                                  | Button State | Reason                                 |
| ------------------------------------------ | ------------ | -------------------------------------- |
| Status = PENDING                           | **Disabled** | Invoice not delivered yet              |
| Status = CANCELLED                         | **Disabled** | Invoice was cancelled before delivery  |
| Status = DELIVERED, PARTIAL, PAID, OVERDUE | **Enabled**  | Invoice has been delivered             |
| `deliveryJustification` is null            | **Hidden**   | No justification available (edge case) |

**Button Implementation**:

```typescript
// In component
canViewJustification = computed(() => {
  const invoice = this.invoice();
  if (!invoice) return false;

  const deliveredStatuses = [
    InvoiceStatus.DELIVERED,
    InvoiceStatus.PARTIAL,
    InvoiceStatus.PAID,
    InvoiceStatus.OVERDUE,
  ];

  return deliveredStatuses.includes(invoice.status) &&
         invoice.deliveryJustification !== null;
});

// Show delivery justification in a dialog
onViewJustification(): void {
  const invoice = this.invoice();
  if (!invoice?.deliveryJustification) return;

  this.dialogService.open(DeliveryJustificationDialogComponent, {
    header: 'Justificante de Entrega',
    width: '500px',
    data: {
      invoiceNumber: invoice.invoiceNumber,
      deliveredAt: invoice.deliveredAt,
      deliveredBy: invoice.deliveredBy,
      justification: invoice.deliveryJustification,
    },
  });
}
```

**Template**:

```html
<p-button
  label="Ver Justificante"
  icon="pi pi-file-check"
  [disabled]="!canViewJustification()"
  (onClick)="onViewJustification()"
  severity="info"
/>
```

#### Delivery Information Section

When invoice is delivered, show a card/section with:

````html
@if (invoice().deliveredAt) {
<p-card header="Información de Entrega">
  <div class="grid">
    <div class="col-12 md:col-4">
      <label class="font-semibold">Fecha de Entrega</label>
      <p>{{ invoice().deliveredAt | date:'dd/MM/yyyy HH:mm' }}</p>
    </div>
    <div class="col-12 md:col-4">
      <label class="font-semibold">Entregado por</label>
      <p>{{ invoice().deliveredBy?.name }} (Código: {{ invoice().deliveredBy?.code }})</p>
    </div>
    <div class="col-12 md:col-4">
      <p-button
        label="Ver Justificante"
        icon="pi pi-file-check"
        [disabled]="!canViewJustification()"
        (onClick)="onViewJustification()"
        severity="info"
      />
    </div>
  </div>
</p-card>
} --- ## Business Rules ### Invoice Creation 1. Customer is REQUIRED 2. Merchant is OPTIONAL 3. At
least one invoice line is required 4. `creditDays` defaults to `Customer.creditDays` if not provided
(0-365) 5. `dueDate = issueDate + creditDays` 6. Invoice number is auto-generated (INV-YYYY-NNNNN)
7. Stock is deducted if warehouseId is provided on lines 8. Invoice is created with status PENDING
### Delivery Rules 1. Only PENDING invoices can be marked as DELIVERED 2. Justification is REQUIRED
when marking as delivered 3. Delivery is typically done by a DISPATCHER (but USER/ADMIN can also do
it) 4. Delivery records: timestamp, dispatcher info, justification note 5. Once delivered, status
changes to DELIVERED 6. DELIVERED invoices cannot be cancelled ### Payment Rules 1. **Only DELIVERED
or PARTIALLY_PAID invoices can receive payments** 2. **PENDING invoices CANNOT receive payments**
(must be delivered first) 3. Payment amount must be > 0 4. Payment amount cannot exceed balance 5.
Partial payment changes status to PARTIALLY_PAID 6. Final payment (balance = 0) changes status to
PAID 7. If invoice has merchant → Collection record is generated ### Cancellation Rules 1. Only
PENDING invoices can be cancelled 2. DELIVERED invoices cannot be cancelled (already delivered to
customer) 3. Invoices with any payments cannot be cancelled 4. Cancellation restores stock to
warehouse 5. Reason is required ### Overdue Rules 1. OVERDUE only applies to DELIVERED or PARTIAL
invoices past due date 2. PENDING invoices cannot become OVERDUE (not delivered yet) --- ## Routes
Configuration ```typescript export const INVOICE_ROUTES: Routes = [ { path: '', loadComponent: () =>
import('../pages/invoices-list-page/invoices-list-page.component') .then(m =>
m.InvoicesListPageComponent), title: 'Facturas', }, { path: 'new', loadComponent: () =>
import('../pages/invoices-form-page/invoices-form-page.component') .then(m =>
m.InvoicesFormPageComponent), title: 'Nueva Factura', canDeactivate: [pendingChangesGuard], }, {
path: ':id', loadComponent: () =>
import('../pages/invoices-details-page/invoices-details-page.component') .then(m =>
m.InvoicesDetailsPageComponent), title: 'Detalles de Factura', }, { path: ':id/edit', loadComponent:
() => import('../pages/invoices-form-page/invoices-form-page.component') .then(m =>
m.InvoicesFormPageComponent), title: 'Editar Factura', canDeactivate: [pendingChangesGuard], }, ];
````

---

## Validation Rules

| Field              | Type   | Required | Rules                  | Error Message                                             |
| ------------------ | ------ | -------- | ---------------------- | --------------------------------------------------------- |
| `customerId`       | UUID   | Yes      | Must exist             | "El cliente es requerido"                                 |
| `merchantId`       | UUID   | No       | Must exist if provided | "Comercial no encontrado"                                 |
| `creditDays`       | number | No       | 0-365                  | "Los días de crédito deben estar entre 0 y 365"           |
| `notes`            | string | No       | Max 1000 chars         | "Las notas deben tener máximo 1000 caracteres"            |
| `lines`            | array  | Yes      | At least 1 line        | "Se requiere al menos una línea de factura"               |
| `productId`        | UUID   | Yes      | Must exist             | "El producto es requerido"                                |
| `quantity`         | number | Yes      | > 0                    | "La cantidad debe ser mayor a cero"                       |
| `unitPrice`        | number | Yes      | >= 0                   | "El precio debe ser mayor o igual a cero"                 |
| `amount` (payment) | number | Yes      | > 0, <= balance        | "El monto debe ser mayor a cero y menor o igual al saldo" |
| `paymentDate`      | date   | Yes      | Valid date             | "La fecha de pago es requerida"                           |
| `paymentMethod`    | enum   | Yes      | Valid method           | "El método de pago es requerido"                          |
| `reference`        | string | No       | Max 100 chars          | "La referencia debe tener máximo 100 caracteres"          |
| `cancelReason`     | string | Yes      | Max 500 chars          | "El motivo es requerido"                                  |

---

## Related Modules

- [Auth Module](./auth.md) - Authentication and role-based access
- [Customers Module](./customers.md) - Invoices require a customer; creditDays from customer
- [Merchants Module](./merchants.md) - Invoices can have optional merchant for commission
- [Products Module](./products.md) - Invoice lines reference products
- [Differentials Module](./differentials.md) - Pricing adjustments applied to invoice lines
- [Warehouses Module](./warehouses.md) - Stock deducted/restored for invoice lines
- [Orders Module](./orders.md) - Invoices can be created from orders
- [Dispatchers Module](./dispatchers.md) - Dispatchers mark invoices as delivered with justification
- [Collections Module](./collections.md) - Collections generated when payments registered on invoices with merchants

---

## Delivery Justification Dialog Component

Create a dialog component to display the delivery justification:

**File**: `components/delivery-justification-dialog/delivery-justification-dialog.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';

interface DeliveryJustificationData {
  invoiceNumber: string;
  deliveredAt: string;
  deliveredBy: {
    id: string;
    code: number;
    name: string;
  };
  justification: string;
}

@Component({
  selector: 'app-delivery-justification-dialog',
  standalone: true,
  imports: [ButtonModule, DatePipe],
  templateUrl: './delivery-justification-dialog.component.html',
})
export class DeliveryJustificationDialogComponent {
  private config = inject(DynamicDialogConfig);
  private ref = inject(DynamicDialogRef);

  data: DeliveryJustificationData = this.config.data;

  onClose(): void {
    this.ref.close();
  }
}
```

**Template**: `delivery-justification-dialog.component.html`

```html
<div class="flex flex-column gap-4">
  <div class="grid">
    <div class="col-12 md:col-6">
      <label class="font-semibold text-color-secondary">Nº Factura</label>
      <p class="mt-1 text-lg">{{ data.invoiceNumber }}</p>
    </div>
    <div class="col-12 md:col-6">
      <label class="font-semibold text-color-secondary">Fecha de Entrega</label>
      <p class="mt-1 text-lg">{{ data.deliveredAt | date:'dd/MM/yyyy HH:mm' }}</p>
    </div>
  </div>

  <div>
    <label class="font-semibold text-color-secondary">Entregado por</label>
    <p class="mt-1 text-lg">
      {{ data.deliveredBy.name }}
      <span class="text-color-secondary">(Código: {{ data.deliveredBy.code }})</span>
    </p>
  </div>

  <div>
    <label class="font-semibold text-color-secondary">Justificante de Entrega</label>
    <div class="mt-2 p-3 surface-100 border-round">
      <p class="m-0 white-space-pre-line">{{ data.justification }}</p>
    </div>
  </div>

  <div class="flex justify-content-end mt-2">
    <p-button label="Cerrar" icon="pi pi-times" (onClick)="onClose()" severity="secondary" />
  </div>
</div>
```

---

**Last Updated**: 2026-01-15

**Module Status**: [x] Implemented
