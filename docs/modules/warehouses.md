# Warehouses Module

## Overview

The Warehouses module manages physical warehouses, product stock per warehouse, and maintains a complete audit trail of all inventory movements. It handles multi-warehouse support, stock operations (entry, exit, adjustments), and transfers between warehouses.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/warehouses/
├── components/               # Reusable UI components
│   ├── warehouse-general-section/
│   │   ├── warehouse-general-section.component.ts
│   │   ├── warehouse-general-section.component.html
│   │   └── warehouse-general-section.component.spec.ts
│   ├── warehouse-stock-section/
│   │   ├── warehouse-stock-section.component.ts
│   │   ├── warehouse-stock-section.component.html
│   │   └── warehouse-stock-section.component.spec.ts
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── warehouse-list.interface.ts
│   │   ├── warehouse-details.interface.ts
│   │   ├── warehouse-edit.interface.ts
│   │   ├── warehouse-create.interface.ts
│   │   ├── stock-entry.interface.ts
│   │   ├── stock-exit.interface.ts
│   │   ├── stock-transfer.interface.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── movement-type.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── warehouses-list-page/
│   │   ├── warehouses-list-page.component.ts
│   │   ├── warehouses-list-page.component.html
│   │   └── warehouses-list-page.component.spec.ts
│   ├── warehouses-form-page/
│   │   ├── warehouses-form-page.component.ts
│   │   ├── warehouses-form-page.component.html
│   │   └── warehouses-form-page.component.spec.ts
│   ├── warehouses-details-page/
│   │   ├── warehouses-details-page.component.ts
│   │   ├── warehouses-details-page.component.html
│   │   └── warehouses-details-page.component.spec.ts
│   ├── stock-entry-page/
│   │   ├── stock-entry-page.component.ts
│   │   ├── stock-entry-page.component.html
│   │   └── stock-entry-page.component.spec.ts
│   ├── stock-exit-page/
│   │   ├── stock-exit-page.component.ts
│   │   ├── stock-exit-page.component.html
│   │   └── stock-exit-page.component.spec.ts
│   ├── stock-transfer-page/
│   │   ├── stock-transfer-page.component.ts
│   │   ├── stock-transfer-page.component.html
│   │   └── stock-transfer-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── warehouse-api.service.ts
│   │   ├── warehouse-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── warehouse-application.service.ts
│   │   ├── warehouse-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── warehouse.mapper.ts
│   │   ├── warehouse.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── warehouse.validators.ts
│   ├── warehouse.validators.spec.ts
│   └── index.ts
├── router/
│   ├── warehouse.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- Warehouse CRUD operations (create, read, update, soft delete)
- Warehouse code validation (pattern WH-XXX)
- Stock entry operations (add inventory)
- Stock exit operations (remove inventory)
- Stock transfer between warehouses
- Movement audit trail with full traceability
- Active/Inactive warehouse status management
- Prevents deactivation of warehouses with stock > 0

---

## Pages

### List Page

**Route**: `/warehouses`

**Component**: `WarehousesListPageComponent`

**Purpose**: Displays all warehouses in a searchable, sortable table.

**Features**:
- PrimeNG DataTable with sorting and filtering
- Search by code, name, location
- Pagination
- Action buttons (View, Edit, Delete)
- Add new warehouse button
- Active/Inactive status badges

### Form Page

**Route**: `/warehouses/new` (Create) | `/warehouses/:id/edit` (Edit)

**Component**: `WarehousesFormPageComponent`

**Purpose**: Create new warehouse or edit existing one.

**Features**:
- Reactive forms with validation
- Code input with WH-XXX pattern validation (only on create)
- Name and location fields
- Active status toggle
- Pending changes guard

### Details Page

**Route**: `/warehouses/:id`

**Component**: `WarehousesDetailsPageComponent`

**Purpose**: Display complete warehouse information and stock overview.

**Features**:
- Complete warehouse data display
- Stock summary per product
- Recent movements history
- Edit and Delete actions
- Quick links to stock operations

### Stock Entry Page

**Route**: `/warehouses/:id/stock/entry`

**Component**: `StockEntryPageComponent`

**Purpose**: Add stock to warehouse (ENTRY movements).

**Features**:
- Product selection with autocomplete
- Quantity input per product
- Multiple products in single operation
- Validation of product existence

### Stock Exit Page

**Route**: `/warehouses/:id/stock/exit`

**Component**: `StockExitPageComponent`

**Purpose**: Remove stock from warehouse (EXIT movements).

**Features**:
- Product selection with current stock display
- Quantity input with max validation
- Multiple products in single operation
- Insufficient stock validation

### Stock Transfer Page

**Route**: `/warehouses/transfer`

**Component**: `StockTransferPageComponent`

**Purpose**: Transfer stock between warehouses.

**Features**:
- Source warehouse selection
- Destination warehouse selection
- Product selection with source stock display
- Quantity input with validation
- Atomic operation (all or nothing)

---

## Data Models

### Interfaces

#### WarehouseList

**Usage**: List page table rows (GET /api/warehouses)

**Purpose**: Minimal data for table display.

```typescript
export interface WarehouseList {
  id: number;              // Warehouse ID
  code: string;            // Warehouse code (WH-XXX)
  name: string;            // Warehouse name
  location: string;        // Physical address
  active: boolean;         // Active status
}
```

**API Mapping**: Maps directly from `WarehouseListResponse`

---

#### WarehouseDetails

**Usage**: Details page display (GET /api/warehouses/:id)

**Purpose**: Complete warehouse data for viewing.

```typescript
export interface WarehouseDetails {
  id: number;              // Warehouse ID
  code: string;            // Warehouse code (WH-XXX)
  name: string;            // Warehouse name
  location: string;        // Physical address
  active: boolean;         // Active status
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
}
```

**API Mapping**: Maps from `WarehouseDetailResponse`

---

#### WarehouseEdit

**Usage**: Edit form data (derived from GET /api/warehouses/:id)

**Purpose**: Form data for editing existing warehouse.

```typescript
export interface WarehouseEdit {
  name: string;            // Editable - 3-100 characters
  location: string;        // Editable - max 200 characters
}
```

**API Mapping**: Maps to `UpdateWarehouseRequest` for PUT request

**Note**: Warehouse code cannot be changed after creation.

---

#### WarehouseCreate

**Usage**: Create form submission (POST /api/warehouses)

**Purpose**: New warehouse creation data.

```typescript
export interface WarehouseCreate {
  code: string;            // Required - pattern WH-XXX
  name: string;            // Required - 3-100 characters
  location: string;        // Required - max 200 characters
}
```

**API Mapping**: Maps directly to `CreateWarehouseRequest`

---

#### StockEntry

**Usage**: Stock entry operation (POST /api/warehouses/:id/stock/entry)

```typescript
export interface ProductQuantity {
  productId: number;       // Product ID
  quantity: number;        // Positive integer
}

export interface StockEntry {
  products: ProductQuantity[];  // At least 1 product required
}
```

**API Mapping**: Maps to `StockEntryRequest`

---

#### StockExit

**Usage**: Stock exit operation (POST /api/warehouses/:id/stock/exit)

```typescript
export interface StockExit {
  products: ProductQuantity[];  // At least 1 product required
}
```

**API Mapping**: Maps to `StockExitRequest`

---

#### StockTransfer

**Usage**: Stock transfer operation (POST /api/warehouses/transfer)

```typescript
export interface StockTransfer {
  fromWarehouseId: number;      // Source warehouse ID
  toWarehouseId: number;        // Destination warehouse ID
  products: ProductQuantity[];  // At least 1 product required
}

export interface StockTransferResponse {
  transferBatchId: string;      // Batch ID grouping movements
  fromWarehouseId: number;
  fromWarehouseCode: string;
  toWarehouseId: number;
  toWarehouseCode: string;
  movements: StockMovement[];
}

export interface StockMovement {
  id: number;
  warehouseId: number;
  warehouseCode: string;
  productId: number;
  movementType: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  transferBatchId: string | null;
  createdAt: string;
}
```

---

### Enums

#### MovementType

```typescript
export enum MovementType {
  ENTRY = 'ENTRY',           // Entry: purchases, returns, inbound transfer
  EXIT = 'EXIT',             // Exit: sales, damages, outbound transfer
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustment: inventory correction
}

export interface MovementTypeOption {
  label: string;
  value: MovementType;
}

export const MOVEMENT_TYPES: readonly MovementTypeOption[] = [
  { label: 'Entrada', value: MovementType.ENTRY },
  { label: 'Salida', value: MovementType.EXIT },
  { label: 'Ajuste', value: MovementType.ADJUSTMENT },
] as const;

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.ENTRY]: 'Entrada',
  [MovementType.EXIT]: 'Salida',
  [MovementType.ADJUSTMENT]: 'Ajuste',
};

export function getMovementTypeLabel(type: MovementType): string {
  return MOVEMENT_TYPE_LABELS[type] || type;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/warehouses`

### Interface Mapping Summary

| HTTP Method | Endpoint | Request Interface | Response Interface | Frontend Usage |
|-------------|----------|-------------------|-------------------|----------------|
| GET | /api/warehouses | - | `WarehouseList[]` | List page |
| GET | /api/warehouses/:id | - | `WarehouseDetails` | Details/Edit page |
| POST | /api/warehouses | `WarehouseCreate` | `WarehouseDetails` | Create form |
| PUT | /api/warehouses/:id | `WarehouseEdit` | `WarehouseDetails` | Edit form |
| DELETE | /api/warehouses/:id | - | void (204) | Delete action |
| POST | /api/warehouses/:id/stock/entry | `StockEntry` | void (204) | Stock entry |
| POST | /api/warehouses/:id/stock/exit | `StockExit` | void (204) | Stock exit |
| POST | /api/warehouses/transfer | `StockTransfer` | `StockTransferResponse` | Stock transfer |

---

### GET /api/warehouses

**Purpose**: List all warehouses

**Frontend Interface**: `WarehouseList[]`

**Example Response**:
```json
[
  {
    "id": 1,
    "code": "WH-001",
    "name": "Main Warehouse",
    "location": "123 Main St, City",
    "active": true
  },
  {
    "id": 2,
    "code": "WH-002",
    "name": "East Branch Warehouse",
    "location": "456 East Ave, Town",
    "active": true
  }
]
```

---

### GET /api/warehouses/:id

**Purpose**: Get warehouse by ID

**Frontend Interface**: `WarehouseDetails`

**Example Response**:
```json
{
  "id": 1,
  "code": "WH-001",
  "name": "Main Warehouse",
  "location": "123 Main St, City",
  "active": true,
  "createdAt": "2025-12-17T10:00:00",
  "updatedAt": "2025-12-17T11:30:00"
}
```

---

### POST /api/warehouses

**Purpose**: Create new warehouse

**Frontend Interface**: `WarehouseCreate` (request), `WarehouseDetails` (response)

**Example Request**:
```json
{
  "code": "WH-003",
  "name": "South Warehouse",
  "location": "789 South Ave, City"
}
```

**Example Response**: Same as GET /:id (with generated ID and timestamps)

---

### PUT /api/warehouses/:id

**Purpose**: Update existing warehouse

**Frontend Interface**: `WarehouseEdit` (request), `WarehouseDetails` (response)

**Example Request**:
```json
{
  "name": "Updated Warehouse Name",
  "location": "New Address, City"
}
```

**Note**: Warehouse code cannot be changed after creation.

---

### DELETE /api/warehouses/:id

**Purpose**: Soft delete warehouse (marks as inactive)

**Response**: 204 No Content

**Errors**:
- `409 Conflict`: Cannot deactivate warehouse with existing stock

---

### POST /api/warehouses/:id/stock/entry

**Purpose**: Add stock to warehouse

**Frontend Interface**: `StockEntry` (request), void (response)

**Example Request**:
```json
{
  "products": [
    {"productId": 10, "quantity": 100},
    {"productId": 11, "quantity": 50}
  ]
}
```

**Response**: 204 No Content

**Note**: Creates 1 StockMovement with movementType=ENTRY per product.

---

### POST /api/warehouses/:id/stock/exit

**Purpose**: Remove stock from warehouse

**Frontend Interface**: `StockExit` (request), void (response)

**Example Request**:
```json
{
  "products": [
    {"productId": 10, "quantity": 20},
    {"productId": 11, "quantity": 10}
  ]
}
```

**Response**: 204 No Content

**Errors**:
- `422 Unprocessable Entity`: Insufficient stock

---

### POST /api/warehouses/transfer

**Purpose**: Transfer stock between warehouses

**Frontend Interface**: `StockTransfer` (request), `StockTransferResponse` (response)

**Example Request**:
```json
{
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "products": [
    {"productId": 10, "quantity": 50},
    {"productId": 11, "quantity": 30}
  ]
}
```

**Example Response**:
```json
{
  "transferBatchId": "TRF-20251217-143022",
  "fromWarehouseId": 1,
  "fromWarehouseCode": "WH-001",
  "toWarehouseId": 2,
  "toWarehouseCode": "WH-002",
  "movements": [
    {
      "id": 101,
      "warehouseId": 1,
      "warehouseCode": "WH-001",
      "productId": 10,
      "movementType": "EXIT",
      "quantity": 50,
      "previousStock": 200,
      "newStock": 150,
      "transferBatchId": "TRF-20251217-143022",
      "createdAt": "2025-12-17T14:30:22"
    },
    {
      "id": 102,
      "warehouseId": 2,
      "warehouseCode": "WH-002",
      "productId": 10,
      "movementType": "ENTRY",
      "quantity": 50,
      "previousStock": 80,
      "newStock": 130,
      "transferBatchId": "TRF-20251217-143022",
      "createdAt": "2025-12-17T14:30:22"
    }
  ]
}
```

**Note**: Creates 2 movements per product (EXIT source + ENTRY destination). Atomic operation.

---

## Validation Rules

### Field Validations

| Field | Type | Required | Rules | Error Message |
|-------|------|----------|-------|---------------|
| `code` | string | Yes (create) | Pattern WH-XXX, unique | "Code must follow pattern WH-XXX" |
| `name` | string | Yes | 3-100 characters | "Name must be 3-100 characters" |
| `location` | string | Yes | Max 200 characters | "Location must be max 200 characters" |
| `productId` | number | Yes | Positive, exists | "Product not found" |
| `quantity` | number | Yes | Positive integer | "Quantity must be positive" |

### Custom Validators

```typescript
// validators/warehouse.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class WarehouseValidators {
  static warehouseCodeFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const pattern = /^WH-\d{3}$/;
      if (!pattern.test(control.value)) {
        return { invalidCode: 'Code must follow pattern WH-XXX (e.g., WH-001)' };
      }
      
      return null;
    };
  }
  
  static positiveQuantity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (control.value <= 0 || !Number.isInteger(control.value)) {
        return { invalidQuantity: 'Quantity must be a positive integer' };
      }
      
      return null;
    };
  }

  static minArrayLength(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return { minArrayLength: `Minimum ${min} items required` };
      }
      
      if (control.value.length < min) {
        return { minArrayLength: `Minimum ${min} items required` };
      }
      
      return null;
    };
  }
}
```

---

## Form Structure

### Warehouse Form (Single Form)

- **Fields**: code (create only), name, location, active
- **No tabs needed** - simple form structure

### Form Model

```typescript
interface WarehouseFormModel {
  id?: number;
  code?: string;           // Only for create (read-only on edit)
  name: string;
  location: string;
  active: boolean;
}
```

### Stock Operation Forms

#### Entry/Exit Form Model

```typescript
interface StockOperationFormModel {
  products: ProductQuantityFormModel[];
}

interface ProductQuantityFormModel {
  productId: number;
  productName?: string;    // Display only
  quantity: number;
}
```

#### Transfer Form Model

```typescript
interface TransferFormModel {
  fromWarehouseId: number;
  toWarehouseId: number;
  products: ProductQuantityFormModel[];
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/warehouse-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/warehouses';

  getAll(): Observable<WarehouseList[]> {
    return this.http.get<WarehouseList[]>(this.baseUrl);
  }

  getById(id: number): Observable<WarehouseDetails> {
    return this.http.get<WarehouseDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: WarehouseCreate): Observable<WarehouseDetails> {
    return this.http.post<WarehouseDetails>(this.baseUrl, data);
  }

  update(id: number, data: WarehouseEdit): Observable<WarehouseDetails> {
    return this.http.put<WarehouseDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addStock(id: number, data: StockEntry): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/stock/entry`, data);
  }

  removeStock(id: number, data: StockExit): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/stock/exit`, data);
  }

  transferStock(data: StockTransfer): Observable<StockTransferResponse> {
    return this.http.post<StockTransferResponse>(`${this.baseUrl}/transfer`, data);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/warehouse-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class WarehouseApplicationService {
  private readonly api = inject(WarehouseApiService);
  private readonly mapper = inject(WarehouseMapper);

  // State signals
  readonly warehouses = signal<WarehouseList[]>([]);
  readonly currentWarehouse = signal<WarehouseDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<WarehouseList[]> {
    this.loading.set(true);
    return this.api.getAll().pipe(
      tap(warehouses => this.warehouses.set(warehouses)),
      finalize(() => this.loading.set(false))
    );
  }

  loadById(id: number): Observable<WarehouseDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap(warehouse => this.currentWarehouse.set(warehouse)),
      finalize(() => this.loading.set(false))
    );
  }

  create(data: WarehouseCreate): Observable<WarehouseDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  update(id: number, data: WarehouseEdit): Observable<WarehouseDetails> {
    this.loading.set(true);
    return this.api.update(id, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id);
  }

  addStock(warehouseId: number, data: StockEntry): Observable<void> {
    this.loading.set(true);
    return this.api.addStock(warehouseId, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  removeStock(warehouseId: number, data: StockExit): Observable<void> {
    this.loading.set(true);
    return this.api.removeStock(warehouseId, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  transferStock(data: StockTransfer): Observable<StockTransferResponse> {
    this.loading.set(true);
    return this.api.transferStock(data).pipe(
      finalize(() => this.loading.set(false))
    );
  }
}
```

---

### Mapper Service

**File**: `services/mappers/warehouse.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class WarehouseMapper {
  toFormModel(details: WarehouseDetails): WarehouseFormModel {
    return {
      id: details.id,
      code: details.code,
      name: details.name,
      location: details.location,
      active: details.active,
    };
  }

  toCreateRequest(form: WarehouseFormModel): WarehouseCreate {
    return {
      code: form.code!,
      name: form.name,
      location: form.location,
    };
  }

  toUpdateRequest(form: WarehouseFormModel): WarehouseEdit {
    return {
      name: form.name,
      location: form.location,
    };
  }
}
```

---

## Business Rules

### Warehouse Rules

1. Warehouse code is unique and immutable after creation
2. Warehouse code follows pattern WH-XXX (e.g., WH-001, WH-002)
3. Name is required and must be 3-100 characters
4. Location is required and max 200 characters
5. Soft delete: DELETE marks as `active = false`
6. Cannot deactivate a warehouse with stock > 0
7. Only active warehouses can have stock movements

### Stock Management Rules

1. Stock quantity can never be negative
2. Only 1 stock record per combination `(warehouseId, productId)`
3. Auto-create stock record if doesn't exist with `quantity = 0`
4. Exit operation validates sufficient stock before execution
5. `lastMovementAt` updates automatically on every change

### Movement Auditing Rules

1. StockMovement records are immutable (cannot be modified after creation)
2. Every stock change creates a `StockMovement` record
3. Consistency validation: `previousStock ± quantity = newStock`
4. Transfer movements share the same `transferBatchId`

### Transfer Rules

1. Transfer is atomic (all succeed or all fail)
2. Creates EXIT at source + ENTRY at destination per product
3. All movements share `transferBatchId` for traceability
4. Validates sufficient stock at source before executing

---

## Routes Configuration

```typescript
// router/warehouse.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/warehouses-list-page/warehouses-list-page.component')
        .then(m => m.WarehousesListPageComponent),
    title: 'Almacenes',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/warehouses-form-page/warehouses-form-page.component')
        .then(m => m.WarehousesFormPageComponent),
    title: 'Nuevo Almacén',
  },
  {
    path: 'transfer',
    loadComponent: () =>
      import('../pages/stock-transfer-page/stock-transfer-page.component')
        .then(m => m.StockTransferPageComponent),
    title: 'Transferir Stock',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/warehouses-details-page/warehouses-details-page.component')
        .then(m => m.WarehousesDetailsPageComponent),
    title: 'Detalles del Almacén',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/warehouses-form-page/warehouses-form-page.component')
        .then(m => m.WarehousesFormPageComponent),
    title: 'Editar Almacén',
    canDeactivate: [pendingChangesGuard],
  },
  {
    path: ':id/stock/entry',
    loadComponent: () =>
      import('../pages/stock-entry-page/stock-entry-page.component')
        .then(m => m.StockEntryPageComponent),
    title: 'Entrada de Stock',
  },
  {
    path: ':id/stock/exit',
    loadComponent: () =>
      import('../pages/stock-exit-page/stock-exit-page.component')
        .then(m => m.StockExitPageComponent),
    title: 'Salida de Stock',
  },
];
```

---

## Testing Requirements

### Unit Tests

- [ ] Warehouse code validator tested (WH-XXX pattern)
- [ ] Positive quantity validator tested
- [ ] Min array length validator tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly
- [ ] Form page validates correctly
- [ ] Details page displays data correctly
- [ ] Stock entry form works correctly
- [ ] Stock exit form validates stock availability
- [ ] Transfer form validates both warehouses

### Integration Tests

- [ ] Full warehouse CRUD workflow tested
- [ ] Stock entry creates movements
- [ ] Stock exit validates and creates movements
- [ ] Transfer creates paired movements
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Warehouse operations require authentication
- [Products Module](./products.md) - Stock references products
- [Dashboard Module](./dashboard.md) - Warehouse metrics may be displayed

---

## Notes

### Important Considerations

1. **Warehouse Code**: Follows pattern WH-XXX and cannot be changed after creation.
2. **Soft Delete**: Warehouses are not physically deleted, just marked inactive.
3. **Stock Constraints**: Cannot deactivate warehouse with stock > 0.
4. **Movement Audit**: All stock changes create immutable movement records.
5. **Transfer Atomicity**: Transfers are all-or-nothing operations.
6. **Error Handling**: Stock operations may fail due to insufficient stock or inactive warehouse.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Show transfer batch ID in movement history for traceability

---

**Last Updated**: 2025-12-18

**Module Status**: [x] Planned | [ ] In Development | [ ] Implemented
