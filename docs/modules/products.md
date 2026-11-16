# Products Module

## Overview

The Products module manages the product catalog for the invoicing system. It handles simple products with direct stock tracking and composite products assembled from component materials. Supports multiple units of measure (units, kilograms, bulk packages) and automatic stock deduction when assembling composite products.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/catalog/products/
├── actions/                        # Row and toolbar actions
├── components/                     # Form sections
├── i18n/                           # Translations
├── models/                         # Interfaces and enums
├── navigation/                     # Menu and navigation contributions
├── pages/                          # List, form, and details pages
├── permissions/                    # Permission constants
├── reporting/                      # Product, catalog, and commercial catalog reports
├── routing/                        # Lazy-loaded routes
└── services/                       # API and application services
```

---

## Features

- Product CRUD operations (create, read, update, soft delete)
- Simple products with direct stock tracking
- Composite products assembled from components
- Multiple units of measure (UNIT, KILOGRAM, BULK)
- Bulk quantity configuration for package products
- Product composition management for composite products
- Auto-generated sequential product codes (PRD-XXXXX)
- Category classification (string-based)
- Cost and sale price management

- Max assemblable units calculation for composite products

---

## Pages

### List Page

**Route**: `/catalog/products`

**Component**: `ProductsListPageComponent`

**Purpose**: Displays all products in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Search by code, name, category
- Filter by product type (SIMPLE, COMPOSITE)
- Pagination
- Action buttons (View, Edit, Delete)
- Add new product button
- Product type and unit badges

### Form Page

**Route**: `/catalog/products/new` (Create) | `/catalog/products/:id/edit` (Edit)

**Component**: `ProductsFormPageComponent`

**Purpose**: Create new product or edit existing one.

**Features**:

- Tab-based layout (General, Composition for COMPOSITE)
- Reactive forms with validation
- Product type selection (only on create)
- Unit of measure selection
- Bulk quantity input (if BULK unit)
- Dynamic composition management for COMPOSITE products
- Pending changes guard

### Details Page

**Route**: `/catalog/products/:id`

**Component**: `ProductsDetailsPageComponent`

**Purpose**: Display complete product information in read-only mode.

**Features**:

- Complete product data display
- Composition table for COMPOSITE products
- Component stock levels display
- Max assemblable units indicator
- Edit and Delete actions

---

## Data Models

### Interfaces

#### ProductList

**Usage**: List page table rows (GET /api/products)

**Purpose**: Minimal data for table display.

```typescript
export interface ProductList {
  id: number; // Product ID
  code: string; // Product code (PRD-XXXXX)
  name: string; // Product name
  category: string; // Category name
  salePrice: number; // Sale price
  productType: ProductType; // SIMPLE or COMPOSITE
  primaryUnitOfMeasure: UnitOfMeasure; // UNIT, KILOGRAM, or BULK
  bulkQuantity: number | null; // Units per bulk (if BULK)
  active: boolean; // Active status
}
```

**API Mapping**: Maps directly from `ProductListResponse`

---

#### ProductDetails

**Usage**: Details page display (GET /api/products/:id)

**Purpose**: Complete product data for viewing.

```typescript
export interface ProductCompositionDetails {
  id: number;
  componentProductId: number;
  componentProductCode: string;
  componentProductName: string;
  quantityRequired: number;
  componentUnitOfMeasure: UnitOfMeasure;
  currentStock?: number;
}

export interface ProductDetails {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: string;
  costPrice: number;
  salePrice: number;
  productType: ProductType;
  primaryUnitOfMeasure: UnitOfMeasure;
  bulkQuantity: number | null;
  active: boolean;
  compositions: ProductCompositionDetails[] | null;
  maxAssemblableUnits: number | null;
  createdAt: string;
  updatedAt: string;
}
```

**API Mapping**: Maps from `ProductDetailResponse`

---

#### ProductEdit

**Usage**: Edit form data (derived from GET /api/products/:id)

**Purpose**: Form data for editing existing product.

```typescript
export interface ProductEdit {
  name: string;
  description: string | null;
  category: string;
  costPrice: number;
  salePrice: number;
}
```

**API Mapping**: Maps to `UpdateProductRequest` for PUT request

**Note**: Cannot change productType, primaryUnitOfMeasure, or bulkQuantity after creation.

---

#### ProductCreate

**Usage**: Create form submission (POST /api/products)

**Purpose**: New product creation data.

```typescript
export interface ProductCompositionCreate {
  componentProductId: number;
  quantityRequired: number;
  componentUnitOfMeasure: UnitOfMeasure;
}

export interface ProductCreate {
  name: string;
  description: string | null;
  category: string;
  costPrice: number;
  salePrice: number;
  productType: ProductType;
  primaryUnitOfMeasure: UnitOfMeasure;
  bulkQuantity: number | null;
  components: ProductCompositionCreate[] | null;
}
```

**API Mapping**: Maps directly to `CreateProductRequest`

---

#### ProductStock

**Usage**: Product stock breakdown (GET /api/products/:id/stock)

**Purpose**: Stock information by warehouse with component details for composite products.

```typescript
export interface ProductStockByWarehouse {
  warehouseId: string; // Warehouse UUID
  warehouseCode: string; // Warehouse code (WH-XXX)
  warehouseName: string; // Warehouse name
  quantity: number; // Quantity in warehouse
  lastMovementAt: string | null; // Last stock movement timestamp
}

export interface ProductCompositionStock {
  componentProductId: string; // Component product UUID
  componentProductCode: string; // Component product code
  componentProductName: string; // Component product name
  quantityRequired: number; // Quantity required per composite unit
  componentUnitOfMeasure: UnitOfMeasure; // Component unit of measure
  totalStock: number; // Total stock across all warehouses
  stockByWarehouse: ProductStockByWarehouse[]; // Stock breakdown by warehouse
}

export interface ProductStock {
  productId: string; // Product UUID
  productCode: string; // Product code (PRD-XXXXX)
  productName: string; // Product name
  productType: ProductType; // SIMPLE or COMPOSITE
  primaryUnitOfMeasure: UnitOfMeasure; // Primary unit of measure
  totalStock: number; // Total stock across all warehouses
  stockByWarehouse: ProductStockByWarehouse[]; // Stock breakdown by warehouse
  compositions: ProductCompositionStock[] | null; // Component stock (COMPOSITE only)
}
```

**API Mapping**: Maps directly from `ProductStockResponse`

---

### Enums

#### ProductType

```typescript
export enum ProductType {
  SIMPLE = 'SIMPLE', // Standard product with direct stock tracking
  COMPOSITE = 'COMPOSITE', // Product assembled from components
}

export interface ProductTypeOption {
  label: string;
  value: ProductType;
}

export const PRODUCT_TYPES: readonly ProductTypeOption[] = [
  { label: 'Simple', value: ProductType.SIMPLE },
  { label: 'Compuesto', value: ProductType.COMPOSITE },
] as const;

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.SIMPLE]: 'Simple',
  [ProductType.COMPOSITE]: 'Compuesto',
};

export function getProductTypeLabel(type: ProductType): string {
  return PRODUCT_TYPE_LABELS[type] || type;
}
```

---

#### UnitOfMeasure

```typescript
export enum UnitOfMeasure {
  UNIT = 'UNIT', // Individual units (1 bottle, 1 item)
  KILOGRAM = 'KILOGRAM', // Weight-based (2.5 kg of flour)
  BULK = 'BULK', // Packages/Bundles (1 bulk = 12 units)
}

export interface UnitOfMeasureOption {
  label: string;
  value: UnitOfMeasure;
}

export const UNITS_OF_MEASURE: readonly UnitOfMeasureOption[] = [
  { label: 'Unidad', value: UnitOfMeasure.UNIT },
  { label: 'Kilogramo', value: UnitOfMeasure.KILOGRAM },
  { label: 'Bulto', value: UnitOfMeasure.BULK },
] as const;

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.UNIT]: 'Unidad',
  [UnitOfMeasure.KILOGRAM]: 'Kilogramo',
  [UnitOfMeasure.BULK]: 'Bulto',
};

export function getUnitOfMeasureLabel(unit: UnitOfMeasure): string {
  return UNIT_OF_MEASURE_LABELS[unit] || unit;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/products`

### Interface Mapping Summary

| HTTP Method | Endpoint                | Request Interface | Response Interface | Frontend Usage             |
| ----------- | ----------------------- | ----------------- | ------------------ | -------------------------- |
| GET         | /api/products           | -                 | `ProductList[]`    | List page                  |
| GET         | /api/products/:id       | -                 | `ProductDetails`   | Details/Edit page          |
| GET         | /api/products/:id/stock | -                 | `ProductStock`     | Details page stock section |
| POST        | /api/products           | `ProductCreate`   | `ProductDetails`   | Create form                |
| PUT         | /api/products/:id       | `ProductEdit`     | `ProductDetails`   | Edit form                  |
| DELETE      | /api/products/:id       | -                 | void (204)         | Delete action              |

---

### GET /api/products

**Purpose**: List all products

**Frontend Interface**: `ProductList[]`

**Query Parameters**:

- `category` (string): Filter by category
- `productType` (string): Filter by type (SIMPLE, COMPOSITE)

**Example Response**:

```json
[
  {
    "id": 1,
    "code": "PRD-00001",
    "name": "Laptop Dell XPS 15",
    "category": "Electronics",
    "salePrice": 1200.0,
    "productType": "SIMPLE",
    "primaryUnitOfMeasure": "UNIT",
    "bulkQuantity": null,
    "active": true
  },
  {
    "id": 2,
    "code": "PRD-00002",
    "name": "Gift Basket Premium",
    "category": "Gifts",
    "salePrice": 75.0,
    "productType": "COMPOSITE",
    "primaryUnitOfMeasure": "UNIT",
    "bulkQuantity": null,
    "active": true
  }
]
```

---

### GET /api/products/:id

**Purpose**: Get product by ID

**Frontend Interface**: `ProductDetails`

**Example Response** (Simple Product):

```json
{
  "id": 1,
  "code": "PRD-00001",
  "name": "Laptop Dell XPS 15",
  "description": "15-inch professional laptop",
  "category": "Electronics",
  "costPrice": 800.0,
  "salePrice": 1200.0,
  "productType": "SIMPLE",
  "primaryUnitOfMeasure": "UNIT",
  "bulkQuantity": null,
  "active": true,
  "compositions": null,
  "maxAssemblableUnits": null,
  "createdAt": "2025-12-17T10:00:00",
  "updatedAt": "2025-12-17T10:00:00"
}
```

**Example Response** (Composite Product):

```json
{
  "id": 2,
  "code": "PRD-00002",
  "name": "Gift Basket Premium",
  "description": "Luxury gift basket with wine and chocolates",
  "category": "Gifts",
  "costPrice": 45.0,
  "salePrice": 75.0,
  "productType": "COMPOSITE",
  "primaryUnitOfMeasure": "UNIT",
  "bulkQuantity": null,
  "active": true,
  "compositions": [
    {
      "id": 1,
      "componentProductId": 10,
      "componentProductCode": "PRD-00010",
      "componentProductName": "Red Wine Bottle",
      "quantityRequired": 2.0,
      "componentUnitOfMeasure": "UNIT",
      "currentStock": 150
    },
    {
      "id": 2,
      "componentProductId": 11,
      "componentProductCode": "PRD-00011",
      "componentProductName": "Premium Chocolates",
      "quantityRequired": 0.5,
      "componentUnitOfMeasure": "KILOGRAM",
      "currentStock": 25.5
    }
  ],
  "maxAssemblableUnits": 51,
  "createdAt": "2025-12-17T10:05:00",
  "updatedAt": "2025-12-17T10:05:00"
}
```

---

### GET /api/products/:id/stock

**Purpose**: Get product stock breakdown by warehouse

**Frontend Interface**: `ProductStock`

**Description**: Returns the total stock of a product across all warehouses, with detailed breakdown per warehouse. For COMPOSITE products, also includes the stock information for each component product.

**Example Response** (Simple Product):

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "productCode": "PRD-00001",
  "productName": "Laptop Dell XPS 15",
  "productType": "SIMPLE",
  "primaryUnitOfMeasure": "UNIT",
  "totalStock": 150,
  "stockByWarehouse": [
    {
      "warehouseId": "550e8400-e29b-41d4-a716-446655440100",
      "warehouseCode": "WH-001",
      "warehouseName": "Almacén Principal",
      "quantity": 100,
      "lastMovementAt": "2025-12-15T10:00:00"
    },
    {
      "warehouseId": "550e8400-e29b-41d4-a716-446655440101",
      "warehouseCode": "WH-002",
      "warehouseName": "Almacén Secundario",
      "quantity": 50,
      "lastMovementAt": "2025-12-14T15:30:00"
    }
  ],
  "compositions": null
}
```

**Example Response** (Composite Product):

```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440002",
  "productCode": "PRD-00002",
  "productName": "Gift Basket Premium",
  "productType": "COMPOSITE",
  "primaryUnitOfMeasure": "UNIT",
  "totalStock": 25,
  "stockByWarehouse": [
    {
      "warehouseId": "550e8400-e29b-41d4-a716-446655440100",
      "warehouseCode": "WH-001",
      "warehouseName": "Almacén Principal",
      "quantity": 25,
      "lastMovementAt": "2025-12-16T14:00:00"
    }
  ],
  "compositions": [
    {
      "componentProductId": "550e8400-e29b-41d4-a716-446655440010",
      "componentProductCode": "PRD-00010",
      "componentProductName": "Red Wine Bottle",
      "quantityRequired": 2,
      "componentUnitOfMeasure": "UNIT",
      "totalStock": 150,
      "stockByWarehouse": [
        {
          "warehouseId": "550e8400-e29b-41d4-a716-446655440100",
          "warehouseCode": "WH-001",
          "warehouseName": "Almacén Principal",
          "quantity": 100,
          "lastMovementAt": "2025-12-15T10:00:00"
        },
        {
          "warehouseId": "550e8400-e29b-41d4-a716-446655440101",
          "warehouseCode": "WH-002",
          "warehouseName": "Almacén Secundario",
          "quantity": 50,
          "lastMovementAt": "2025-12-14T15:30:00"
        }
      ]
    },
    {
      "componentProductId": "550e8400-e29b-41d4-a716-446655440011",
      "componentProductCode": "PRD-00011",
      "componentProductName": "Premium Chocolates",
      "quantityRequired": 0.5,
      "componentUnitOfMeasure": "KILOGRAM",
      "totalStock": 25.5,
      "stockByWarehouse": [
        {
          "warehouseId": "550e8400-e29b-41d4-a716-446655440100",
          "warehouseCode": "WH-001",
          "warehouseName": "Almacén Principal",
          "quantity": 25.5,
          "lastMovementAt": "2025-12-14T09:00:00"
        }
      ]
    }
  ]
}
```

**Errors**:

- `404 Not Found`: Product does not exist

---

### POST /api/products

**Purpose**: Create new product

**Frontend Interface**: `ProductCreate` (request), `ProductDetails` (response)

**Example Request** (Simple):

```json
{
  "name": "Laptop Dell XPS 15",
  "description": "15-inch professional laptop",
  "category": "Electronics",
  "costPrice": 800.0,
  "salePrice": 1200.0,
  "productType": "SIMPLE",
  "primaryUnitOfMeasure": "UNIT"
}
```

**Example Request** (Composite):

```json
{
  "name": "Gift Basket Premium",
  "description": "Luxury gift basket",
  "category": "Gifts",
  "costPrice": 45.0,
  "salePrice": 75.0,
  "productType": "COMPOSITE",
  "primaryUnitOfMeasure": "UNIT",
  "components": [
    {
      "componentProductId": 10,
      "quantityRequired": 2.0,
      "componentUnitOfMeasure": "UNIT"
    },
    {
      "componentProductId": 11,
      "quantityRequired": 0.5,
      "componentUnitOfMeasure": "KILOGRAM"
    }
  ]
}
```

**Example Request** (Bulk):

```json
{
  "name": "Coca-Cola Case",
  "description": "Case of 12 Coca-Cola cans",
  "category": "Beverages",
  "costPrice": 8.0,
  "salePrice": 12.0,
  "productType": "SIMPLE",
  "primaryUnitOfMeasure": "BULK",
  "bulkQuantity": 12
}
```

---

### PUT /api/products/:id

**Purpose**: Update existing product

**Frontend Interface**: `ProductEdit` (request), `ProductDetails` (response)

**Example Request**:

```json
{
  "name": "Gift Basket Premium Deluxe",
  "description": "Updated description",
  "category": "Gifts",
  "costPrice": 50.0,
  "salePrice": 85.0
}
```

**Note**: Cannot change productType, primaryUnitOfMeasure, or bulkQuantity after creation. Compositions are updated through this same endpoint.

---

### DELETE /api/products/:id

**Purpose**: Soft delete product (marks as inactive)

**Response**: 204 No Content

**Errors**:

- `409 Conflict`: Cannot delete product with existing stock or used as component

---

## Validation Rules

### Field Validations

| Field                  | Type   | Required    | Rules                        | Error Message                             |
| ---------------------- | ------ | ----------- | ---------------------------- | ----------------------------------------- |
| `name`                 | string | Yes         | 3-200 characters             | "Name must be 3-200 characters"           |
| `description`          | string | No          | Max 1000 characters          | "Description must be max 1000 characters" |
| `category`             | string | Yes         | Max 100 characters           | "Category is required"                    |
| `costPrice`            | number | Yes         | > 0, scale 2                 | "El precio debe ser mayor a cero"         |
| `salePrice`            | number | Yes         | > 0, scale 2                 | "El precio debe ser mayor a cero"         |
| `productType`          | enum   | Yes         | SIMPLE or COMPOSITE          | "Product type is required"                |
| `primaryUnitOfMeasure` | enum   | Yes         | UNIT, KILOGRAM, or BULK      | "Unit of measure is required"             |
| `bulkQuantity`         | number | Conditional | Required if BULK, > 0        | "Bulk quantity required for BULK unit"    |
| `components`           | array  | Conditional | Required if COMPOSITE, min 1 | "At least one component required"         |
| `quantityRequired`     | number | Yes         | > 0, scale 3                 | "Quantity must be positive"               |

### Custom Validators

```typescript
// validators/product.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ProductType, UnitOfMeasure } from '../models';

export class ProductValidators {
  static bulkQuantityRequired(productTypeControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const unitOfMeasure = control.parent?.get('primaryUnitOfMeasure')?.value;

      if (unitOfMeasure === UnitOfMeasure.BULK) {
        if (!control.value || control.value <= 0) {
          return { bulkQuantityRequired: 'Bulk quantity required for BULK unit' };
        }
      }

      return null;
    };
  }

  static compositionRequired(productTypeControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const productType = productTypeControl.value;

      if (productType === ProductType.COMPOSITE) {
        if (!control.value || !Array.isArray(control.value) || control.value.length === 0) {
          return { compositionRequired: 'At least one component required for COMPOSITE products' };
        }
      }

      return null;
    };
  }

  static noCompositionForSimple(productTypeControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const productType = productTypeControl.value;

      if (productType === ProductType.SIMPLE) {
        if (control.value && Array.isArray(control.value) && control.value.length > 0) {
          return { noCompositionForSimple: 'SIMPLE products cannot have compositions' };
        }
      }

      return null;
    };
  }

  static positiveQuantity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      if (control.value <= 0) {
        return { invalidQuantity: 'Quantity must be positive' };
      }

      return null;
    };
  }
}
```

---

## Form Structure

### Tab Organization

#### Tab 1: General Information

- **Component**: `product-general-section`
- **Fields**: name, description, category, costPrice, salePrice, productType, primaryUnitOfMeasure, bulkQuantity, active

#### Tab 2: Composition (COMPOSITE only)

- **Component**: `product-composition-section`
- **Fields**: components[] (componentProductId, quantityRequired, componentUnitOfMeasure)
- **Visibility**: Only shown when productType === COMPOSITE

### Form Model

```typescript
interface ProductFormModel {
  // Tab 1: General
  id?: number;
  code?: string;
  name: string;
  description: string | null;
  category: string;
  costPrice: number;
  salePrice: number;
  productType: ProductType;
  primaryUnitOfMeasure: UnitOfMeasure;
  bulkQuantity: number | null;
  active: boolean;

  // Tab 2: Composition (COMPOSITE only)
  components: ProductCompositionFormModel[];
}

interface ProductCompositionFormModel {
  componentProductId: number;
  componentProductName?: string; // Display only
  quantityRequired: number;
  componentUnitOfMeasure: UnitOfMeasure;
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/product-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  getAll(params?: { category?: string; productType?: string }): Observable<ProductList[]> {
    return this.http.get<ProductList[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ProductDetails> {
    return this.http.get<ProductDetails>(`${this.baseUrl}/${id}`);
  }

  getStock(id: string): Observable<ProductStock> {
    return this.http.get<ProductStock>(`${this.baseUrl}/${id}/stock`);
  }

  create(data: ProductCreate): Observable<ProductDetails> {
    return this.http.post<ProductDetails>(this.baseUrl, data);
  }

  update(id: number, data: ProductEdit): Observable<ProductDetails> {
    return this.http.put<ProductDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/product-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class ProductApplicationService {
  private readonly api = inject(ProductApiService);
  private readonly mapper = inject(ProductMapper);

  // State signals
  readonly products = signal<ProductList[]>([]);
  readonly currentProduct = signal<ProductDetails | null>(null);
  readonly currentProductStock = signal<ProductStock | null>(null);
  readonly loading = signal(false);
  readonly stockLoading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(params?: { category?: string; productType?: string }): Observable<ProductList[]> {
    this.loading.set(true);
    return this.api.getAll(params).pipe(
      tap((products) => this.products.set(products)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: number): Observable<ProductDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((product) => this.currentProduct.set(product)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadStock(id: string): Observable<ProductStock> {
    this.stockLoading.set(true);
    return this.api.getStock(id).pipe(
      tap((stock) => this.currentProductStock.set(stock)),
      finalize(() => this.stockLoading.set(false)),
    );
  }

  create(data: ProductCreate): Observable<ProductDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(finalize(() => this.loading.set(false)));
  }

  update(id: number, data: ProductEdit): Observable<ProductDetails> {
    this.loading.set(true);
    return this.api.update(id, data).pipe(finalize(() => this.loading.set(false)));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id);
  }

  clearCurrentProduct(): void {
    this.currentProduct.set(null);
    this.currentProductStock.set(null);
  }

  clearProductStock(): void {
    this.currentProductStock.set(null);
  }
}
```

---

### Mapper Service

**File**: `services/mappers/product.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class ProductMapper {
  toFormModel(details: ProductDetails): ProductFormModel {
    return {
      id: details.id,
      code: details.code,
      name: details.name,
      description: details.description,
      category: details.category,
      costPrice: details.costPrice,
      salePrice: details.salePrice,
      productType: details.productType,
      primaryUnitOfMeasure: details.primaryUnitOfMeasure,
      bulkQuantity: details.bulkQuantity,
      active: details.active,
      components:
        details.compositions?.map((c) => ({
          componentProductId: c.componentProductId,
          componentProductName: c.componentProductName,
          quantityRequired: c.quantityRequired,
          componentUnitOfMeasure: c.componentUnitOfMeasure,
        })) || [],
    };
  }

  toCreateRequest(form: ProductFormModel): ProductCreate {
    return {
      name: form.name,
      description: form.description,
      category: form.category,
      costPrice: form.costPrice,
      salePrice: form.salePrice,
      productType: form.productType,
      primaryUnitOfMeasure: form.primaryUnitOfMeasure,
      bulkQuantity: form.primaryUnitOfMeasure === UnitOfMeasure.BULK ? form.bulkQuantity : null,
      components:
        form.productType === ProductType.COMPOSITE
          ? form.components.map((c) => ({
              componentProductId: c.componentProductId,
              quantityRequired: c.quantityRequired,
              componentUnitOfMeasure: c.componentUnitOfMeasure,
            }))
          : null,
    };
  }

  toUpdateRequest(form: ProductFormModel): ProductEdit {
    return {
      name: form.name,
      description: form.description,
      category: form.category,
      costPrice: form.costPrice,
      salePrice: form.salePrice,
    };
  }
}
```

---

## Business Rules

### Product Type Rules

**SIMPLE Products**:

1. Cannot have compositions
2. Stock tracked directly in warehouse
3. Adding/removing stock affects quantity directly

**COMPOSITE Products**:

1. MUST have at least 1 composition (no maximum limit)
2. Stock tracked in warehouse
3. Adding stock triggers automatic component deduction
4. Cannot add stock if insufficient components available

### Unit of Measure Rules

1. **UNIT**: bulkQuantity must be NULL
2. **KILOGRAM**: bulkQuantity must be NULL, quantity can be decimal
3. **BULK**: bulkQuantity REQUIRED and > 0

### Composition Rules

1. Component products must exist and be active
2. quantityRequired must be > 0
3. No self-reference (product cannot require itself)
4. No circular dependencies (A requires B, B requires A)
5. componentUnitOfMeasure must match component's primaryUnitOfMeasure
6. Update replaces all compositions (send complete arrays)

### Code and Immutability Rules

1. Product code is auto-generated (PRD-00001, PRD-00002...)
2. Product code cannot be changed after creation
3. ProductType cannot be changed after creation
4. primaryUnitOfMeasure cannot be changed after creation
5. bulkQuantity cannot be changed after creation

### Deletion Rules

1. Cannot delete product with existing stock
2. Cannot delete product used as component in other products
3. Soft delete: marks as inactive

---

## Routes Configuration

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.CATALOG_PRODUCTS },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-list-page/products-list-page.component'
          ).then((m) => m.ProductsListPageComponent),
        title: 'Productos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-form-page/products-form-page.component'
          ).then((m) => m.ProductsFormPageComponent),
        title: 'Nuevo Producto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-details-page/products-details-page.component'
          ).then((m) => m.ProductsDetailsPageComponent),
        title: 'Detalles de Producto',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-form-page/products-form-page.component'
          ).then((m) => m.ProductsFormPageComponent),
        title: 'Editar Producto',
      },
    ],
  },
];
```

---

## Testing Requirements

### Unit Tests

- [ ] Bulk quantity validator tested
- [ ] Composition required validator tested
- [ ] No composition for simple validator tested
- [ ] Positive quantity validator tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly with type badges
- [ ] Form page shows/hides composition tab based on type
- [ ] Form page shows/hides bulk quantity based on unit
- [ ] Details page displays compositions correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow for SIMPLE product
- [ ] Full CRUD workflow for COMPOSITE product
- [ ] Composition update workflow
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Product operations require authentication
- [Warehouses Module](./warehouses.md) - Stock management references products
- [Dashboard Module](./dashboard.md) - Product metrics displayed

---

## Notes

### Important Considerations

1. **Product Code**: Auto-generated as PRD-XXXXX and cannot be changed.
2. **Composition Management**: Compositions are managed ONLY through Product endpoints.
3. **Replace All Strategy**: Update replaces all compositions - send complete arrays.
4. **Immutable Fields**: productType, primaryUnitOfMeasure, bulkQuantity cannot change after creation.
5. **Soft Delete**: Products are not physically deleted, just marked inactive.
6. **Circular Dependencies**: Backend validates and rejects circular composition dependencies.
7. **Max Assemblable Units**: Shows how many composite units can be assembled with current component stock.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Use TabView for form sections
- Conditionally show composition tab based on productType
- Conditionally show bulkQuantity based on primaryUnitOfMeasure

---

**Last Updated**: 2026-11-03

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
