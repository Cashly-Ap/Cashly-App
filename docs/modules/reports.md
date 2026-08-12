# Reports Module

## Overview

The Reports module provides a comprehensive set of downloadable PDF reports across all major business areas: **Customers**, **Products**, **Sales**, and **Sales Representatives**.

Reports open inside a **`p-dialog` modal** triggered from either the navbar menu or the landing page. There are no dedicated routes per report — all 15 report components are loaded dynamically inside a single shared dialog.

Reports are grouped into four main categories:

| Category                  | Reports                                                                                         | Count |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| **Customers**             | Customer List, Account Statement (Summary & Detailed), Aging Analysis, Accounts Receivable      | 4     |
| **Products**              | Product Labels, Product List, Product Catalog, Stock Inventory, Inventory Movements, Price List | 6     |
| **Sales**                 | Cash Reconciliation, Sales Breakdown                                                            | 2     |
| **Sales Representatives** | Representative List, Sales by Representative, Collections by Representative                     | 3     |

**Key Concepts**:

- **PDF-Only**: Every report page shows a filter form and a single **"Generar PDF"** button. There is no JSON/table preview in any report component.
- **Dialog-Based**: Reports open inside a `p-dialog` modal via `ReportsDialogService` — no route navigation
- **PDF Download**: The API returns `application/pdf` binary content; the browser download is triggered via a blob URL
- **Role-Scoped**: MERCHANT role sees only their own data; `showCostPrice` is ADMIN only
- **Authentication Required**: All report endpoints require a valid JWT token
- **`appendTo="body"`**: All `p-datepicker` and `p-select` inside report components use `appendTo="body"` to prevent dropdown clipping inside the dialog

**Module Type**: `Read-Only` (no create, update, or delete operations)

---

## Module Structure

```
src/app/features/reports/
├── customers/
│   ├── models/
│   │   ├── interfaces/
│   │   │   ├── customer-list-report.interface.ts
│   │   │   ├── customer-statement-report.interface.ts
│   │   │   ├── aging-report.interface.ts
│   │   │   ├── receivables-report.interface.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── pages/
│       ├── customer-list-report-page/
│       ├── customer-statement-report-page/
│       ├── aging-report-page/
│       └── receivables-report-page/
├── products/
│   ├── models/
│   │   ├── interfaces/
│   │   │   ├── product-list-report.interface.ts
│   │   │   ├── stock-report.interface.ts
│   │   │   ├── movements-report.interface.ts
│   │   │   ├── price-list-report.interface.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── pages/
│       ├── product-labels-report-page/
│       ├── product-list-report-page/
│       ├── product-catalog-report-page/
│       ├── stock-report-page/
│       ├── movements-report-page/
│       └── price-list-report-page/
├── sales/
│   ├── models/
│   │   ├── interfaces/
│   │   │   ├── cash-reconciliation-report.interface.ts
│   │   │   ├── sales-breakdown-report.interface.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── pages/
│       ├── cash-reconciliation-report-page/
│       └── sales-breakdown-report-page/
├── merchants/
│   ├── models/
│   │   ├── interfaces/
│   │   │   ├── merchant-list-report.interface.ts
│   │   │   ├── merchant-sales-report.interface.ts
│   │   │   ├── merchant-collections-report.interface.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── pages/
│       ├── merchant-list-report-page/
│       ├── merchant-sales-report-page/
│       └── merchant-collections-report-page/
├── models/
│   ├── enums/
│   │   ├── report-format.enum.ts
│   │   ├── movement-type.enum.ts
│   │   └── index.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── reports-customer-api.service.ts
│   │   ├── reports-product-api.service.ts
│   │   ├── reports-sales-api.service.ts
│   │   ├── reports-merchant-api.service.ts
│   │   └── index.ts
│   ├── reports-dialog.service.ts          # Dialog orchestration service
│   └── index.ts
├── pages/
│   └── reports-landing-page/              # Reports hub with category cards
├── router/
│   └── reports.routes.ts                  # Only landing page route
└── index.ts
```

---

## Dialog Architecture

### ReportsDialogService

The central service that controls which report is shown inside the shared `p-dialog`.

```typescript
// src/app/features/reports/services/reports-dialog.service.ts
@Injectable({ providedIn: 'root' })
export class ReportsDialogService {
  activeComponent: Type<unknown> | null = null;
  activeTitle: string = '';
  dialogVisible: boolean = false;

  open(component: Type<unknown>, title: string): void {
    this.activeComponent = component;
    this.activeTitle = title;
    this.dialogVisible = true;
  }

  close(): void {
    this.dialogVisible = false;
  }
}
```

**Important implementation notes**:

- Uses plain class properties (NOT signals) — PrimeNG `p-dialog` `[(visible)]` requires two-way binding on a plain boolean, not a signal
- `(onHide)` must be used instead of `(visibleChange)` to reset state on close — `visibleChange` also fires on open

### p-dialog in MainLayoutComponent

The dialog is rendered **inside** `<app-main-layout>` (not outside):

```html
<!-- main-layout.component.html -->
<p-dialog
  [(visible)]="reportsDialog.dialogVisible"
  [header]="reportsDialog.activeTitle"
  [modal]="true"
  [style]="{ width: '780px', 'max-width': '95vw' }"
  [draggable]="false"
  [resizable]="false"
  (onHide)="reportsDialog.close()"
>
  @if (reportsDialog.activeComponent) {
  <ng-container [ngComponentOutlet]="reportsDialog.activeComponent" />
  }
</p-dialog>
```

**Note**: Use `[ngComponentOutlet]="component"` (directive syntax), NOT `<ng-component-outlet>` — Angular 21 compatibility.

### Opening a Report

From the navbar menu (`menu.config.ts`), the config is built as a **function** (not a module-level constant) to allow injection of `ReportsDialogService`:

```typescript
export function buildMenuItems(reportsDialog: ReportsDialogService): MenuItem[] {
  return [
    {
      label: 'Cuadre de Caja',
      icon: 'pi pi-wallet',
      command: () => reportsDialog.open(CashReconciliationReportPageComponent, 'Cuadre de Caja'),
    },
    // ...
  ];
}
```

From the landing page:

```typescript
// reports-landing-page.component.ts
protected openReport(component: Type<unknown>, title: string): void {
  this.reportsDialog.open(component, title);
}
```

---

## API Endpoints

### Endpoint Summary

| Method | Endpoint                               | Description                   | Roles                       |
| ------ | -------------------------------------- | ----------------------------- | --------------------------- |
| GET    | /api/reports/customers/list            | Customer list report          | USER, ADMIN                 |
| GET    | /api/reports/customers/{id}/statement  | Customer account statement    | USER, ADMIN                 |
| GET    | /api/reports/customers/aging           | Customer aging analysis       | USER, ADMIN                 |
| GET    | /api/reports/customers/receivables     | Accounts receivable           | USER, ADMIN                 |
| GET    | /api/reports/products/labels           | Product labels (PDF only)     | USER, ADMIN                 |
| GET    | /api/reports/products/list             | Product list report           | USER, ADMIN                 |
| GET    | /api/reports/products/catalog          | Product catalog (PDF only)    | USER, ADMIN                 |
| GET    | /api/reports/products/stock            | Stock inventory report        | USER, ADMIN                 |
| GET    | /api/reports/products/movements        | Inventory movements report    | USER, ADMIN                 |
| GET    | /api/reports/products/price-list       | Price list report             | USER, ADMIN                 |
| GET    | /api/reports/sales/cash-reconciliation | Cash reconciliation report    | USER, ADMIN                 |
| GET    | /api/reports/sales/breakdown           | Sales breakdown report        | USER, ADMIN                 |
| GET    | /api/reports/merchants/list            | Sales representative list     | USER, ADMIN                 |
| GET    | /api/reports/merchants/sales           | Sales by representative       | USER, ADMIN, MERCHANT (own) |
| GET    | /api/reports/merchants/collections     | Collections by representative | USER, ADMIN, MERCHANT (own) |

**All endpoints accept `format=pdf`** — the API returns `application/pdf` binary content. The frontend always calls with `format=pdf` and `responseType: 'blob'`.

---

## Customer Reports

### GET /api/reports/customers/list

**Purpose**: Filterable list of all customers.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter | Type    | Required | Description                                          |
| --------- | ------- | -------- | ---------------------------------------------------- |
| active    | boolean | No       | Filter by active status                              |
| type      | string  | No       | `INDIVIDUAL`, `BUSINESS`, `GOVERNMENT`, `NON_PROFIT` |
| search    | string  | No       | Search by legal name, alias, or RIF                  |
| format    | string  | No       | `pdf`                                                |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="customer-list-{date}.pdf"`

---

### GET /api/reports/customers/{customerId}/statement

**Purpose**: Customer account statement showing invoices and payments in a date range.

**Roles**: USER, ADMIN

**Path Parameters**:

| Parameter  | Type | Description                |
| ---------- | ---- | -------------------------- |
| customerId | UUID | Customer unique identifier |

**Query Parameters**:

| Parameter | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| from      | string | Yes      | Start date `YYYY-MM-DD`           |
| to        | string | Yes      | End date `YYYY-MM-DD`             |
| mode      | string | No       | `summary` (default) or `detailed` |
| format    | string | No       | `pdf`                             |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="statement-{customerId}-{date}.pdf"`

---

### GET /api/reports/customers/aging

**Purpose**: Aging analysis of outstanding customer balances by time buckets.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter  | Type   | Required | Description                                  |
| ---------- | ------ | -------- | -------------------------------------------- |
| asOf       | string | No       | Reference date `YYYY-MM-DD` (default: today) |
| customerId | UUID   | No       | Filter for a specific customer               |
| format     | string | No       | `pdf`                                        |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="aging-{date}.pdf"`

---

### GET /api/reports/customers/receivables

**Purpose**: Consolidated list of all outstanding invoice balances across all customers.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter   | Type    | Required | Description                              |
| ----------- | ------- | -------- | ---------------------------------------- |
| asOf        | string  | No       | Balance as of this date (default: today) |
| overdueOnly | boolean | No       | Show only overdue invoices               |
| format      | string  | No       | `pdf`                                    |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="receivables-{date}.pdf"`

---

## Product Reports

### GET /api/reports/products/labels

**Purpose**: Printable product labels (PDF only).

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter      | Type    | Required | Description                            |
| -------------- | ------- | -------- | -------------------------------------- |
| categoryId     | number  | No       | All products in a category             |
| labelSize      | string  | No       | `small`, `medium` (default), `large`   |
| showBarcode    | boolean | No       | Include barcode (default: `true`)      |
| showCostPrice  | boolean | No       | Include cost price — **ADMIN only**    |
| differentialId | number  | No       | Apply differential for displayed price |
| format         | string  | No       | `pdf`                                  |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="product-labels-{date}.pdf"`

---

### GET /api/reports/products/list

**Purpose**: Product list with optional grouping by category or type.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter     | Type    | Required | Description                            |
| ------------- | ------- | -------- | -------------------------------------- |
| categoryId    | number  | No       | Filter by category                     |
| productType   | string  | No       | `SIMPLE` or `COMPOSITE`                |
| activeOnly    | boolean | No       | Only active products (default: `true`) |
| groupBy       | string  | No       | `category` (default), `type`, `none`   |
| showCostPrice | boolean | No       | Show cost price — **ADMIN only**       |
| format        | string  | No       | `pdf`                                  |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="product-list-{date}.pdf"`

---

### GET /api/reports/products/catalog

**Purpose**: Professional product catalog for customer distribution. No stock or cost prices.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter      | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| differentialId | number | No       | Apply differential pricing   |
| categoryId     | number | No       | Limit to a specific category |
| format         | string | No       | `pdf`                        |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="product-catalog-{date}.pdf"`

---

### GET /api/reports/products/stock

**Purpose**: Current stock levels with cost and sale values.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter        | Type    | Required | Description                                      |
| ---------------- | ------- | -------- | ------------------------------------------------ |
| asOf             | string  | No       | Stock as of date (default: today)                |
| warehouseId      | number  | No       | Filter by warehouse                              |
| categoryId       | number  | No       | Filter by category                               |
| productId        | number  | No       | Filter for a specific product                    |
| includeZeroStock | boolean | No       | Include products with 0 stock (default: `false`) |
| showPrices       | string  | No       | `sale` (default), `cost`, `both`                 |
| differentialId   | number  | No       | Apply differential for extra price column        |
| format           | string  | No       | `pdf`                                            |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="stock-{date}.pdf"`

---

### GET /api/reports/products/movements

**Purpose**: Audit trail of all stock movements (entries, exits, adjustments, transfers).

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter    | Type   | Required | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| from         | string | **Yes**  | Start date `YYYY-MM-DD`                   |
| to           | string | **Yes**  | End date `YYYY-MM-DD`                     |
| warehouseId  | number | No       | Filter by warehouse                       |
| productId    | number | No       | Filter by product                         |
| movementType | string | No       | `ENTRY`, `EXIT`, `ADJUSTMENT`, `TRANSFER` |
| format       | string | No       | `pdf`                                     |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="movements-{date}.pdf"`

---

### GET /api/reports/products/price-list

**Purpose**: Price list supporting multiple differentials as additional price columns.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter       | Type     | Required | Description                                   |
| --------------- | -------- | -------- | --------------------------------------------- |
| categoryId      | number   | No       | Filter by category                            |
| differentialIds | number[] | No       | Up to 5 differentials for extra price columns |
| showCostPrice   | boolean  | No       | Show cost price — **ADMIN only**              |
| format          | string   | No       | `pdf`                                         |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="price-list-{date}.pdf"`

---

## Sales Reports

### GET /api/reports/sales/cash-reconciliation

**Purpose**: Summary of all payments received in a given period, grouped by payment method.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter | Type   | Required    | Description                                                  |
| --------- | ------ | ----------- | ------------------------------------------------------------ |
| from      | string | Conditional | Period start `YYYY-MM-DDTHH:mm:ss` (required if no `period`) |
| to        | string | Conditional | Period end `YYYY-MM-DDTHH:mm:ss` (required if no `period`)   |
| period    | string | No          | Shortcut: `today`, `yesterday`, `this_week`, `last_week`     |
| userId    | UUID   | No          | Filter by cashier/user                                       |
| format    | string | No          | `pdf`                                                        |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="cash-reconciliation-{date}.pdf"`

---

### GET /api/reports/sales/breakdown

**Purpose**: Flexible sales analysis with multiple grouping dimensions.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter   | Type   | Required | Description                                                                                |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------------------ |
| from        | string | **Yes**  | Start date `YYYY-MM-DD`                                                                    |
| to          | string | **Yes**  | End date `YYYY-MM-DD`                                                                      |
| groupBy     | string | No       | `product`, `category`, `warehouse`, `day`, `week`, `month`, `year`, `currency`, `customer` |
| warehouseId | number | No       | Filter by warehouse                                                                        |
| categoryId  | number | No       | Filter by category                                                                         |
| productId   | number | No       | Filter by product                                                                          |
| customerId  | UUID   | No       | Filter by customer                                                                         |
| merchantId  | UUID   | No       | Filter by sales representative                                                             |
| format      | string | No       | `pdf`                                                                                      |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="sales-breakdown-{date}.pdf"`

---

## Sales Representative Reports

### GET /api/reports/merchants/list

**Purpose**: List of all registered sales representatives with commission rates.

**Roles**: USER, ADMIN

**Query Parameters**:

| Parameter | Type    | Required | Description             |
| --------- | ------- | -------- | ----------------------- |
| active    | boolean | No       | Filter by active status |
| format    | string  | No       | `pdf`                   |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="merchant-list-{date}.pdf"`

---

### GET /api/reports/merchants/sales

**Purpose**: Sales volume and revenue breakdown per sales representative.

**Roles**: USER, ADMIN (all), MERCHANT (own data only)

**Query Parameters**:

| Parameter  | Type   | Required | Description                               |
| ---------- | ------ | -------- | ----------------------------------------- |
| from       | string | **Yes**  | Start date `YYYY-MM-DD`                   |
| to         | string | **Yes**  | End date `YYYY-MM-DD`                     |
| merchantId | UUID   | No       | Filter for a specific representative      |
| groupBy    | string | No       | `merchant` (default), `month`, `customer` |
| format     | string | No       | `pdf`                                     |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="merchant-sales-{date}.pdf"`

---

### GET /api/reports/merchants/collections

**Purpose**: Actual commission collections registered per representative.

**Roles**: USER, ADMIN (all), MERCHANT (own data only)

**Query Parameters**:

| Parameter  | Type   | Required | Description                                                                     |
| ---------- | ------ | -------- | ------------------------------------------------------------------------------- |
| from       | string | **Yes**  | Start date `YYYY-MM-DD`                                                         |
| to         | string | **Yes**  | End date `YYYY-MM-DD`                                                           |
| merchantId | UUID   | No       | Filter for a specific representative                                            |
| status     | string | No       | `PENDING`, `PAID` (default: both) — typed as `'PAID' \| 'PENDING' \| undefined` |
| format     | string | No       | `pdf`                                                                           |

**PDF Response (200 OK)**:

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="merchant-collections-{date}.pdf"`

---

## Data Models

### Enums

#### MovementType

```typescript
export enum MovementType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada',
  [MovementType.EXIT]: 'Salida',
  [MovementType.ADJUSTMENT]: 'Ajuste',
  [MovementType.TRANSFER]: 'Transferencia',
};
```

#### SalesBreakdownGroupBy

```typescript
export enum SalesBreakdownGroupBy {
  PRODUCT = 'product',
  CATEGORY = 'category',
  WAREHOUSE = 'warehouse',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CURRENCY = 'currency',
  CUSTOMER = 'customer',
}

export const SALES_BREAKDOWN_GROUP_LABELS: Record<SalesBreakdownGroupBy, string> = {
  [SalesBreakdownGroupBy.PRODUCT]: 'Por Producto',
  [SalesBreakdownGroupBy.CATEGORY]: 'Por Categoría',
  [SalesBreakdownGroupBy.WAREHOUSE]: 'Por Depósito',
  [SalesBreakdownGroupBy.DAY]: 'Por Día',
  [SalesBreakdownGroupBy.WEEK]: 'Por Semana',
  [SalesBreakdownGroupBy.MONTH]: 'Por Mes',
  [SalesBreakdownGroupBy.YEAR]: 'Por Año',
  [SalesBreakdownGroupBy.CURRENCY]: 'Por Moneda',
  [SalesBreakdownGroupBy.CUSTOMER]: 'Por Cliente',
};
```

---

## Report Component Structure

Every report component follows this exact pattern:

```typescript
@Component({
  selector: 'app-<report>-page',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, /* PrimeNG modules needed */],
  templateUrl: './<report>-page.component.html',
})
export class <Report>PageComponent {
  private apiService = inject(Reports<Category>ApiService);
  private fb = inject(FormBuilder);

  protected downloading = signal(false);

  protected filterForm: FormGroup = this.fb.group({ /* filters */ });

  protected downloadPdf(): void {
    if (this.filterForm.invalid) return;
    this.downloading.set(true);

    const { /* filter values */ } = this.filterForm.value as { /* typed */ };

    this.apiService.download<Report>Pdf({ /* params */ }).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `<filename>-${this.getDateString()}.pdf`);
        this.downloading.set(false);
      },
      error: () => {
        this.downloading.set(false);
      },
    });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
```

### Template Structure

Every report template follows this exact layout:

```html
<div class="p-4">
  <div class="bg-surface-0 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-5">
    <h2 class="text-base font-semibold text-surface-800 dark:text-surface-200 mb-4">Filtros</h2>
    <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">

      <!-- Filter fields -->
      <p-datepicker appendTo="body" ... />
      <p-select appendTo="body" ... />

      <!-- Single action button, bottom-right -->
      <div class="[md:col-span-N] flex [items-end] justify-end">
        <p-button
          type="button"
          label="Generar PDF"
          icon="pi pi-file-pdf"
          [loading]="downloading()"
          [disabled]="filterForm.invalid"   <!-- only when form has required validators -->
          (onClick)="downloadPdf()"
        />
      </div>

    </form>
  </div>
</div>
```

**Rules**:

- Outer wrapper is always `<div class="p-4">` (not `p-6 max-w-7xl mx-auto`)
- Single card: no `mb-5` — no second card below
- `appendTo="body"` is mandatory on every `p-datepicker` and `p-select`
- No "Consultar" button — only "Generar PDF"
- No table, no loading spinner for data, no empty state — pure filter form

---

## Role Permissions

| Report                           | USER   | ADMIN  | MERCHANT    |
| -------------------------------- | ------ | ------ | ----------- |
| Customer List                    | ✅     | ✅     | ❌          |
| Customer Statement               | ✅     | ✅     | ❌          |
| Aging Analysis                   | ✅     | ✅     | ❌          |
| Accounts Receivable              | ✅     | ✅     | ❌          |
| Product Labels                   | ✅     | ✅     | ❌          |
| Product Labels (`showCostPrice`) | ❌     | ✅     | ❌          |
| Product List                     | ✅     | ✅     | ❌          |
| Product List (`showCostPrice`)   | ❌     | ✅     | ❌          |
| Product Catalog                  | ✅     | ✅     | ❌          |
| Stock Inventory                  | ✅     | ✅     | ❌          |
| Inventory Movements              | ✅     | ✅     | ❌          |
| Price List                       | ✅     | ✅     | ❌          |
| Price List (`showCostPrice`)     | ❌     | ✅     | ❌          |
| Cash Reconciliation              | ✅     | ✅     | ❌          |
| Sales Breakdown                  | ✅     | ✅     | ❌          |
| Merchant List                    | ✅     | ✅     | ❌          |
| Merchant Sales                   | ✅ All | ✅ All | ✅ Own only |
| Merchant Collections             | ✅ All | ✅ All | ✅ Own only |

---

## Routes Configuration

Only the landing page has a route. All 15 individual report pages are **not routed** — they are opened via `ReportsDialogService`.

```typescript
// reports.routes.ts
export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/reports-landing-page/reports-landing-page.component').then(
        (m) => m.ReportsLandingPageComponent,
      ),
    title: 'Reportes',
  },
];
```

---

## Business Rules

### PDF Download

1. All API calls use `responseType: 'blob'`
2. The frontend always requests `format=pdf`
3. Filename pattern: `{report-name}-{YYYY-MM-DD}.pdf`
4. The download is triggered via a temporary `<a>` element and `URL.createObjectURL`

### Role Scoping

1. MERCHANT users must have their `merchantId` automatically injected from the JWT token
2. MERCHANT users must NOT see the merchant filter (auto-scoped to their own data)
3. `showCostPrice` toggle must be hidden for non-ADMIN users

### Type Safety

Strict union types are used for filter values that have limited valid values:

- `MerchantCollectionsFilters.status` → `'PAID' | 'PENDING' | undefined`
- `CustomerStatementFilters.mode` → `'summary' | 'detailed' | undefined`
- `CashReconciliationFilters.period` → `'today' | 'yesterday' | 'this_week' | 'last_week' | undefined`
- `StockReportFilters.showPrices` → `'sale' | 'cost' | 'both'`

When casting from form values: `(status || undefined) as 'PAID' | 'PENDING' | undefined`

### Price List — Differential Parsing

The `price-list-report-page` accepts a comma-separated string input for differential IDs and parses it via a `computed` signal:

```typescript
protected parsedDifferentialIds = computed((): number[] => {
  const raw = (this.filterForm.value as { differentialIds: string }).differentialIds;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n))
    .slice(0, 5);
});
```

### Cash Reconciliation — Period Shortcuts

The `cash-reconciliation-report-page` has shortcut buttons (Hoy, Ayer, Esta Semana, Semana Pasada) that patch the `period` form control. Manual date selection clears the shortcut via `(onSelect)="filterForm.patchValue({ period: '' })"`.

---

## Related Modules

- [Auth Module](./auth.md) - Authentication and role-based access
- [Customers Module](./customers.md) - Customer data used in customer reports
- [Merchants Module](./merchants.md) - Merchant data used in representative reports
- [Products Module](./products.md) - Product data used in product reports
- [Differentials Module](./differentials.md) - Differential pricing applied to labels, catalog, and price list
- [Warehouses Module](./warehouses.md) - Stock and movement data
- [Invoices Module](./invoices.md) - Invoice and payment data for customer, sales, and merchant reports
- [Collections Module](./collections.md) - Commission collection data for merchant reports

---

**Last Updated**: 2026-03-03

**Module Status**: [x] Implemented
