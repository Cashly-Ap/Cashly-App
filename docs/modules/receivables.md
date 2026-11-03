# Receivables Module (Cuentas por Cobrar)

## Overview

The Receivables module provides a **customer-centric view** of outstanding debts. It aggregates invoices with pending balances, enables flexible payment options, and implements a **payment validation workflow** where payments registered by merchants require user approval before being applied.

**Module Type**: `Special (Debt Management + Payment Registration)`

---

## Module Structure

```
src/app/features/finance/treasury/receivables/
├── actions/                        # Row and toolbar actions
├── components/                     # Debt dialogs and action hosts
├── i18n/                           # Translations
├── messages/                       # Toast and error messages
├── models/                         # Interfaces
├── navigation/                     # Menu and navigation contributions
├── pages/                          # Receivables page
├── permissions/                    # Permission constants
├── reporting/                      # Accounts receivable PDF report
├── routing/                        # Lazy-loaded routes
└── services/                       # API and application services
```

---

## Role-Based Endpoint Usage

| Endpoint                                             | USER/ADMIN                    | MERCHANT                                                     |
| ---------------------------------------------------- | ----------------------------- | ------------------------------------------------------------ |
| `GET /api/receivables/summary`                       | Global summary                | **NOT AVAILABLE** (403)                                      |
| `GET /api/receivables/customers`                     | All customers with debt       | Only customers from own invoices (filtered automatically)    |
| `GET /api/receivables/customers/:id`                 | Any customer                  | Only if has invoices with that customer (403 otherwise)      |
| `GET /api/receivables/customers/:id/invoices`        | All invoices for customer     | Only own invoices for that customer (filtered automatically) |
| `GET /api/receivables/customers/:id/payment-history` | Full history                  | Only own payments for that customer                          |
| `POST /api/receivables/invoices/:id/pay`             | Auto-approved payment         | Payment goes to PENDING_APPROVAL + requires `proofFile`      |
| `POST /api/receivables/customers/:id/pay-all`        | Auto-approved                 | PENDING_APPROVAL + requires `proofFile`                      |
| `POST /api/receivables/customers/:id/pay-partial`    | Auto-approved                 | PENDING_APPROVAL + requires `proofFile`                      |
| `GET /api/receivables/payments/pending`              | All pending/rejected payments | **NOT AVAILABLE** (403)                                      |
| `GET /api/receivables/payments/my`                   | **NOT AVAILABLE**             | Own registered payments (all statuses)                       |
| `PUT /api/receivables/payments/:id/approve`          | Available                     | **NOT AVAILABLE** (403)                                      |
| `PUT /api/receivables/payments/:id/reject`           | Available                     | **NOT AVAILABLE** (403)                                      |

**Key rule for MERCHANT**: The endpoints `GET /api/receivables/customers` and `GET /api/receivables/customers/:id/invoices` are shared with USER/ADMIN. The backend automatically filters results to only show data related to the authenticated merchant's invoices — no extra query parameters needed.

**Voucher file rule**: When MERCHANT registers a payment, a proof-of-payment file (`proofFile`) is **required**. The frontend sends the request as `multipart/form-data` with a `data` JSON part and a `proofFile` file part. USER/ADMIN payments may optionally include a `proofFile`.

---

## Features

- View global debt summary across all customers (USER/ADMIN)
- Search and filter customers with outstanding debts
- View customer-specific debt details and invoices (via dialog)
- View full payment history for a customer or specific invoice
- Register payments for single invoices
- Pay entire customer debt in one operation
- Pay partial amounts distributed across invoices (oldest first)
- Payment proof file upload (required for MERCHANT payments)
- Payment validation workflow for merchant-registered payments
- Approve or reject pending payments (USER/ADMIN only)
- View rejected payments with rejection reasons
- Merchant self-view: see own registered payments and their status
- Role-based access control (MERCHANT sees only their invoices)

---

## Pages

### Receivables Page (Single Page with Tabs)

**Route**: `/finance/treasury/receivables`

**Component**: `ReceivablesPageComponent`

**Purpose**: Single-page module using PrimeNG Tabs to organize all receivables functionality. All interactions (customer detail, payment, approve/reject) are handled via dialogs — there are no sub-routes.

**Tabs**:

- **Clientes con Deuda** (USER/ADMIN + MERCHANT): Searchable table of customers with outstanding balances
- **Pagos Pendientes** (USER/ADMIN only): Payments awaiting approval
- **Pagos Rechazados** (USER/ADMIN only): Payments that were rejected
- **Mis Pagos Registrados** (MERCHANT only): Merchant's own registered payments with status tracking

**Dialogs used**:

- `CustomerDebtDialogComponent` — Customer invoice list + pay actions
- `PaymentFormDialogComponent` — Register payment (single / all / partial modes)
- `ApproveRejectDialogComponent` — Confirm approve or reject with reason
- `PaymentHistoryDialogComponent` — Full payment history for customer/invoice
- `PaymentDetailDialogComponent` — Read-only view of a specific payment

---

## Data Models

### Interfaces

#### GlobalDebtSummary

**Usage**: Summary cards on receivables list tab (GET /api/receivables/summary)

**Purpose**: High-level debt overview across all customers.

```typescript
export interface GlobalDebtSummary {
  totalDebt: number; // Total outstanding debt
  totalCustomersWithDebt: number; // Count of customers with debt
  totalInvoicesWithDebt: number; // Count of invoices with balance > 0
  debtByStatus: Record<string, number>; // Debt grouped by invoice status
  calculatedAt: string; // ISO timestamp of calculation
}
```

**API Mapping**: Maps directly from `GlobalDebtSummaryResponse`

---

#### CustomerDebtList

**Usage**: List page table rows (GET /api/receivables/customers)

**Purpose**: Minimal data for customer debt table display.

```typescript
export interface CustomerDebtList {
  customerId: string; // UUID identifier
  customerName: string; // Customer legal name
  customerRif: string; // Venezuelan tax ID (J-12345678-9)
  totalDebt: number; // Total amount owed
  invoicesWithDebt: number; // Count of invoices with balance
  oldestInvoiceDate: string; // ISO date of oldest unpaid invoice
  pendingValidationAmount: number; // Amount blocked in PENDING_APPROVAL payments
  pendingValidationCount: number; // Count of invoices with a pending payment
  availableDebt: number; // Debt available to pay (totalDebt - pendingValidationAmount)
}
```

**API Mapping**: Maps directly from `CustomerDebtListResponse`

---

#### CustomerDebtSummary

**Usage**: Customer debt dialog header (GET /api/receivables/customers/:customerId)

**Purpose**: Complete customer debt information with contact details.

```typescript
export interface CustomerDebtSummary {
  customerId: string; // UUID identifier
  customerName: string; // Customer legal name
  customerRif: string; // Venezuelan tax ID
  customerPhone: string | null; // Primary phone
  customerEmail: string | null; // Primary email
  totalDebt: number; // Total amount owed
  invoicesWithDebt: number; // Count of invoices with balance
  pendingPaymentsCount: number; // Payments awaiting validation
  pendingPaymentsAmount: number; // Amount in pending payments
  debtBreakdown: Record<string, number>; // Debt by invoice status
}
```

**API Mapping**: Maps from `CustomerDebtSummaryResponse`

---

#### CustomerInvoiceDebt

**Usage**: Invoice list inside customer debt dialog (GET /api/receivables/customers/:customerId/invoices)

**Purpose**: Invoice debt details for payment selection.

```typescript
export interface PendingPaymentSummary {
  id: string; // Pending payment UUID
  amount: number; // Payment amount
  status: string; // PENDING_APPROVAL
  registeredAt: string; // ISO timestamp
}

export interface CustomerInvoiceDebt {
  invoiceId: string; // UUID identifier
  invoiceNumber: string; // INV-YYYY-NNNNN format
  status: string; // DELIVERED, PARTIALLY_PAID
  invoiceDate: string; // ISO date
  subtotal: number; // Invoice total
  totalPaid: number; // Amount already paid
  balance: number; // Remaining amount
  pendingPayment: PendingPaymentSummary | null; // Pending validation payment
  merchantId: string; // Associated merchant UUID
  merchantName: string; // Merchant display name
  lineCount: number; // Number of line items
}
```

**API Mapping**: Maps from `CustomerInvoiceDebtResponse`

---

#### InvoiceDetail

**Usage**: Payment history dialog (GET /api/invoices/:id)

**Purpose**: Full invoice details including all registered payments (used to show payment history).

```typescript
export interface InvoicePayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  status: PaymentValidationStatus;
  registeredAt: string;
  registeredBy?: string;
  validatedBy?: string | null;
  validatedAt?: string | null;
  rejectionReason?: string | null;
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  invoiceDate: string;
  subtotal: number;
  totalPaid: number;
  balance: number;
  customerId: string;
  customerName: string;
  merchantId: string | null;
  merchantName: string | null;
  payments: InvoicePayment[];
}
```

---

#### PendingPayment

**Usage**: Pending/rejected payments tabs (GET /api/receivables/payments/pending) and merchant payments tab (GET /api/receivables/payments/merchant)

**Purpose**: Payment record for validation or merchant self-view.

```typescript
export interface PendingPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  merchantId: string | null;
  merchantName: string | null;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
  proofFileUrl: string | null; // URL of stored payment proof file
  status: PaymentValidationStatus;
  registeredAt: string;
  invoiceBalance: number;
  invoiceSubtotal: number;
  registeredBy?: string;
  validatedBy?: string | null;
  validatedAt?: string | null;
  rejectionReason?: string | null;
}
```

**API Mapping**: Maps from `PendingPaymentResponse`

---

#### PaymentResult / BulkPaymentResult

**Usage**: Response from payment operations

**Purpose**: Result of payment registration or bulk payment.

```typescript
export interface PaymentResult {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  status: string; // APPROVED, PENDING_APPROVAL
  newInvoiceStatus: string;
  newInvoiceBalance: number;
  requiresValidation: boolean; // True if MERCHANT payment
  collectionGenerated: boolean;
  commissionAmount: number | null;
  message: string | null;
}

export interface BulkPaymentResult {
  customerId: string;
  customerName: string;
  totalAmountPaid: number;
  invoicesPaid: number;
  remainingDebt: number;
  status: string;
  requiresValidation: boolean;
  payments: PaymentItem[];
}

export interface PaymentItem {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  newStatus: string;
}
```

---

#### Payment Request Interfaces

```typescript
export interface PayInvoiceRequest {
  amount: number;
  paymentDate: string; // ISO date (YYYY-MM-DD)
  paymentMethod: PaymentMethod;
  reference: string | null;
}

export interface PayCustomerDebtRequest {
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
}

export interface PayPartialDebtRequest {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string | null;
}

export interface ValidatePaymentRequest {
  reason: string; // Required for rejection
}
```

---

### Enums

#### PaymentValidationStatus

```typescript
export enum PaymentValidationStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PaymentValidationStatusOption {
  label: string;
  value: PaymentValidationStatus;
  severity: 'warn' | 'success' | 'danger';
}

export const PAYMENT_VALIDATION_STATUSES: readonly PaymentValidationStatusOption[] = [
  {
    label: 'Pendiente de Aprobación',
    value: PaymentValidationStatus.PENDING_APPROVAL,
    severity: 'warn',
  },
  { label: 'Aprobado', value: PaymentValidationStatus.APPROVED, severity: 'success' },
  { label: 'Rechazado', value: PaymentValidationStatus.REJECTED, severity: 'danger' },
] as const;

export function getPaymentValidationStatusLabel(status: PaymentValidationStatus): string {
  return PAYMENT_VALIDATION_STATUS_LABELS[status] || status;
}

export function getPaymentValidationStatusSeverity(
  status: PaymentValidationStatus,
): 'warn' | 'success' | 'danger' {
  const option = PAYMENT_VALIDATION_STATUSES.find((s) => s.value === status);
  return option?.severity || 'warn';
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/receivables` (except invoice detail which uses `/api/invoices`)

### Route Constants

```typescript
const RECEIVABLES_API_ROUTES = {
  BASE: '/receivables',
  SUMMARY: '/receivables/summary',
  CUSTOMERS: '/receivables/customers',
  CUSTOMER_BY_ID: (id: string) => `/receivables/customers/${id}`,
  CUSTOMER_INVOICES: (id: string) => `/receivables/customers/${id}/invoices`,
  CUSTOMER_PAYMENT_HISTORY: (id: string) => `/receivables/customers/${id}/payment-history`,
  INVOICE_BY_ID: (id: string) => `/invoices/${id}`,
  INVOICE_PAY: (id: string) => `/receivables/invoices/${id}/pay`,
  CUSTOMER_PAY_ALL: (id: string) => `/receivables/customers/${id}/pay-all`,
  CUSTOMER_PAY_PARTIAL: (id: string) => `/receivables/customers/${id}/pay-partial`,
  PENDING_PAYMENTS: '/receivables/payments/pending',
  MERCHANT_PAYMENTS: '/receivables/payments/my',
  APPROVE_PAYMENT: (id: string) => `/receivables/payments/${id}/approve`,
  REJECT_PAYMENT: (id: string) => `/receivables/payments/${id}/reject`,
};
```

### Interface Mapping Summary

| HTTP Method | Endpoint                                       | Request                                 | Response                             | Frontend Usage          |
| ----------- | ---------------------------------------------- | --------------------------------------- | ------------------------------------ | ----------------------- |
| GET         | /api/receivables/summary                       | -                                       | `GlobalDebtSummary`                  | Summary cards           |
| GET         | /api/receivables/customers                     | `ReceivablesSearchParams`               | `PagedResponse<CustomerDebtList>`    | Customer list           |
| GET         | /api/receivables/customers/:id                 | -                                       | `CustomerDebtSummary`                | Customer dialog header  |
| GET         | /api/receivables/customers/:id/invoices        | `ReceivablesSearchParams`               | `PagedResponse<CustomerInvoiceDebt>` | Invoice list in dialog  |
| GET         | /api/receivables/customers/:id/payment-history | `ReceivablesSearchParams`               | `PagedResponse<PendingPayment>`      | Payment history dialog  |
| GET         | /api/invoices/:id                              | -                                       | `InvoiceDetail`                      | Invoice payment history |
| POST        | /api/receivables/invoices/:id/pay              | `PayInvoiceRequest` + `proofFile?`      | `PaymentResult`                      | Pay single invoice      |
| POST        | /api/receivables/customers/:id/pay-all         | `PayCustomerDebtRequest` + `proofFile?` | `BulkPaymentResult`                  | Pay all debt            |
| POST        | /api/receivables/customers/:id/pay-partial     | `PayPartialDebtRequest` + `proofFile?`  | `BulkPaymentResult`                  | Pay partial             |
| GET         | /api/receivables/payments/pending              | `ReceivablesSearchParams`               | `PagedResponse<PendingPayment>`      | Pending/rejected tabs   |
| GET         | /api/receivables/payments/my                   | `ReceivablesSearchParams`               | `PagedResponse<PendingPayment>`      | Merchant self-view tab  |
| PUT         | /api/receivables/payments/:id/approve          | -                                       | `PaymentResult`                      | Approve payment         |
| PUT         | /api/receivables/payments/:id/reject           | `ValidatePaymentRequest`                | `PaymentResult`                      | Reject payment          |

### Search Params Interface

```typescript
export interface ReceivablesSearchParams extends PaginationParams {
  search?: string;
  status?: string; // For filtering pending/rejected: 'PENDING_APPROVAL' | 'REJECTED' | 'ALL'
  merchantId?: string;
  customerId?: string;
}
```

**Note on status filtering**: The application service internally sets `status: 'PENDING_APPROVAL'` when calling `loadPendingPayments()` and `status: 'REJECTED'` when calling `loadRejectedPayments()`. The merchant payments tab uses `getMerchantPayments()` which calls `/payments/my` without status filter (returns ALL statuses for the authenticated merchant).

### Proof File Upload

All payment endpoints accept `multipart/form-data`. The request has two parts: a `data` JSON part (payment fields) and an optional `proofFile` file part. **For MERCHANT payments, `proofFile` is required.**

**Accepted file types**: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`

```typescript
private toFormData(data: unknown, file?: File): FormData {
  const fd = new FormData();
  fd.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (file) {
    fd.append('proofFile', file);
  }
  return fd;
}
```

**MERCHANT validation**: In `PaymentFormDialogComponent.onSubmit()`, if the user is a MERCHANT and no file is selected, the form is blocked with error `'El comprobante de pago es requerido'`.

---

## Validation Rules

### Payment Form Validations

| Field           | Type   | Required                         | Rules                                                         | Error Message                                                |
| --------------- | ------ | -------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `amount`        | number | Yes (except 'all' mode)          | > 0, <= balance                                               | "El monto debe ser mayor a cero / no puede exceder el saldo" |
| `paymentDate`   | date   | Yes                              | <= today                                                      | "La fecha no puede ser futura"                               |
| `paymentMethod` | enum   | Yes                              | Valid PaymentMethod                                           | "El método de pago es requerido"                             |
| `reference`     | string | No                               | max 100 chars                                                 | "Máximo 100 caracteres"                                      |
| `proofFile`     | File   | Yes (MERCHANT) / No (USER/ADMIN) | image/jpeg, image/png, image/gif, image/webp, application/pdf | "El comprobante de pago es requerido"                        |
| `reason`        | string | Yes (for rejection)              | max 500 chars                                                 | "La razón es requerida / no puede exceder 500 caracteres"    |

### Custom Validators (`PaymentValidators`)

```typescript
export class PaymentValidators {
  static maxAmount(maxBalance: number): ValidatorFn; // value <= maxBalance
  static notFutureDate(): ValidatorFn; // date <= today (23:59:59)
  static positiveAmount(): ValidatorFn; // value > 0
  static maxLength(max: number): ValidatorFn; // string.length <= max
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/receivables-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ReceivablesApiService {
  getGlobalSummary(): Observable<GlobalDebtSummary>;
  searchCustomersWithDebt(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerDebtList>>;
  getCustomerDebt(customerId: string): Observable<CustomerDebtSummary>;
  getCustomerInvoices(
    customerId: string,
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerInvoiceDebt>>;
  getCustomerPaymentHistory(
    customerId: string,
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment>>;
  getInvoicePaymentHistory(invoiceId: string): Observable<InvoiceDetail>;
  payInvoice(
    invoiceId: string,
    request: PayInvoiceRequest,
    proofFile?: File,
  ): Observable<PaymentResult>;
  payAllCustomerDebt(
    customerId: string,
    request: PayCustomerDebtRequest,
    proofFile?: File,
  ): Observable<BulkPaymentResult>;
  payPartialDebt(
    customerId: string,
    request: PayPartialDebtRequest,
    proofFile?: File,
  ): Observable<BulkPaymentResult>;
  getPendingPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>>;
  getMerchantPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>>; // calls /payments/my
  approvePayment(paymentId: string): Observable<PaymentResult>;
  rejectPayment(paymentId: string, request: ValidatePaymentRequest): Observable<PaymentResult>;
}
```

---

### Application Service (Application Layer)

**File**: `services/application/receivables-application.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ReceivablesApplicationService {
  // Role detection
  readonly isMerchant = computed(() => this.authService.isMerchant());

  // State signals
  readonly globalSummary = signal<GlobalDebtSummary | null>(null);
  readonly customers = signal<CustomerDebtList[]>([]);
  readonly currentCustomer = signal<CustomerDebtSummary | null>(null);
  readonly customerInvoices = signal<CustomerInvoiceDebt[]>([]);
  readonly pendingPayments = signal<PendingPayment[]>([]);          // PENDING_APPROVAL only
  readonly rejectedPayments = signal<PendingPayment[]>([]);         // REJECTED only
  readonly merchantPayments = signal<PendingPayment[]>([]);         // Merchant's own (all statuses)
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Pagination signals
  readonly customersPagination = signal<PaginationState>({...});
  readonly invoicesPagination = signal<PaginationState>({...});
  readonly pendingPaymentsPagination = signal<PaginationState>({...});
  readonly rejectedPaymentsPagination = signal<PaginationState>({...});
  readonly merchantPaymentsPagination = signal<PaginationState>({...});

  // Methods
  loadGlobalSummary(): Observable<GlobalDebtSummary>
  searchCustomersWithDebt(params?: ReceivablesSearchParams): Observable<PagedResponse<CustomerDebtList>>
  loadCustomerDebt(customerId: string): Observable<CustomerDebtSummary>
  loadCustomerInvoices(customerId: string, params?: ReceivablesSearchParams): Observable<PagedResponse<CustomerInvoiceDebt>>
  payInvoice(invoiceId: string, request: PayInvoiceRequest, proofFile?: File): Observable<PaymentResult>
  payAllCustomerDebt(customerId: string, request: PayCustomerDebtRequest, proofFile?: File): Observable<BulkPaymentResult>
  payPartialDebt(customerId: string, request: PayPartialDebtRequest, proofFile?: File): Observable<BulkPaymentResult>
  loadPendingPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>>  // forces status=PENDING_APPROVAL
  loadRejectedPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>> // forces status=REJECTED
  loadMerchantPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>> // uses /payments/my
  approvePayment(paymentId: string): Observable<PaymentResult>
  rejectPayment(paymentId: string, reason: string): Observable<PaymentResult>
  clearCurrentCustomer(): void
  clearError(): void
}
```

**Key design notes**:

- `isMerchant` is a `computed` signal derived from `AuthService`
- Error handling includes 409 Conflict detection with specific messages
- `loadPendingPayments` and `loadRejectedPayments` internally fix the `status` parameter
- All methods use `MessageService` (PrimeNG Toast) for success/error notifications

---

### Payment Form Dialog Component

**File**: `components/payment-form-dialog/payment-form-dialog.component.ts`

**Modes** (exported as `PaymentFormMode`):

- `'single'` — Register payment for one invoice (amount field pre-filled with invoice balance)
- `'all'` — Pay all customer debt (amount field disabled, shows total debt)
- `'partial'` — Pay partial amount (amount field editable, max = total debt)

**Submit event** (exported as `PaymentSubmitEvent`):

```typescript
export interface PaymentSubmitEvent {
  request: PayInvoiceRequest;
  proofFile?: File; // Only present if file selected (required for MERCHANT)
}
```

**Key behaviors**:

- Title changes dynamically based on `mode` and `isMerchant` ("Registrar Pago" vs "Registrar Justificante")
- MERCHANT must upload a `voucherFile` — form is blocked if no file selected
- Form controls are disabled while `loading` signal is true
- Date picker uses PrimeNG `DatePickerModule` (not `CalendarModule`)

---

## Routes Configuration

```typescript
// routing/receivables.routes.ts
export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/receivables-page/receivables-page.component').then(
            (m) => m.ReceivablesPageComponent,
          ),
      },
    ],
  },
];
```

**Note**: All receivables functionality lives in a single route (`/finance/treasury/receivables`). There are no sub-routes — the tabs and dialogs handle all navigation. The former `/payments`, `/payments/:id`, and `/payments/:id/edit` frontend routes were removed; payment management is consolidated here.

Payment notifications use `/finance/treasury/receivables?tab=pending&focus={paymentId}`. This activates **Pagos en Validación**, opens the matching approval dialog, and then removes `focus` from the URL to prevent reopening it on refresh.

---

## Messages

```typescript
export const RECEIVABLES_SUCCESS_MESSAGES = {
  PAYMENT_REGISTERED: 'Pago registrado exitosamente',
  PAYMENT_APPROVED: 'Pago aprobado exitosamente',
  PAYMENT_REJECTED: 'Pago rechazado exitosamente',
  ALL_DEBT_PAID: 'Toda la deuda ha sido pagada',
  PARTIAL_PAYMENT_APPLIED: 'Pago parcial aplicado exitosamente',
  INVOICE_PAYMENT_REGISTERED: 'Pago de factura registrado exitosamente',
  BULK_PAYMENT_SUCCESS: 'Pagos aplicados exitosamente',
};

export const RECEIVABLES_ERROR_MESSAGES = {
  LOAD_ERROR: 'Error al cargar la información de cuentas por cobrar',
  CUSTOMER_NOT_FOUND: 'Cliente no encontrado',
  INVOICE_NOT_FOUND: 'Factura no encontrada',
  PAYMENT_NOT_FOUND: 'Pago no encontrado',
  AMOUNT_EXCEEDS_BALANCE: 'El monto excede el saldo de la factura',
  PAYMENT_REGISTRATION_ERROR: 'Error al registrar el pago',
  PAYMENT_REGISTRATION_CONFLICT:
    'No se puede registrar el pago: la factura ya fue pagada o no tiene deuda pendiente.',
  PAYMENT_APPROVAL_ERROR: 'Error al aprobar el pago',
  PAYMENT_APPROVAL_CONFLICT: 'No se puede aprobar el pago: ya fue procesado anteriormente.',
  PAYMENT_REJECTION_ERROR: 'Error al rechazar el pago',
  PAYMENT_REJECTION_CONFLICT: 'No se puede rechazar el pago: ya fue procesado anteriormente.',
  SUMMARY_LOAD_ERROR: 'Error al cargar el resumen de deudas',
  CUSTOMERS_LOAD_ERROR: 'Error al cargar los clientes con deuda',
  INVOICES_LOAD_ERROR: 'Error al cargar las facturas del cliente',
  PENDING_PAYMENTS_LOAD_ERROR: 'Error al cargar los pagos pendientes',
  REJECTED_PAYMENTS_LOAD_ERROR: 'Error al cargar los pagos rechazados',
  MERCHANT_PAYMENTS_LOAD_ERROR: 'Error al cargar tus pagos registrados',
  CUSTOMER_NO_DEBT: 'El cliente no tiene deudas pendientes',
  UNAUTHORIZED_ACCESS: 'No tiene permisos para acceder a esta información',
};

export const RECEIVABLES_VALIDATION_MESSAGES = {
  AMOUNT_REQUIRED: 'El monto es requerido',
  AMOUNT_POSITIVE: 'El monto debe ser mayor a cero',
  AMOUNT_EXCEEDS_MAX: 'El monto excede el saldo disponible',
  DATE_REQUIRED: 'La fecha es requerida',
  DATE_FUTURE: 'La fecha no puede ser futura',
  PAYMENT_METHOD_REQUIRED: 'El método de pago es requerido',
  REFERENCE_MAX_LENGTH: 'La referencia no puede exceder 100 caracteres',
  REASON_REQUIRED: 'La razón es requerida para rechazar el pago',
  REASON_MAX_LENGTH: 'La razón no puede exceder 500 caracteres',
};

export const RECEIVABLES_INFO_MESSAGES = {
  NO_CUSTOMERS_WITH_DEBT: 'No hay clientes con deuda',
  NO_INVOICES_WITH_DEBT: 'No hay facturas con saldo pendiente',
  NO_PENDING_PAYMENTS: 'No hay pagos pendientes de aprobación',
  MERCHANT_PAYMENT_PENDING:
    'El pago ha sido registrado y está pendiente de aprobación por un administrador',
  LOADING_DATA: 'Cargando información...',
  PROCESSING_PAYMENT: 'Procesando pago...',
};

export const RECEIVABLES_CONFIRMATION_MESSAGES = {
  APPROVE_PAYMENT: '¿Está seguro de que desea aprobar este pago?',
  REJECT_PAYMENT: '¿Está seguro de que desea rechazar este pago?',
  PAY_ALL_DEBT: '¿Está seguro de que desea pagar toda la deuda del cliente?',
  PAY_PARTIAL_DEBT: '¿Está seguro de que desea aplicar este pago parcial?',
  PAY_INVOICE: '¿Está seguro de que desea registrar este pago?',
};
```

---

## Business Rules

### Debt Calculation

1. **Debt = Invoice Balance** (subtotal - totalPaid)
2. Only DELIVERED and PARTIALLY_PAID invoices count as debt
3. PAID and CANCELLED invoices have no debt
4. Customer total debt = Sum of all invoice balances
5. **`hasPendingPayment` flag**: When a MERCHANT registers a payment, the invoice's `hasPendingPayment` flag is set to `true`. This invoice's balance is excluded from `availableDebt` but the customer remains visible in the debt list if they have at least one other invoice available. When the payment is approved or rejected, the flag resets to `false`.

| Event                        | `hasPendingPayment` | Effect on debt queries                                                                        |
| ---------------------------- | ------------------- | --------------------------------------------------------------------------------------------- |
| Invoice created              | `false`             | Visible in debt lists                                                                         |
| MERCHANT registers payment   | `true`              | Invoice excluded from `availableDebt`; customer hidden only if ALL invoices are in validation |
| Payment approved or rejected | `false`             | Visible again (if balance > 0)                                                                |

### Payment Registration

1. Amount must be > 0 and <= invoice balance
2. Cannot pay more than what customer owes
3. **USER/ADMIN payments are auto-approved** — applied immediately
4. **MERCHANT payments require validation** — go to PENDING_APPROVAL status
5. **MERCHANT must upload a proof-of-payment file** (`proofFile`) — required, not optional
6. **USER/ADMIN may optionally upload a proof-of-payment file**
7. Accepted file types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`
8. Proof files are stored in the `payment-proofs/` folder via `FileStorageService`

### Payment Validation

1. Only USER/ADMIN can approve/reject payments
2. Approved payments create InvoicePayment + Collection
3. Rejected payments are recorded but don't affect invoice balance
4. Once validated, cannot be changed (409 Conflict returned)

### Partial Payment Distribution

1. Get all invoices with debt ordered by invoice number (oldest first)
2. Apply payment to each invoice until amount is exhausted
3. If amount covers full invoice balance, mark as PAID
4. If amount is less than balance, apply partial payment

### Role-Based Access

1. **USER/ADMIN**: See all customers and invoices, payments auto-approved, access approve/reject tabs
2. **MERCHANT**: Uses the **same endpoints** as USER/ADMIN for reading — backend filters automatically
   - `GET /api/receivables/customers` → returns only customers with debt on merchant's invoices
   - `GET /api/receivables/customers/:id` → returns 403 if merchant has no invoices with that customer
   - `GET /api/receivables/customers/:id/invoices` → returns only the merchant's invoices for that customer
   - `POST /api/receivables/invoices/:id/pay` → payment goes to PENDING_APPROVAL (not applied immediately)
3. **MERCHANT cannot**:
   - Access `GET /api/receivables/summary`
   - Access `GET /api/receivables/payments/pending`
   - Approve or reject payments
4. **MERCHANT can**:
   - Access `GET /api/receivables/payments/my` to see their own registered payments (all statuses)
5. Frontend does NOT need to switch endpoints or pass `merchantId` filters for MERCHANT role — the backend identifies the authenticated user and applies filtering server-side

### 409 Conflict Handling

When a payment operation returns HTTP 409:

- Registration conflict: "No se puede registrar el pago: la factura ya fue pagada o no tiene deuda pendiente."
- Approval conflict: "No se puede aprobar el pago: ya fue procesado anteriormente."
- Rejection conflict: "No se puede rechazar el pago: ya fue procesado anteriormente."

---

## Testing Requirements

### Unit Tests

- [x] Payment validators tested (maxAmount, notFutureDate, positiveAmount, maxLength)
- [ ] API service HTTP calls mocked and verified
- [ ] Application service state management tested (signals updated correctly)
- [ ] `isMerchant` computed signal tested with AuthService mock

### Component Tests

- [ ] Receivables page renders correct tabs based on role (MERCHANT vs USER/ADMIN)
- [ ] Payment form dialog validates correctly (all 3 modes)
- [ ] MERCHANT payment form requires voucherFile
- [ ] Approve/reject dialog works correctly
- [ ] Error handling displays toast messages

### Integration Tests

- [ ] Full payment workflow tested (register → approve)
- [ ] Rejection workflow with reason
- [ ] Role-based tab visibility (MERCHANT sees "Mis Pagos", not "Pendientes/Rechazados")
- [ ] 409 Conflict error handling
- [ ] Voucher file upload multipart/form-data flow

---

## Related Modules

- [Invoices](./invoices.md) - Source of debt data and payment records
- [Customers](./customers.md) - Customer data and grouping
- [Reporting](./reports.md) - Accounts receivable PDF report
- [Payments](./payments.md) - Payment reporting

---

## Notes

### Important Considerations

1. **Single Page + Dialogs Architecture**: Unlike other modules, Receivables has only one route and one page component. All functionality (customer detail, payments, approval) is handled through dialogs opened from the page. There are no sub-routes.

2. **Payment Validation Workflow**: MERCHANT payments are NOT applied immediately — they go to PENDING_APPROVAL status. Once a USER/ADMIN approves, the payment is applied and a Collection is generated.

3. **Proof File Required for MERCHANT**: When a MERCHANT registers a payment, they MUST upload a proof-of-payment file (`proofFile`). The request is sent as `multipart/form-data` with a `data` JSON part and a `proofFile` file part. USER/ADMIN payments may optionally include a proof file.

4. **Three Payment Signals**: The application service maintains three separate payment arrays:
   - `pendingPayments` — always contains PENDING_APPROVAL status only
   - `rejectedPayments` — always contains REJECTED status only
   - `merchantPayments` — contains all statuses for the authenticated merchant

5. **Merchant Self-View Endpoint**: `GET /api/receivables/payments/my` is specifically for the MERCHANT to see their own registered payments with status tracking (including APPROVED, PENDING, REJECTED).

6. **Oldest First Distribution**: Partial debt payments are applied to oldest invoices first (by invoice number / date).

7. **Collection Generation**: When a payment is approved, a Collection record is created (which triggers a Payable for merchant commission).

### Common Patterns

- Use `isMerchant()` computed signal to conditionally render tabs and form titles
- Check `result.requiresValidation` in response to show appropriate success message
- Show 409-specific error messages when payment conflicts occur
- Refresh data after payment operations (`refreshCurrentView()` pattern)
- Confirm before approve/reject actions via `ApproveRejectDialogComponent`
- Dialog visibility controlled via `signal<boolean>` in the page component

---

**Last Updated**: 2026-11-03

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
