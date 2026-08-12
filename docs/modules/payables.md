# Payables Module (Cuentas por Pagar)

## Overview

The Payables module manages **commission payments owed to merchants** (vendedores). When a payment is approved and a Collection is created, a corresponding payable record is automatically generated representing the commission that the company owes to the merchant. This module provides a single page with role-based rendering and payment registration operations.

**Module Type**: `Special (Commission Management + Payment Registration)`

---

## Module Structure

```
src/app/features/payables/
├── components/
│   ├── merchant-payables-dialog/
│   │   ├── merchant-payables-dialog.component.ts
│   │   └── merchant-payables-dialog.component.html
│   ├── payment-form-dialog/
│   │   ├── payment-form-dialog.component.ts
│   │   └── payment-form-dialog.component.html
│   ├── payment-history-dialog/
│   │   ├── payment-history-dialog.component.ts
│   │   └── payment-history-dialog.component.html
│   ├── merchant-bulk-payment-dialog/
│   │   ├── merchant-bulk-payment-dialog.component.ts
│   │   └── merchant-bulk-payment-dialog.component.html
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── global-payable-summary.interface.ts
│   │   ├── merchant-payable-list.interface.ts
│   │   ├── merchant-payable-summary.interface.ts
│   │   ├── payable-item.interface.ts        (also contains PayableStatus enum + helpers)
│   │   ├── payable-detail.interface.ts
│   │   ├── settlement-request.interface.ts  (RegisterPaymentRequest)
│   │   ├── settlement-result.interface.ts   (PaymentResultResponse)
│   │   ├── pending-payable-payment.interface.ts
│   │   ├── bulk-payment-result.interface.ts (BulkPaymentResult, PayAllVendorRequest, PayPartialVendorRequest)
│   │   └── index.ts
│   ├── enums/
│   │   ├── settlement-method.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   └── payables-page/
│       ├── payables-page.component.ts
│       └── payables-page.component.html
├── services/
│   ├── api/
│   │   ├── payables-api.service.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── payables-application.service.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── payable-payment.validators.ts
│   └── index.ts
├── messages/
│   ├── payables.messages.ts
│   └── index.ts
├── router/
│   ├── payables.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- View global payables summary across all merchants (USER/ADMIN)
- Search and filter merchants with pending commissions (USER/ADMIN)
- View merchant-specific payable details via dialog (USER/ADMIN)
- Register individual payments for specific payable items (USER/ADMIN)
- Register bulk payments: pay all or partial amount for a merchant (USER/ADMIN)
- View payment history and detail for individual payable items (USER/ADMIN)
- Merchant self-service view: see own commissions with status (MERCHANT role)
- Role-based rendering: single page adapts layout based on role
- Status filter: PENDING / PARTIALLY_PAID / PAID
- View full payment history for individual payable items (USER/ADMIN)

---

## Role-Based Endpoint Usage

| Endpoint                                       | USER/ADMIN                 | MERCHANT                          |
| ---------------------------------------------- | -------------------------- | --------------------------------- |
| `GET /api/payables/summary`                    | Global summary             | **NOT AVAILABLE** (403)           |
| `GET /api/payables/merchants`                  | All merchants with pending | **NOT AVAILABLE** (403)           |
| `GET /api/payables/merchants/:id`              | Any merchant summary       | **NOT AVAILABLE** (403)           |
| `GET /api/payables/merchants/:id/items`        | Any merchant's payables    | **NOT AVAILABLE** (403)           |
| `GET /api/payables/:id`                        | Any payable detail         | Only own payables (403 otherwise) |
| `POST /api/payables/:id/pay`                   | Available                  | **NOT ALLOWED** (403)             |
| `GET /api/payables/:id/payments`               | Full history               | **NOT AVAILABLE** (403)           |
| `POST /api/payables/merchants/:id/pay-all`     | Available                  | **NOT ALLOWED** (403)             |
| `POST /api/payables/merchants/:id/pay-partial` | Available                  | **NOT ALLOWED** (403)             |
| `GET /api/payables/me`                         | **NOT APPLICABLE**         | Own summary (MERCHANT only)       |
| `GET /api/payables/me/items`                   | **NOT APPLICABLE**         | Own payables list (MERCHANT only) |

**Key rules for MERCHANT**:

- Uses **dedicated `/me` endpoints** — completely separate from USER/ADMIN endpoints
- `GET /api/payables/me` → returns own payables summary (`MerchantPayableSummary`)
- `GET /api/payables/me/items` → returns own payables list (`Page<PendingPayablePayment>`)
- **Cannot register payments** — no payment actions available for MERCHANT role (view-only)
- Payment registration is exclusively performed by USER/ADMIN

---

## Pages

### Payables Page (Single Role-Aware Page)

**Route**: `/payables`

**Component**: `PayablesPageComponent`

**Purpose**: Single-page module with role-based rendering. USER/ADMIN see a merchants table with payment capabilities. MERCHANT sees their own commissions table (view-only). Dialogs handle all payment operations.

**USER/ADMIN View**:

- Global summary cards (total pending, merchants count, invoices count, settled this month)
- Searchable merchant table
- "Ver Detalles" button opens `MerchantPayablesDialogComponent`
- Merchant dialog exposes per-item payment and bulk payment actions

**MERCHANT View**:

- Merchant-specific summary cards (total pending, total paid, total accumulated)
- Searchable items table filtered by status
- View-only (no payment buttons)

**Dialogs used (USER/ADMIN only)**:

- `MerchantPayablesDialogComponent` — Merchant invoice list + filter + pay/bulk actions
- `PayablePaymentFormDialogComponent` — Register single payment
- `PayablePaymentHistoryDialogComponent` — Read-only detail of a paid payable
- `MerchantBulkPaymentDialogComponent` — Pay all or partial for a merchant

---

## Data Models

### Interfaces

#### GlobalPayableSummary

**Usage**: Summary cards for USER/ADMIN (GET /api/payables/summary)

**Purpose**: High-level overview of pending commissions across all merchants.

```typescript
export interface PendingByMerchantEntry {
  merchantId: string;
  merchantName: string;
  merchantCode: number;
  totalPending: number;
  pendingCount: number;
}

export interface GlobalPayableSummary {
  totalPending: number;
  totalMerchantsWithPending: number;
  totalPendingPayables: number;
  totalSettledThisMonth: number;
  pendingByMerchant: PendingByMerchantEntry[];
  calculatedAt: string;
}
```

---

#### MerchantPayableList

**Usage**: Merchants table rows (GET /api/payables/merchants)

**Purpose**: Minimal data for merchant payables table display.

```typescript
export interface MerchantPayableList {
  merchantId: string;
  merchantName: string;
  merchantCode: number;
  commissionPercentage: number;
  totalPending: number;
  pendingPayablesCount: number;
  oldestPendingDate: string;
}
```

---

#### MerchantPayableSummary

**Usage**: Merchant dialog header (GET /api/payables/merchants/:id) and MERCHANT self-view (GET /api/payables/me)

**Purpose**: Complete merchant payables information with breakdown.

```typescript
export interface MerchantPayableSummary {
  merchantId: string;
  merchantName: string;
  merchantCode: number;
  commissionPercentage: number;
  totalPending: number;
  pendingPayablesCount: number;
  totalPartiallyPaid: number;
  totalPaid: number;
  paidPayablesCount: number;
  totalAllTime: number;
  pendingBreakdown: {
    thisWeek: number;
    thisMonth: number;
    older: number;
  };
}
```

**Note**: Uses `totalPaid`/`paidPayablesCount` (NOT `totalSettled`/`settledPayablesCount`).

---

#### PendingPayablePayment

**Usage**: Payable items table in merchant dialog and MERCHANT self-view (GET /api/payables/merchants/:id/items, GET /api/payables/me/items)

**Purpose**: Payable list item for table display and payment operations.

```typescript
export interface PendingPayablePayment {
  id: string;
  collectionId: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  customerId: string;
  customerName: string;
  amountCollected: number;
  commissionPercentage: number;
  commissionAmount: number;
  amountPaid: number;
  remainingBalance: number;
  collectionDate: string;
  status: PayableStatus;
  createdAt: string;
}
```

---

#### PayableDetail

**Usage**: Payment history dialog (GET /api/payables/:id)

**Purpose**: Complete payable information including payment details.

```typescript
export interface PayableDetail {
  id: string;
  collectionId: string;
  merchantId: string;
  merchantName: string;
  merchantCode: number;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  customerId: string;
  customerName: string;
  amountCollected: number;
  commissionPercentage: number;
  commissionAmount: number;
  amountPaid: number;
  remainingBalance: number;
  collectionDate: string;
  status: PayableStatus;
  createdAt: string;
  paidBy: string | null;
  paymentDate: string | null;
  paymentReference: string | null;
  paymentMethod: SettlementMethod | null;
}
```

---

#### RegisterPaymentRequest

**Usage**: Request body for POST /api/payables/:id/pay

```typescript
export interface RegisterPaymentRequest {
  amount: number;
  paymentMethod: SettlementMethod;
  reference?: string;
}
```

---

#### PaymentResultResponse

**Usage**: Response from POST /api/payables/:id/pay, and as each entry in `BulkPaymentResult.payments[]`

```typescript
export interface PaymentResultResponse {
  payablePaymentId: string; // ID of the PayablePayment audit record
  payableId: string;
  merchantId: string;
  merchantName: string;
  status: PayableStatus;
  commissionAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paidBy: string;
  paymentDate: string;
  paymentMethod: SettlementMethod;
  reference: string | null;
}
```

---

#### BulkPaymentResult

**Usage**: Response from POST /api/payables/merchants/:id/pay-all and pay-partial

```typescript
export interface BulkPaymentResult {
  merchantId: string;
  merchantName: string;
  invoicesSettled: number;
  totalAmountPaid: number;
  remainingUnpaidBalance: number;
  payments: PaymentResultResponse[];
  paymentDate: string;
}
```

---

#### PayablePaymentResponse

**Usage**: Response items from GET /api/payables/:id/payments (payment audit history)

**Purpose**: Immutable audit record of a single payment transaction applied to a payable. The full list is returned by `GET /api/payables/{payableId}/payments`.

```typescript
export interface PayablePaymentResponse {
  id: string; // PayablePayment audit record ID
  payableId: string; // Parent payable ID
  amount: number; // Amount applied in this transaction
  paymentDate: string; // Date payment was applied (YYYY-MM-DD)
  paymentMethod: SettlementMethod;
  reference: string | null;
  paidBy: string; // Admin user UUID who registered the payment
  registeredAt: string; // Server-side timestamp of record creation
}
```

---

#### Bulk Payment Request Interfaces

```typescript
export interface PayAllVendorRequest {
  paymentMethod: string;
  reference?: string;
}

export interface PayPartialVendorRequest {
  amount: number;
  paymentMethod: string;
  reference?: string;
}
```

---

### Enums

#### PayableStatus

**Location**: `models/interfaces/payable-item.interface.ts`

```typescript
export enum PayableStatus {
  PENDING = 'PENDING', // Commission owed, not yet paid
  PARTIALLY_PAID = 'PARTIALLY_PAID', // Some amount paid; remaining balance > 0
  PAID = 'PAID', // Commission fully paid; terminal state
}

export interface PayableStatusOption {
  label: string;
  value: PayableStatus;
  severity: 'warn' | 'info' | 'success';
}

export const PAYABLE_STATUSES: readonly PayableStatusOption[] = [
  { label: 'Pendiente', value: PayableStatus.PENDING, severity: 'warn' },
  { label: 'Pago Parcial', value: PayableStatus.PARTIALLY_PAID, severity: 'info' },
  { label: 'Pagado', value: PayableStatus.PAID, severity: 'success' },
] as const;

export const PAYABLE_STATUS_LABELS: Record<PayableStatus, string> = {
  [PayableStatus.PENDING]: 'Pendiente',
  [PayableStatus.PARTIALLY_PAID]: 'Pago Parcial',
  [PayableStatus.PAID]: 'Pagado',
};

export function getPayableStatusLabel(status: PayableStatus): string {
  return PAYABLE_STATUS_LABELS[status] || status;
}

export function getPayableStatusSeverity(status: PayableStatus): 'warn' | 'info' | 'success' {
  const option = PAYABLE_STATUSES.find((s) => s.value === status);
  return option?.severity ?? 'warn';
}
```

**Status lifecycle**:

- `PENDING` → `PARTIALLY_PAID`: payment amount < remaining balance (partial payment applied)
- `PENDING` → `PAID`: payment amount == full commission amount
- `PARTIALLY_PAID` → `PAID`: payment amount == remaining balance
- `PAID`: terminal state — no further payments allowed (409 Conflict)

---

#### SettlementMethod

**Location**: `models/enums/settlement-method.enum.ts`

```typescript
export enum SettlementMethod {
  TRANSFER = 'TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
}

export interface SettlementMethodOption {
  label: string;
  value: SettlementMethod;
}

export const SETTLEMENT_METHODS: readonly SettlementMethodOption[] = [
  { label: 'Transferencia Bancaria', value: SettlementMethod.TRANSFER },
  { label: 'Efectivo', value: SettlementMethod.CASH },
  { label: 'Cheque', value: SettlementMethod.CHECK },
] as const;

export const SETTLEMENT_METHOD_LABELS: Record<SettlementMethod, string> = {
  [SettlementMethod.TRANSFER]: 'Transferencia Bancaria',
  [SettlementMethod.CASH]: 'Efectivo',
  [SettlementMethod.CHECK]: 'Cheque',
};

export function getSettlementMethodLabel(method: SettlementMethod): string {
  return SETTLEMENT_METHOD_LABELS[method] || method;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/payables`

### Route Constants

```typescript
const PAYABLES_API_ROUTES = {
  SUMMARY: '/payables/summary',
  MERCHANTS: '/payables/merchants',
  MERCHANT_BY_ID: (id: string) => `/payables/merchants/${id}`,
  MERCHANT_ITEMS: (id: string) => `/payables/merchants/${id}/items`,
  PAY_ALL_MERCHANT: (id: string) => `/payables/merchants/${id}/pay-all`,
  PAY_PARTIAL_MERCHANT: (id: string) => `/payables/merchants/${id}/pay-partial`,
  PAYABLE_BY_ID: (id: string) => `/payables/${id}`,
  REGISTER_PAYMENT: (id: string) => `/payables/${id}/pay`,
  PAYABLE_PAYMENTS: (id: string) => `/payables/${id}/payments`,
  ME: '/payables/me',
  ME_ITEMS: '/payables/me/items',
} as const;
```

### Interface Mapping Summary

| HTTP Method | Endpoint                                | Request                   | Response                               | Frontend Usage                               |
| ----------- | --------------------------------------- | ------------------------- | -------------------------------------- | -------------------------------------------- |
| GET         | /api/payables/summary                   | -                         | `GlobalPayableSummary`                 | Admin summary cards                          |
| GET         | /api/payables/merchants                 | `PayablesSearchParams`    | `PagedResponse<MerchantPayableList>`   | Merchants table                              |
| GET         | /api/payables/merchants/:id             | -                         | `MerchantPayableSummary`               | Merchant dialog header                       |
| GET         | /api/payables/merchants/:id/items       | `PayablesSearchParams`    | `PagedResponse<PendingPayablePayment>` | Items in merchant dialog                     |
| POST        | /api/payables/:id/pay                   | `RegisterPaymentRequest`  | `PaymentResultResponse`                | Single payment                               |
| GET         | /api/payables/:id/payments              | -                         | `PayablePaymentResponse[]`             | Full payment audit history (USER/ADMIN only) |
| POST        | /api/payables/merchants/:id/pay-all     | `PayAllVendorRequest`     | `BulkPaymentResult`                    | Pay all for merchant                         |
| POST        | /api/payables/merchants/:id/pay-partial | `PayPartialVendorRequest` | `BulkPaymentResult`                    | Pay partial for merchant                     |
| GET         | /api/payables/:id                       | -                         | `PayableDetail`                        | Payable detail / payment summary             |
| GET         | /api/payables/me                        | -                         | `MerchantPayableSummary`               | Merchant summary cards                       |
| GET         | /api/payables/me/items                  | `PayablesSearchParams`    | `PagedResponse<PendingPayablePayment>` | Merchant items table                         |

### Search Params Interface

```typescript
export interface PayablesSearchParams extends PaginationParams {
  search?: string;
  status?: string; // 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | omit for ALL
  merchantId?: string;
  fromDate?: string;
  toDate?: string;
}
```

**Note on status filtering**: The API service omits the `status` param when the value is `'ALL'` — the backend then returns all statuses (`PENDING`, `PARTIALLY_PAID`, and `PAID`).

---

## Validation Rules

### Payment Form Validations

| Field           | Type   | Required | Rules                    | Error Message                                                          |
| --------------- | ------ | -------- | ------------------------ | ---------------------------------------------------------------------- |
| `amount`        | number | Yes      | > 0, <= remainingBalance | "El monto debe ser mayor a cero / no puede exceder el saldo pendiente" |
| `paymentMethod` | enum   | Yes      | Valid SettlementMethod   | "El método de pago es requerido"                                       |
| `reference`     | string | No       | max 100 chars            | "La referencia no puede exceder 100 caracteres"                        |

### Custom Validators (`PayablePaymentValidators`)

**File**: `validators/payable-payment.validators.ts`

```typescript
export class PayablePaymentValidators {
  static maxAmount(maxBalance: number): ValidatorFn; // value <= maxBalance
  static notFutureDate(): ValidatorFn; // date <= today (23:59:59)
  static positiveAmount(): ValidatorFn; // value > 0
  static maxLength(max: number): ValidatorFn; // string.length <= max
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/payables-api.service.ts`

```typescript
export interface PayablesSearchParams extends PaginationParams {
  search?: string;
  status?: string;
  merchantId?: string;
  fromDate?: string;
  toDate?: string;
}

@Injectable({ providedIn: 'root' })
export class PayablesApiService {
  getGlobalSummary(): Observable<GlobalPayableSummary>;
  searchMerchantsWithPayables(
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<MerchantPayableList>>;
  getMerchantPayable(merchantId: string): Observable<MerchantPayableSummary>;
  getMerchantItems(
    merchantId: string,
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<PendingPayablePayment>>;
  getPayableById(payableId: string): Observable<PayableDetail>;
  getPayablePayments(payableId: string): Observable<PayablePaymentResponse[]>; // USER/ADMIN only
  registerPayment(
    payableId: string,
    request: RegisterPaymentRequest,
  ): Observable<PaymentResultResponse>;
  payAllMerchant(merchantId: string, request: PayAllVendorRequest): Observable<BulkPaymentResult>;
  payPartialMerchant(
    merchantId: string,
    request: PayPartialVendorRequest,
  ): Observable<BulkPaymentResult>;
  getMyPayables(): Observable<MerchantPayableSummary>;
  getMyItems(params?: PayablesSearchParams): Observable<PagedResponse<PendingPayablePayment>>;
}
```

---

### Application Service (Application Layer)

**File**: `services/application/payables-application.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class PayablesApplicationService {
  // Role detection
  readonly isMerchant = computed(() => this.authService.isMerchant());

  // State signals
  readonly globalSummary = signal<GlobalPayableSummary | null>(null);
  readonly merchants = signal<MerchantPayableList[]>([]);
  readonly currentMerchant = signal<MerchantPayableSummary | null>(null);
  readonly merchantItems = signal<PendingPayablePayment[]>([]);
  readonly currentPayableDetail = signal<PayableDetail | null>(null);
  readonly currentPayablePayments = signal<PayablePaymentResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly loadingItems = signal<boolean>(false);
  readonly loadingBulkPayment = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Pagination signals
  readonly merchantsPagination = signal<PaginationState>({...});
  readonly itemsPagination = signal<PaginationState>({...});

  // Methods
  loadGlobalSummary(): Observable<GlobalPayableSummary>
  searchMerchantsWithPayables(params?: PayablesSearchParams): Observable<PagedResponse<MerchantPayableList>>
  loadMerchantPayable(merchantId: string): Observable<MerchantPayableSummary>
  loadMerchantItems(merchantId: string, params?: PayablesSearchParams): Observable<PagedResponse<PendingPayablePayment>>
  loadPayableDetail(payableId: string): Observable<PayableDetail>
  loadPayablePayments(payableId: string): Observable<PayablePaymentResponse[]>  // USER/ADMIN only
  registerPayment(payableId: string, request: RegisterPaymentRequest): Observable<PaymentResultResponse>
  payAllMerchant(merchantId: string, request: PayAllVendorRequest): Observable<BulkPaymentResult>
  payPartialMerchant(merchantId: string, request: PayPartialVendorRequest): Observable<BulkPaymentResult>
  loadMyPayables(): Observable<MerchantPayableSummary>
  loadMyItems(params?: PayablesSearchParams): Observable<PagedResponse<PendingPayablePayment>>
  clearCurrentMerchant(): void
  clearCurrentPayableDetail(): void
  clearError(): void
}
```

**Key design notes**:

- `isMerchant` is a `computed` signal derived from `AuthService`
- `loadingItems` is separate from `loading` for granular UX control
- `loadingBulkPayment` is separate for the bulk payment dialog
- Error handling includes 409 Conflict detection with specific messages
- All methods use `MessageService` (PrimeNG Toast) for success/error notifications

---

### Component: MerchantPayablesDialogComponent

**File**: `components/merchant-payables-dialog/`

**Selector**: `app-merchant-payables-dialog`

**Inputs**:

- `visible: boolean` (required)
- `merchant: MerchantPayableList | null` (required)

**Outputs**:

- `close: void`
- `registerPayment: PendingPayablePayment`
- `viewPaymentDetail: string` (payableId)
- `bulkPayment: { mode: 'total' | 'partial' }`

**Behavior**:

- Loads merchant items when opened (`effect` on visible + merchant)
- Status filter dropdown (ALL / PENDING / PARTIALLY_PAID / PAID) — uses `p-select`
- Per-row buttons: "Registrar Pago" (PENDING and PARTIALLY_PAID only), "Ver Pago" (PAID only)
- Bulk payment buttons: "Pagar Todo" and "Pago Parcial"

---

### Component: PayablePaymentFormDialogComponent

**File**: `components/payment-form-dialog/`

**Selector**: `app-payable-payment-form-dialog`

**Inputs**:

- `visible: boolean` (required)
- `payment: PendingPayablePayment | null` (required)

**Outputs**:

- `close: void`
- `confirm: RegisterPaymentRequest`

**Behavior**:

- Pre-fills `amount` with `payment.remainingBalance`
- Defaults `paymentMethod` to `SettlementMethod.TRANSFER`
- Validates amount > 0 and <= remainingBalance
- Emits `RegisterPaymentRequest` on confirm

---

### Component: PayablePaymentHistoryDialogComponent

**File**: `components/payment-history-dialog/`

**Selector**: `app-payable-payment-history-dialog`

**Inputs**:

- `visible: boolean` (required)
- `payableId: string` (required)

**Outputs**:

- `close: void`

**Behavior**:

- Loads payable detail via `PayablesApiService.getPayableById()` for commission summary
- Loads full payment audit history via `PayablesApiService.getPayablePayments()` (`GET /api/payables/{id}/payments`)
- Shows each payment transaction: date, amount, method, reference, who paid
- Read-only view (USER/ADMIN only — not visible to MERCHANT)

---

### Component: MerchantBulkPaymentDialogComponent

**File**: `components/merchant-bulk-payment-dialog/`

**Selector**: `app-merchant-bulk-payment-dialog`

**Inputs**:

- `visible: boolean` (required)
- `merchant: MerchantPayableList | null` (required)
- `mode: 'total' | 'partial'` (required)

**Outputs**:

- `close: void`
- `confirm: PayAllVendorRequest | PayPartialVendorRequest`

**Behavior**:

- `mode = 'total'`: hides amount field, emits `PayAllVendorRequest`
- `mode = 'partial'`: shows amount field pre-filled with totalPending, emits `PayPartialVendorRequest`
- Uses `computed()` to read `currentMerchant()` from service for live totalPending

---

## Routes Configuration

```typescript
// router/payables.routes.ts
export const PAYABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/payables-page/payables-page.component').then(
            (m) => m.PayablesPageComponent,
          ),
      },
    ],
  },
];
```

**Note**: Single route `/payables`. There are no sub-routes — role detection happens inside `PayablesPageComponent` via `service.isMerchant()`.

---

## Messages

```typescript
// messages/payables.messages.ts

export const PAYABLES_SUCCESS_MESSAGES = {
  PAYMENT_REGISTERED: 'Pago registrado exitosamente',
  BULK_PAYMENT_REGISTERED: 'Pagos registrados exitosamente',
};

export const PAYABLES_ERROR_MESSAGES = {
  SUMMARY_LOAD_ERROR: 'Error al cargar el resumen de cuentas por pagar',
  MERCHANTS_LOAD_ERROR: 'Error al cargar la lista de vendedores con cuentas pendientes',
  MERCHANT_NOT_FOUND: 'No se pudo cargar la información del vendedor',
  ITEMS_LOAD_ERROR: 'Error al cargar las facturas del vendedor',
  PAYABLE_DETAIL_LOAD_ERROR: 'Error al cargar el detalle de la cuenta por pagar',
  PAYMENT_ERROR: 'Error al registrar el pago. Por favor, intente nuevamente.',
  PAYMENT_ALREADY_PAID: 'Esta factura ya fue pagada anteriormente.',
  BULK_PAYMENT_ERROR: 'Error al registrar los pagos. Por favor, intente nuevamente.',
  BULK_PAYMENT_ALREADY_PAID: 'Uno o más pagos ya fueron procesados anteriormente.',
  NO_PENDING_INVOICES: 'El vendedor no tiene facturas pendientes de pago.',
};

export const PAYABLES_VALIDATION_MESSAGES = {
  AMOUNT_REQUIRED: 'El monto es requerido',
  AMOUNT_POSITIVE: 'El monto debe ser mayor a cero',
  AMOUNT_EXCEEDS_MAX: 'El monto excede el saldo pendiente',
  PAYMENT_METHOD_REQUIRED: 'El método de pago es requerido',
  REFERENCE_MAX_LENGTH: 'La referencia no puede exceder 100 caracteres',
};

export const PAYABLES_INFO_MESSAGES = {
  NO_MERCHANTS_WITH_PENDING: 'No hay vendedores con cuentas pendientes',
  NO_ITEMS_PENDING: 'No hay facturas pendientes',
  LOADING_DATA: 'Cargando información...',
  PROCESSING_PAYMENT: 'Procesando pago...',
};
```

---

## Business Rules

### Payable Creation

1. Payable is created automatically when Collection is created (payment approved)
2. One-to-one relationship: 1 Collection = 1 Payable
3. All financial data is a snapshot from Collection at creation time
4. Initial status is always PENDING
5. Cannot manually create payables

### Payment Rules

1. Only USER/ADMIN can register payments
2. **MERCHANT cannot pay their own commissions** — strict business rule
3. Amount must be > 0 and <= remainingBalance
4. **Partial payments are supported**: a single payable can receive multiple payments over time
5. When `amountPaid < commissionAmount` (and > 0), status transitions to `PARTIALLY_PAID`
6. When `amountPaid >= commissionAmount`, status transitions to `PAID` (terminal state)
7. 409 Conflict returned if payable is already fully `PAID`
8. The payment date is set automatically to `LocalDate.now()` server-side — it is NOT provided by the client
9. Every payment transaction writes an immutable `PayablePayment` audit record

### Role-Based Access

1. **USER/ADMIN**: Full access — see all merchants, register single/bulk payments, view payment audit history
2. **USER/ADMIN**: Uses `/summary`, `/merchants`, `/merchants/:id`, `/merchants/:id/items`, `/:id/payments` endpoints
3. **MERCHANT**: Uses **dedicated `/me` endpoints** exclusively
   - `GET /api/payables/me` → own summary
   - `GET /api/payables/me/items` → own payables list with status filter
4. **MERCHANT**: View-only — no payment actions available at all
5. Frontend for MERCHANT role must use `loadMyPayables()` and `loadMyItems()` — never the admin methods

### 409 Conflict Handling

When a payment operation returns HTTP 409:

- Single payment: "Esta factura ya fue pagada anteriormente."
- Bulk payment: "Uno o más pagos ya fueron procesados anteriormente."

---

## Testing Requirements

### Unit Tests

- [ ] PayablePaymentValidators tested (maxAmount, positiveAmount, maxLength, notFutureDate)
- [ ] API service HTTP calls mocked and verified
- [ ] Application service state management tested (signals updated correctly)
- [ ] `isMerchant` computed signal tested with AuthService mock

### Component Tests

- [ ] Payables page renders merchant table for USER/ADMIN
- [ ] Payables page renders items table for MERCHANT (view-only)
- [ ] Merchant payables dialog opens and loads items
- [ ] Payment form dialog validates correctly
- [ ] Bulk payment dialog handles total vs partial mode
- [ ] Error handling displays toast messages

### Integration Tests

- [ ] Full single payment workflow (open dialog → fill form → confirm → refresh)
- [ ] Bulk pay-all workflow
- [ ] Bulk pay-partial workflow
- [ ] MERCHANT self-view (no payment buttons visible)
- [ ] 409 Conflict error handling
- [ ] Pagination on both merchant list and items list

---

## Related Modules

- [Collections](./collections.md) - Source of payable data (1:1 relationship)
- [Receivables](./receivables.md) - Payment approval triggers collection → payable chain
- [Merchants](./merchants.md) - Payable recipient, commission owner
- [Invoices](./invoices.md) - Invoice reference for context
- [Customers](./customers.md) - Customer reference for context

---

## Notes

### Important Considerations

1. **Auto-Generated Records**: Payables are NEVER manually created. They are automatically generated when a Collection is created (which happens when a Receivables payment is approved).

2. **Snapshot Pattern**: All merchant/invoice/customer data is captured at creation time. Changes to the original entities don't affect existing payables.

3. **Single Page Architecture**: Unlike the original design (3 pages with separate routes), the actual implementation uses a **single `PayablesPageComponent`** that renders different UIs based on `service.isMerchant()`. There are no sub-routes.

4. **Payment vs Settlement**: The original design called it "settlement" (`settle`, `SETTLED`). The actual backend uses three statuses: `PENDING`, `PARTIALLY_PAID`, and `PAID`. There is **no `SETTLED` status** in the backend — this was a design artifact. The frontend must use `PARTIALLY_PAID` for the intermediate state.

5. **Partial Payments**: Unlike a simple PENDING → PAID flow, payables support partial payments. A payable can accumulate multiple payments over time, each writing an immutable `PayablePayment` audit record. The `payables` table stores `amountPaid` cumulatively, while the `payable_payments` table provides the full history. Use `GET /api/payables/{id}/payments` for the complete audit trail.

6. **Role-Based Access**:
   - MERCHANT uses **dedicated `/me` endpoints** (`/api/payables/me` and `/api/payables/me/items`)
   - USER/ADMIN uses `/merchants` endpoints to see all merchants
   - **MERCHANT cannot register payments** — no payment UI should be shown for MERCHANT role

7. **Bulk Payment modes**:
   - `'total'` → calls `payAllMerchant()` → `POST /merchants/:id/pay-all` → no amount in request
   - `'partial'` → calls `payPartialMerchant()` → `POST /merchants/:id/pay-partial` → amount required

8. **`loadingBulkPayment` vs `loading`**: The bulk payment dialog uses `loadingBulkPayment` signal to avoid blocking the entire UI during a bulk operation.

### Common Patterns

- Use `service.isMerchant()` computed signal to conditionally render sections
- Clear current merchant state before opening a new merchant dialog: `service.clearCurrentMerchant()`
- After any payment operation: refresh both merchant detail and merchant items list
- After payment registration: also refresh the global merchant list (totalPending updates)
- Dialog visibility controlled via `signal<boolean>` in the page component

---

**Last Updated**: 2026-03-14

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
