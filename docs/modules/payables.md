# Payables (Cuentas por Pagar) — Frontend

Cuentas por Pagar es el espejo de Cuentas por Cobrar aplicado a compras y
proveedores. La UI debe replicar exactamente la de
`features/finance/treasury/receivables` cambiando cliente -> proveedor,
factura -> compra y cobro -> pago.

> Backend contract: `/home/gabriel/Documents/Work/Personals/Cashly/cashly-api/docs/modules/PAYABLES.md`
>
> API base paths: `/api/payables`, `/api/supplier-payments`,
> `/api/reports/finance/accounts-payable/pdf`.

## Backend endpoints available today

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/api/payables/summary` | `FINANCE_TREASURY_PAYABLES_VIEW_LIST` |
| GET | `/api/payables/suppliers?search&page&size&sort&action` | `..._VIEW_LIST` |
| GET | `/api/payables/suppliers/{id}` | `..._VIEW_DEBT` |
| GET | `/api/payables/suppliers/{id}/purchases?search&status&page&size` | `..._VIEW_DEBT` |
| GET | `/api/payables/payments/history?search&page&size` | `..._VIEW_DEBT` |
| GET | `/api/payables/suppliers/{id}/payment-history?purchaseId` | `..._VIEW_DEBT` |
| POST | `/api/supplier-payments` | `..._PAY_WITH_VALIDATION` |
| POST | `/api/supplier-payments/purchases/{purchaseId}/pay` | `..._PAY_DIRECT` |
| POST | `/api/supplier-payments/suppliers/{supplierId}/pay-all` | `..._PAY_ALL` |
| POST | `/api/supplier-payments/suppliers/{supplierId}/pay-partial` | `..._PARTIAL_PAYMENT` |
| POST | `/api/supplier-payments/{id}/approve` | `..._APPROVE_PAYMENT` |
| POST | `/api/supplier-payments/{id}/reject` | `..._REJECT_PAYMENT` |
| DELETE | `/api/supplier-payments/{id}` | `..._DELETE` |
| GET | `/api/reports/finance/accounts-payable/pdf?supplierId&overdueOnly` | `..._REPORT_PDF` |

## Files to create (mirror of receivables)

```
src/app/features/finance/treasury/payables/
├── index.ts
├── routing/{payables.routes.ts,index.ts}
├── permissions/{payable.permissions.ts,index.ts}
├── models/interfaces/
│   ├── global-payable-summary.interface.ts
│   ├── supplier-debt-list.interface.ts
│   ├── supplier-debt-summary.interface.ts
│   ├── supplier-purchase-debt.interface.ts
│   ├── supplier-payment.interface.ts
│   ├── payment-request.interface.ts
│   └── payment-result.interface.ts
├── services/
│   ├── api/payables-api.service.ts
│   └── application/payables-application.service.ts
├── pages/payables-page/{payables-page.component.ts,.html}
├── components/
│   ├── supplier-debt-dialog/
│   ├── supplier-payment-form-dialog/
│   ├── payment-history-dialog/
│   ├── pending-supplier-payments-tab/
│   └── index.ts
├── reporting/
│   ├── models/interfaces/index.ts
│   ├── services/api/payables-pdf-api.service.ts
│   └── components/accounts-payable-pdf-modal/
├── navigation/{payable.list-navigation.ts,payable.lookup.ts}
├── actions/navigation.provider.ts
├── messages/{error-messages.ts,success-messages.ts,index.ts}
├── i18n/{es.json,en.json}
└── components/index.ts
```

## Routes (app.routes.ts) — with comments

Add the legacy redirect next to the receivables one:

```ts
legacyRoute('payables', 'finance/treasury/payables'),
```

Add the lazy route inside the `treasury` children:

```ts
{
  path: 'payables',
  loadChildren: () =>
    import('@features/finance/treasury/payables/routing').then(
      (m) => m.PAYABLES_ROUTES,
    ),
},
```

`payables.routes.ts` mirror of `receivables.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PAYABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE_PAYABLES },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/treasury/payables/pages/payables-page/payables-page.component'
          ).then((m) => m.PayablesPageComponent),
        title: 'Cuentas por Pagar',
      },
    ],
  },
];
```

## BusinessModule

Add to `business-module.enum.ts`:

```ts
FINANCE_PAYABLES = 'FINANCE_PAYABLES',
```

Label map:

```ts
[BusinessModule.FINANCE_PAYABLES]: 'platform.auth.financePayables',
```

Add the translation in `core/i18n` dictionaries and in `core/layouts/i18n`
(`es.json` / `en.json`).

## Menu (menu.config.ts) — with comments

Inside the `Tesorería` group, right after Cuentas por cobrar:

```ts
withReports(
  page(
    'Cuentas por pagar',
    'pi pi-wallet',
    '/finance/treasury/payables',
    BusinessModule.FINANCE_PAYABLES,
  ),
  report(
    'Cuentas por Pagar PDF',
    'pi pi-file-pdf',
    callbacks.openAccountsPayablePdfModal, // wire in main-layout callbacks
    BusinessModule.FINANCE_PAYABLES,
  ),
),
```

Register the PDF modal callback in `main-layout.component.ts` and
`core/navigation/providers/report-action-handlers.providers.ts`, mirroring
`openAccountsReceivablePdfModal`.

## Permissions

`payable.permissions.ts`:

```ts
export enum PayablePermission {
  VIEW_LIST = 'FINANCE_TREASURY_PAYABLES_VIEW_LIST',
  VIEW_DEBT = 'FINANCE_TREASURY_PAYABLES_VIEW_DEBT',
  REPORT_PDF = 'FINANCE_TREASURY_PAYABLES_REPORT_PDF',
  PAY_ALL = 'FINANCE_TREASURY_PAYABLES_PAY_ALL',
  PARTIAL_PAYMENT = 'FINANCE_TREASURY_PAYABLES_PARTIAL_PAYMENT',
  PAY_DIRECT = 'FINANCE_TREASURY_PAYABLES_PAY_DIRECT',
  PAY_WITH_VALIDATION = 'FINANCE_TREASURY_PAYABLES_PAY_WITH_VALIDATION',
  REFUND = 'FINANCE_TREASURY_PAYABLES_REFUND',
  ADVANCE = 'FINANCE_TREASURY_PAYABLES_ADVANCE',
  APPROVE_PAYMENT = 'FINANCE_TREASURY_PAYABLES_APPROVE_PAYMENT',
  REJECT_PAYMENT = 'FINANCE_TREASURY_PAYABLES_REJECT_PAYMENT',
  EDIT = 'FINANCE_TREASURY_PAYABLES_EDIT',
  DELETE = 'FINANCE_TREASURY_PAYABLES_DELETE',
}
```

## Models (mirror backend DTOs)

```ts
export interface GlobalPayableSummary {
  totalDebt: number;
  totalSuppliersWithDebt: number;
  totalPurchasesWithDebt: number;
  totalPendingValidationAmount: number;
  totalSupplierBalance: number;
  calculatedAt: string;
}

export interface SupplierDebtList {
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  totalDebt: number;
  pendingPaymentsAmount: number;
  pendingPurchasesCount: number;
  oldestDueDate: string | null;
  creditDays: number;
  creditLimit: number;
  availableCredit: number;
  supplierBalance: number;
}

export interface SupplierPurchaseDebt {
  purchaseId: string;
  purchaseNumber: string;
  status: string;
  paymentType: 'CASH' | 'CREDIT';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  returnedTotal: number;
  totalPaid: number;
  total: number;
  balance: number;
  pendingPaymentId: string | null;
  pendingPaymentStatus: string | null;
}

export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  appliedAmount: number;
  paymentMethodName: string;
  status: string;
  source: string;
  paymentDate: string;
  createdAt: string;
  purchaseNumber: string | null;
}
```

## API service

`PayablesApiService` mirrors `ReceivablesApiService`:

- `getGlobalSummary()` -> GET `/api/payables/summary`
- `searchSuppliersWithDebt(params)` -> GET `/api/payables/suppliers`
- `getSupplierDebt(supplierId)` -> GET `/api/payables/suppliers/{id}`
- `getSupplierPurchases(supplierId, params)` -> GET `.../purchases`
- `getPaymentHistory(params)` -> GET `/api/payables/payments/history`
- `getSupplierPaymentHistory(supplierId, params)` -> GET `.../payment-history`
- `createPayment(request)` -> POST `/api/supplier-payments`
- `payPurchase(purchaseId, request)` -> POST `.../purchases/{id}/pay`
- `payAllSupplierDebt(supplierId, request)` -> POST `.../suppliers/{id}/pay-all`
- `payPartialDebt(supplierId, request)` -> POST `.../suppliers/{id}/pay-partial`
- `approvePayment(id, reason)` / `rejectPayment(id, reason)`
- `listPendingPayments()` -> GET `/api/supplier-payments?status=PENDING`

`PayablesPdfApiService`:

```ts
getAccountsPayablePdf(filters: { supplierId?: string; overdueOnly?: boolean }) {
  // GET `${environment.apiUrl}/reports/finance/accounts-payable/pdf` as blob
}
```

## UX / design (identical to receivables)

- `PageHeaderComponent` with kicker/title/subtitle.
- Three `MetricCardComponent`:
  - Deuda Total (`totalDebt`)
  - Compras Pendientes (`totalPurchasesWithDebt`)
  - Proveedores con Deuda (`totalSuppliersWithDebt`)
- `PanelCardComponent` with two tabs:
  - `Proveedores con deuda`
  - `Pagos en validación`
- Desktop `p-table` + mobile `app-panel-card` list, exactly like receivables.
- Actions per row:
  - Ver deuda
  - Pagar todo
  - Pago parcial
  - Pagar con validación
  - Reintegro / Anticipo (only when `supplierBalance > 0`)
- `LocalizedCurrencyPipe` for money, `app-paginator`, `app-search-field`,
  skeletons for loading.
- Dialogs: supplier debt dialog with purchase table, payment form dialog,
  payment history dialog, pending payments tab.

## i18n keys

Create `finance.treasury.payables.*` mirroring
`finance.treasury.receivables.*`, for example:

```json
{
  "finance.treasury.payables.accountsPayable": "Cuentas por Pagar",
  "finance.treasury.payables.manageSupplierDebtAndPendingPayments": "Gestiona las deudas con proveedores y pagos pendientes",
  "finance.treasury.payables.totalDebt": "Deuda Total",
  "finance.treasury.payables.outstandingPurchases": "Compras Pendientes",
  "finance.treasury.payables.suppliersWithDebt": "Proveedores con Deuda",
  "finance.treasury.payables.paymentsAwaitingReview": "Pagos en Validación",
  "finance.treasury.payables.searchByNameOrTaxId": "Buscar por nombre o RIF...",
  "finance.treasury.payables.creditLimit": "Límite de Crédito",
  "finance.treasury.payables.availableCredit": "Crédito Disponible",
  "finance.treasury.payables.supplierBalance": "Saldo a Favor",
  "finance.treasury.payables.noSuppliersWithDebt": "No hay proveedores con deuda",
  "finance.treasury.payables.viewDebt": "Ver deuda",
  "finance.treasury.payables.payAll": "Pagar todo",
  "finance.treasury.payables.partialPayment": "Pago parcial",
  "finance.treasury.payables.payWithValidation": "Pagar con validación",
  "finance.treasury.payables.refund": "Reintegro",
  "finance.treasury.payables.advance": "Generar anticipo",
  "finance.treasury.payables.approvePayment": "Aprobar pago",
  "finance.treasury.payables.rejectPayment": "Rechazar pago"
}
```

## Navigation providers (extra comments)

Register the module in the four navigation registries, mirroring receivables:

1. `core/navigation/providers/lookup-definitions.providers.ts` ->
   `PAYABLE_LOOKUP`.
2. `core/navigation/providers/navigation-action-handlers.providers.ts` ->
   payable actions (`provideNavigationActionHandlers`).
3. `core/navigation/providers/report-action-handlers.providers.ts` ->
   accounts payable PDF.
4. `core/navigation/list-navigation.registry.ts` -> `PAYABLE_LIST_NAVIGATION`.

## Testing

- `payables-api.service.spec.ts` (payloads and query params).
- `payables-application.service.spec.ts` (signals and error handling).
- `payables-page.component.spec.ts` (tabs, search, pagination, actions).
- `payables-presentation.spec.ts` (mirror of `receivables-presentation.spec.ts`).
- Route spec in `app.routes.spec.ts` and menu spec in `menu.config.spec.ts`.

## Extra implementation notes

- Use standalone components, `ChangeDetectionStrategy.OnPush` and signals,
  exactly like `ReceivablesPageComponent`.
- Respect the existing auth interceptor: never add the JWT manually.
- The backend already computes `availableCredit` and `supplierBalance`; do not
  recalculate them in the UI.
- `paymentType` on a purchase is `CASH` or `CREDIT`. Show a badge so the user
  knows whether a purchase is cash or credit.
- `oldestDueDate` drives the "vencida" indicator. Compare with today on the
  client only for visual hints; the backend already filters debt.
- The PDF endpoint returns `application/pdf`; reuse `PdfViewerService`.
- Do not duplicate the receivables components; copy them and rename types to
  keep the same UX and code style.
