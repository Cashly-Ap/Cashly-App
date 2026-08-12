# Collections Module

## Overview

The Collections module displays commission records (cobranzas) that are automatically generated when payments are registered on invoices that have an associated merchant. This is a **read-only module** - collections cannot be created, edited, or deleted from the frontend.

**Key Concepts**:

- **Automatic Generation**: Collections are created automatically by the backend when a payment is registered
- **Merchant Required**: Collections only exist for invoices with a merchant
- **Commission Calculation**: Commission = payment amount × (merchant.commissionPercentage / 100)
- **Immutable Records**: Once created, collections cannot be modified or deleted
- **Payment Link**: Each collection is linked to a specific invoice payment

**Module Type**: `Display-only` (List + Details pages only, no Form page)

---

## Module Structure

```
src/app/features/collections/
├── models/
│   ├── interfaces/
│   │   ├── collection-list.interface.ts
│   │   ├── collection-details.interface.ts
│   │   ├── collection-summary.interface.ts
│   │   ├── collection-filter.interface.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── collections-list-page/
│   │   ├── collections-list-page.component.ts
│   │   ├── collections-list-page.component.html
│   │   └── collections-list-page.component.spec.ts
│   ├── collections-details-page/
│   │   ├── collections-details-page.component.ts
│   │   ├── collections-details-page.component.html
│   │   └── collections-details-page.component.spec.ts
│   ├── collections-summary-page/
│   │   ├── collections-summary-page.component.ts
│   │   ├── collections-summary-page.component.html
│   │   └── collections-summary-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── collection-api.service.ts
│   │   ├── collection-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── collection-application.service.ts
│   │   ├── collection-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── collection.mapper.ts
│   │   ├── collection.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── router/
│   ├── collection.routes.ts
│   └── index.ts
└── index.ts
```

**Note**: No `components/` folder needed - this module has no tabs or complex form sections.

**Note**: No `validators/` folder needed - this is a read-only module with no form validation.

---

## Features

- View list of commission records with filtering and pagination
- View collection details with customer, merchant, and invoice information
- Filter by merchant, customer, invoice, and date range
- View merchant collection summaries with aggregated data
- Role-based access (MERCHANT can only see their own collections)

---

## Pages

### List Page

**Route**: `/collections`

**Component**: `CollectionsListPageComponent`

**Purpose**: Displays all collections in a searchable, sortable, paginated table.

**Features**:

- PrimeNG DataTable with server-side sorting and pagination
- Search by invoice number, customer name, merchant name
- Filter by merchant, customer, date range
- View details action button
- Status badge for commission amounts
- Link to related invoice

### Details Page

**Route**: `/collections/:id`

**Component**: `CollectionsDetailsPageComponent`

**Purpose**: Display complete collection information in read-only mode.

**Features**:

- Complete collection data display
- Customer information section
- Merchant information section
- Invoice information section
- Commission calculation breakdown
- Link to related invoice
- Back to list action

### Summary Page

**Route**: `/collections/summary` or `/collections/merchant/:merchantId/summary`

**Component**: `CollectionsSummaryPageComponent`

**Purpose**: Display aggregated collection data for a merchant within a date range.

**Features**:

- Merchant selection (for ADMIN/USER roles)
- Date range picker
- Summary cards (total collections, total amount, total commission, average)
- Daily breakdown table
- Export functionality (optional)

---

## Data Models

### Interfaces

#### CollectionList

**Usage**: List page table rows (GET /api/collections)

**Purpose**: Data for table display.

```typescript
export interface CollectionList {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentId: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  merchantName: string;
  amountCollected: number;
  commissionPercentage: number;
  commissionAmount: number;
  collectionDate: string;
  createdAt: string;
}
```

**API Mapping**: Maps directly from `CollectionListResponse`

---

#### CollectionDetails

**Usage**: Details page display (GET /api/collections/:id)

**Purpose**: Complete collection data for viewing.

```typescript
export interface CollectionDetails {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentId: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  merchantId: string;
  merchantName: string;
  amountCollected: number;
  commissionPercentage: number;
  commissionAmount: number;
  collectionDate: string;
  createdAt: string;
}
```

**API Mapping**: Maps directly from `CollectionDetailResponse`

---

#### CollectionSummary

**Usage**: Summary page display (GET /api/collections/merchant/:merchantId/summary)

**Purpose**: Aggregated collection data for a merchant.

```typescript
export interface DailyCollectionSummary {
  collectionDate: string;
  count: number;
  amountCollected: number;
  commissionAmount: number;
}

export interface CollectionSummary {
  merchantId: string;
  merchantName: string;
  merchantCommissionPercentage: number;
  fromDate: string;
  toDate: string;
  totalCollections: number;
  totalAmountCollected: number;
  totalCommission: number;
  averageCommission: number;
  collections: DailyCollectionSummary[];
}
```

**API Mapping**: Maps directly from `CollectionSummaryResponse`

---

#### CollectionFilter

**Usage**: Filter parameters for list page

**Purpose**: Query parameters for filtering collections.

```typescript
export interface CollectionFilter {
  merchantId?: string;
  customerId?: string;
  invoiceId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/collections`

### Interface Mapping Summary

| HTTP Method | Endpoint                                      | Request Interface                 | Response Interface     | Frontend Usage       |
| ----------- | --------------------------------------------- | --------------------------------- | ---------------------- | -------------------- |
| GET         | /api/collections                              | `CollectionFilter` (query params) | `Page<CollectionList>` | List page            |
| GET         | /api/collections/:id                          | -                                 | `CollectionDetails`    | Details page         |
| GET         | /api/collections/merchant/:merchantId         | `CollectionFilter` (query params) | `Page<CollectionList>` | Merchant collections |
| GET         | /api/collections/merchant/:merchantId/summary | `fromDate`, `toDate`              | `CollectionSummary`    | Summary page         |

---

### GET /api/collections

**Purpose**: List all collections with filters and pagination

**Roles**:

- USER, ADMIN: Can view all collections
- MERCHANT: Can only view own collections (auto-filtered by backend)

**Query Parameters**:

| Parameter  | Type   | Default             | Description                                    |
| ---------- | ------ | ------------------- | ---------------------------------------------- |
| merchantId | UUID   | -                   | Filter by merchant (ignored for MERCHANT role) |
| customerId | UUID   | -                   | Filter by customer                             |
| invoiceId  | UUID   | -                   | Filter by invoice                              |
| fromDate   | date   | -                   | Filter from collection date (YYYY-MM-DD)       |
| toDate     | date   | -                   | Filter to collection date (YYYY-MM-DD)         |
| page       | number | 0                   | Page number                                    |
| size       | number | 20                  | Page size                                      |
| sort       | string | collectionDate,desc | Sort field and direction                       |

**Frontend Interface**: `Page<CollectionList>`

**Example Response**:

```json
{
  "content": [
    {
      "id": "collection-001-uuid",
      "invoiceId": "invoice-001-uuid",
      "invoiceNumber": "INV-2026-00001",
      "paymentId": "payment-001-uuid",
      "customerId": "customer-uuid-here",
      "customerName": "ABC Company S.A.",
      "merchantId": "merchant-uuid-here",
      "merchantName": "Juan Perez",
      "amountCollected": 500.0,
      "commissionPercentage": 15.0,
      "commissionAmount": 75.0,
      "collectionDate": "2026-01-15",
      "createdAt": "2026-01-15T14:00:00"
    }
  ],
  "totalElements": 25,
  "totalPages": 2,
  "size": 20,
  "number": 0
}
```

---

### GET /api/collections/:id

**Purpose**: Get collection by ID

**Roles**:

- USER, ADMIN: Can view any collection
- MERCHANT: Can only view own collections

**Frontend Interface**: `CollectionDetails`

**Example Response**:

```json
{
  "id": "collection-001-uuid",
  "invoiceId": "invoice-001-uuid",
  "invoiceNumber": "INV-2026-00001",
  "paymentId": "payment-001-uuid",
  "customerId": "customer-uuid-here",
  "customerName": "ABC Company S.A.",
  "customerRif": "J-12345678-9",
  "merchantId": "merchant-uuid-here",
  "merchantName": "Juan Perez",
  "amountCollected": 500.0,
  "commissionPercentage": 15.0,
  "commissionAmount": 75.0,
  "collectionDate": "2026-01-15",
  "createdAt": "2026-01-15T14:00:00"
}
```

**Errors**:

- 401 - Unauthorized
- 403 - MERCHANT trying to view another merchant's collection
- 404 - Collection not found

---

### GET /api/collections/merchant/:merchantId

**Purpose**: List collections for a specific merchant

**Roles**:

- USER, ADMIN: Can view any merchant's collections
- MERCHANT: Can only view own collections (merchantId must match)

**Query Parameters**:

| Parameter | Type   | Default | Description                 |
| --------- | ------ | ------- | --------------------------- |
| fromDate  | date   | -       | Filter from collection date |
| toDate    | date   | -       | Filter to collection date   |
| page      | number | 0       | Page number                 |
| size      | number | 20      | Page size                   |

**Frontend Interface**: `Page<CollectionList>`

**Errors**:

- 401 - Unauthorized
- 403 - MERCHANT trying to access another merchant's collections
- 404 - Merchant not found

---

### GET /api/collections/merchant/:merchantId/summary

**Purpose**: Get collection summary for a merchant within a date range

**Roles**:

- USER, ADMIN: Can view any merchant's summary
- MERCHANT: Can only view own summary

**Query Parameters**:

| Parameter | Type | Default                    | Description     |
| --------- | ---- | -------------------------- | --------------- |
| fromDate  | date | First day of current month | Start of period |
| toDate    | date | Today                      | End of period   |

**Frontend Interface**: `CollectionSummary`

**Example Response**:

```json
{
  "merchantId": "merchant-uuid-here",
  "merchantName": "Juan Perez",
  "merchantCommissionPercentage": 15.0,
  "fromDate": "2026-01-01",
  "toDate": "2026-01-15",
  "totalCollections": 10,
  "totalAmountCollected": 5000.0,
  "totalCommission": 750.0,
  "averageCommission": 75.0,
  "collections": [
    {
      "collectionDate": "2026-01-15",
      "count": 3,
      "amountCollected": 1500.0,
      "commissionAmount": 225.0
    },
    {
      "collectionDate": "2026-01-10",
      "count": 5,
      "amountCollected": 2500.0,
      "commissionAmount": 375.0
    },
    {
      "collectionDate": "2026-01-05",
      "count": 2,
      "amountCollected": 1000.0,
      "commissionAmount": 150.0
    }
  ]
}
```

**Errors**:

- 401 - Unauthorized
- 403 - MERCHANT trying to access another merchant's summary
- 404 - Merchant not found

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/collection-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/collections';

  getAll(filter?: CollectionFilter): Observable<Page<CollectionList>> {
    const params = this.buildParams(filter);
    return this.http.get<Page<CollectionList>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<CollectionDetails> {
    return this.http.get<CollectionDetails>(`${this.baseUrl}/${id}`);
  }

  getByMerchant(merchantId: string, filter?: CollectionFilter): Observable<Page<CollectionList>> {
    const params = this.buildParams(filter);
    return this.http.get<Page<CollectionList>>(`${this.baseUrl}/merchant/${merchantId}`, {
      params,
    });
  }

  getMerchantSummary(
    merchantId: string,
    fromDate?: string,
    toDate?: string,
  ): Observable<CollectionSummary> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<CollectionSummary>(`${this.baseUrl}/merchant/${merchantId}/summary`, {
      params,
    });
  }

  private buildParams(filter?: CollectionFilter): HttpParams {
    let params = new HttpParams();
    if (!filter) return params;

    if (filter.merchantId) params = params.set('merchantId', filter.merchantId);
    if (filter.customerId) params = params.set('customerId', filter.customerId);
    if (filter.invoiceId) params = params.set('invoiceId', filter.invoiceId);
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter.toDate) params = params.set('toDate', filter.toDate);
    if (filter.page !== undefined) params = params.set('page', filter.page.toString());
    if (filter.size !== undefined) params = params.set('size', filter.size.toString());
    if (filter.sort) params = params.set('sort', filter.sort);

    return params;
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/collection-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class CollectionApplicationService {
  private readonly api = inject(CollectionApiService);

  readonly collections = signal<CollectionList[]>([]);
  readonly currentCollection = signal<CollectionDetails | null>(null);
  readonly summary = signal<CollectionSummary | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);

  loadCollections(filter?: CollectionFilter): Observable<Page<CollectionList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll(filter).pipe(
      tap({
        next: (page) => {
          this.collections.set(page.content);
          this.totalElements.set(page.totalElements);
          this.totalPages.set(page.totalPages);
          this.currentPage.set(page.number);
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<CollectionDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap({
        next: (collection) => this.currentCollection.set(collection),
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadMerchantCollections(
    merchantId: string,
    filter?: CollectionFilter,
  ): Observable<Page<CollectionList>> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getByMerchant(merchantId, filter).pipe(
      tap({
        next: (page) => {
          this.collections.set(page.content);
          this.totalElements.set(page.totalElements);
          this.totalPages.set(page.totalPages);
          this.currentPage.set(page.number);
        },
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadMerchantSummary(
    merchantId: string,
    fromDate?: string,
    toDate?: string,
  ): Observable<CollectionSummary> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getMerchantSummary(merchantId, fromDate, toDate).pipe(
      tap({
        next: (summary) => this.summary.set(summary),
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  clearCurrentCollection(): void {
    this.currentCollection.set(null);
  }

  clearSummary(): void {
    this.summary.set(null);
  }
}
```

---

### Mapper Service

**File**: `services/mappers/collection.mapper.ts`

**Purpose**: Transform data between API and frontend formats (minimal for this module)

```typescript
@Injectable({ providedIn: 'root' })
export class CollectionMapper {
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatPercentage(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
```

---

## Pagination Interface

```typescript
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

---

## Business Rules

### Collection Generation (Backend)

1. Collections are created **automatically** when payment is registered on invoice
2. Collection is only created if invoice has a merchant
3. One collection per payment (1:1 relationship)
4. Commission percentage is snapshot from merchant at creation time
5. Formula: `commissionAmount = amountCollected × (commissionPercentage / 100)`

### Display Rules (Frontend)

1. Collections are **read-only** - no create, edit, or delete operations
2. MERCHANT role can only view their own collections
3. USER/ADMIN roles can view all collections
4. Links to related invoices should be provided for navigation

### Access Control

| Role     | List All    | List by Merchant | View Details | View Summary |
| -------- | ----------- | ---------------- | ------------ | ------------ |
| USER     | ✅ All      | ✅ Any merchant  | ✅ Any       | ✅ Any       |
| ADMIN    | ✅ All      | ✅ Any merchant  | ✅ Any       | ✅ Any       |
| MERCHANT | ✅ Only own | ✅ Only own      | ✅ Only own  | ✅ Only own  |

---

## Routes Configuration

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards';

export const COLLECTION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/collections-list-page/collections-list-page.component').then(
            (m) => m.CollectionsListPageComponent,
          ),
        title: 'Cobranzas',
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('../pages/collections-summary-page/collections-summary-page.component').then(
            (m) => m.CollectionsSummaryPageComponent,
          ),
        title: 'Resumen de Cobranzas',
      },
      {
        path: 'merchant/:merchantId/summary',
        loadComponent: () =>
          import('../pages/collections-summary-page/collections-summary-page.component').then(
            (m) => m.CollectionsSummaryPageComponent,
          ),
        title: 'Resumen de Cobranzas',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/collections-details-page/collections-details-page.component').then(
            (m) => m.CollectionsDetailsPageComponent,
          ),
        title: 'Detalles de Cobranza',
      },
    ],
  },
];
```

---

## UI Display Guidelines

### List Page Table Columns

| Column        | Field                | Sortable | Format            |
| ------------- | -------------------- | -------- | ----------------- |
| Nº Factura    | invoiceNumber        | ✅       | Link to invoice   |
| Cliente       | customerName         | ✅       | Text              |
| Comercial     | merchantName         | ✅       | Text              |
| Monto Cobrado | amountCollected      | ✅       | Currency (USD)    |
| % Comisión    | commissionPercentage | ✅       | Percentage        |
| Comisión      | commissionAmount     | ✅       | Currency (USD)    |
| Fecha         | collectionDate       | ✅       | Date (dd/mm/yyyy) |
| Acciones      | -                    | -        | View button       |

### Details Page Sections

1. **Información General**
   - ID de Cobranza
   - Fecha de Cobranza
   - Fecha de Creación

2. **Información del Cliente**
   - Nombre del Cliente
   - RIF del Cliente

3. **Información del Comercial**
   - Nombre del Comercial
   - Porcentaje de Comisión

4. **Información de la Factura**
   - Número de Factura (link)
   - ID del Pago

5. **Cálculo de Comisión**
   - Monto Cobrado
   - Porcentaje de Comisión
   - Monto de Comisión (highlighted)

### Summary Page Cards

| Card                | Value                | Icon          |
| ------------------- | -------------------- | ------------- |
| Total Cobranzas     | totalCollections     | pi-file       |
| Monto Total Cobrado | totalAmountCollected | pi-dollar     |
| Comisión Total      | totalCommission      | pi-percentage |
| Comisión Promedio   | averageCommission    | pi-chart-line |

---

## Messages (Spanish)

### Error Messages

```typescript
export const COLLECTION_ERROR_MESSAGES = {
  load: {
    list: 'Error al cargar las cobranzas. Por favor, intente nuevamente.',
    details: 'Error al cargar los detalles de la cobranza.',
    summary: 'Error al cargar el resumen de cobranzas.',
  },
  notFound: 'La cobranza solicitada no existe.',
  forbidden: 'No tiene permisos para ver esta cobranza.',
} as const;
```

### Page Titles and Labels

```typescript
export const COLLECTION_LABELS = {
  pageTitle: {
    list: 'Cobranzas',
    details: 'Detalles de Cobranza',
    summary: 'Resumen de Cobranzas',
  },
  table: {
    invoiceNumber: 'Nº Factura',
    customerName: 'Cliente',
    merchantName: 'Comercial',
    amountCollected: 'Monto Cobrado',
    commissionPercentage: '% Comisión',
    commissionAmount: 'Comisión',
    collectionDate: 'Fecha',
    actions: 'Acciones',
  },
  sections: {
    general: 'Información General',
    customer: 'Información del Cliente',
    merchant: 'Información del Comercial',
    invoice: 'Información de la Factura',
    commission: 'Cálculo de Comisión',
  },
  summary: {
    totalCollections: 'Total Cobranzas',
    totalAmountCollected: 'Monto Total Cobrado',
    totalCommission: 'Comisión Total',
    averageCommission: 'Comisión Promedio',
    dailyBreakdown: 'Desglose Diario',
  },
  buttons: {
    view: 'Ver',
    back: 'Volver',
    filter: 'Filtrar',
    clearFilters: 'Limpiar Filtros',
    export: 'Exportar',
  },
  filters: {
    merchant: 'Comercial',
    customer: 'Cliente',
    dateRange: 'Rango de Fechas',
    fromDate: 'Desde',
    toDate: 'Hasta',
  },
  empty: 'No se encontraron cobranzas',
} as const;
```

---

## Testing Requirements

### Unit Tests

- [ ] API service HTTP calls tested with HttpTestingController
- [ ] Application service state management tested
- [ ] Mapper formatting functions tested
- [ ] Filter parameter building tested

### Component Tests

- [ ] List page renders correctly with mock data
- [ ] Details page displays all information correctly
- [ ] Summary page shows aggregated data correctly
- [ ] Pagination works correctly
- [ ] Filters apply correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full list-to-details workflow tested
- [ ] Summary loading tested
- [ ] Error handling tested
- [ ] Loading states tested
- [ ] Role-based access tested (mock user roles)

---

## Related Modules

- [Invoices Module](./invoices.md) - Collections are generated from invoice payments
- [Merchants Module](./merchants.md) - Collections reference merchants and their commission
- [Customers Module](./customers.md) - Collections reference customers
- [Auth Module](./auth.md) - Role-based access control

---

## Notes

### Important Considerations

1. **Read-Only Module**: No create, edit, or delete operations - all data comes from backend
2. **Automatic Generation**: Collections are created when payments are registered on invoices with merchants
3. **Snapshot Data**: Commission percentage and names are captured at creation time
4. **Role-Based Access**: MERCHANT role has restricted access to only their own data
5. **Invoice Links**: Provide navigation to related invoices for context

### Common Patterns

- Use signals for state management
- Use pagination for large datasets
- Use filter parameters for server-side filtering
- Display currency in USD format
- Display dates in dd/mm/yyyy format (Venezuelan locale)
- Provide links to related entities (invoices, merchants, customers)

### Commission Calculation Example

```
Invoice INV-2026-00001
- Customer: ABC Company
- Merchant: Juan Perez (commission: 15%)

Payment registered: $500.00

Collection generated:
- amountCollected: $500.00
- commissionPercentage: 15.00%
- commissionAmount: $500.00 × (15/100) = $75.00
```

---

**Last Updated**: 2026-01-15

**Module Status**: [ ] Planned | [ ] In Development | [ ] Implemented
