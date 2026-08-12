# Differentials Module

## Overview

The Differentials module manages price differentials (percentage adjustments) that can be applied to product prices. It handles both price increases and discounts through percentage values that modify the base sale price of products.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/differentials/
├── models/
│   ├── interfaces/
│   │   ├── differential-list.interface.ts
│   │   ├── differential-details.interface.ts
│   │   ├── differential-edit.interface.ts
│   │   ├── differential-create.interface.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── differentials-list-page/
│   │   ├── differentials-list-page.component.ts
│   │   ├── differentials-list-page.component.html
│   │   └── differentials-list-page.component.spec.ts
│   ├── differentials-form-page/
│   │   ├── differentials-form-page.component.ts
│   │   ├── differentials-form-page.component.html
│   │   └── differentials-form-page.component.spec.ts
│   ├── differentials-details-page/
│   │   ├── differentials-details-page.component.ts
│   │   ├── differentials-details-page.component.html
│   │   └── differentials-details-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── differential-api.service.ts
│   │   ├── differential-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── differential-application.service.ts
│   │   ├── differential-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── differential.mapper.ts
│   │   ├── differential.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── differential.validators.ts
│   ├── differential.validators.spec.ts
│   └── index.ts
├── router/
│   ├── differential.routes.ts
│   └── index.ts
└── index.ts
```

**Note**: This is a simple CRUD module with no nested entities or tab sections.

---

## Features

- Differential CRUD operations (create, read, update, delete)
- Percentage-based price adjustments
- Support for price increases (positive percentage)
- Support for discounts (negative percentage)
- Percentage range validation (-100 to +100)
- Active/Inactive status management
- Price calculation helper utilities

---

## Pages

### List Page

**Route**: `/differentials`

**Component**: `DifferentialsListPageComponent`

**Purpose**: Displays all differentials in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Filter by active status
- Pagination
- Action buttons (View, Edit, Delete)
- Add new differential button
- Visual indicators for positive/negative percentages
- Active/Inactive status badges

### Form Page

**Route**: `/differentials/new` (Create) | `/differentials/:id/edit` (Edit)

**Component**: `DifferentialsFormPageComponent`

**Purpose**: Create new differential or edit existing one.

**Features**:

- Simple form layout (no tabs needed)
- Percentage input with range validation
- Active status toggle
- Real-time validation feedback
- Pending changes guard

### Details Page

**Route**: `/differentials/:id`

**Component**: `DifferentialsDetailsPageComponent`

**Purpose**: Display complete differential information in read-only mode.

**Features**:

- Complete differential data display
- Visual representation of percentage effect
- Example price calculations
- Edit and Delete actions

---

## Data Models

### Interfaces

#### DifferentialList

**Usage**: List page table rows (GET /api/differentials)

**Purpose**: Minimal data for table display.

```typescript
export interface DifferentialList {
  id: number; // Differential ID
  percentage: number; // Percentage value (-100 to +100)
  active: boolean; // Active status
}
```

**API Mapping**: Maps directly from `DifferentialListResponse`

---

#### DifferentialDetails

**Usage**: Details page display (GET /api/differentials/:id)

**Purpose**: Complete differential data for viewing.

```typescript
export interface DifferentialDetails {
  id: number; // Differential ID
  percentage: number; // Percentage value (-100 to +100)
  active: boolean; // Active status
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

**API Mapping**: Maps from `DifferentialDetailResponse`

---

#### DifferentialEdit

**Usage**: Edit form data (derived from GET /api/differentials/:id)

**Purpose**: Form data for editing existing differential.

```typescript
export interface DifferentialEdit {
  percentage: number; // -100 to +100
  active: boolean;
}
```

**API Mapping**: Maps to `UpdateDifferentialRequest` for PUT request

---

#### DifferentialCreate

**Usage**: Create form submission (POST /api/differentials)

**Purpose**: New differential creation data.

```typescript
export interface DifferentialCreate {
  percentage: number; // Required, -100 to +100
  active: boolean; // Required
}
```

**API Mapping**: Maps directly to `CreateDifferentialRequest`

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/differentials`

### Interface Mapping Summary

| HTTP Method | Endpoint               | Request Interface    | Response Interface    | Frontend Usage    |
| ----------- | ---------------------- | -------------------- | --------------------- | ----------------- |
| GET         | /api/differentials     | -                    | `DifferentialList[]`  | List page         |
| GET         | /api/differentials/:id | -                    | `DifferentialDetails` | Details/Edit page |
| POST        | /api/differentials     | `DifferentialCreate` | `DifferentialDetails` | Create form       |
| PUT         | /api/differentials/:id | `DifferentialEdit`   | `DifferentialDetails` | Edit form         |
| DELETE      | /api/differentials/:id | -                    | void (204)            | Delete action     |

---

### GET /api/differentials

**Purpose**: List all differentials

**Frontend Interface**: `DifferentialList[]`

**Query Parameters**:

- `active` (boolean): Filter by active status

**Example Response**:

```json
[
  {
    "id": 1,
    "percentage": 10.0,
    "active": true
  },
  {
    "id": 2,
    "percentage": -15.0,
    "active": true
  },
  {
    "id": 3,
    "percentage": 25.0,
    "active": false
  }
]
```

---

### GET /api/differentials/:id

**Purpose**: Get differential by ID

**Frontend Interface**: `DifferentialDetails`

**Example Response**:

```json
{
  "id": 1,
  "percentage": 10.0,
  "active": true,
  "createdAt": "2025-12-17T10:00:00",
  "updatedAt": "2025-12-17T11:30:00"
}
```

---

### POST /api/differentials

**Purpose**: Create new differential

**Frontend Interface**: `DifferentialCreate` (request), `DifferentialDetails` (response)

**Example Request** (Price Increase):

```json
{
  "percentage": 10.0,
  "active": true
}
```

**Example Request** (Discount):

```json
{
  "percentage": -15.0,
  "active": true
}
```

**Example Response**: Same as GET /:id (with generated ID and timestamps)

---

### PUT /api/differentials/:id

**Purpose**: Update existing differential

**Frontend Interface**: `DifferentialEdit` (request), `DifferentialDetails` (response)

**Example Request**:

```json
{
  "percentage": 20.0,
  "active": false
}
```

---

### DELETE /api/differentials/:id

**Purpose**: Delete differential

**Response**: 204 No Content

---

## Validation Rules

### Field Validations

| Field        | Type    | Required | Rules                 | Error Message                             |
| ------------ | ------- | -------- | --------------------- | ----------------------------------------- |
| `percentage` | number  | Yes      | -100 to +100, scale 2 | "Percentage must be between -100 and 100" |
| `active`     | boolean | Yes      | -                     | -                                         |

### Custom Validators

```typescript
// validators/differential.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DifferentialValidators {
  static percentageRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;

      const value = Number(control.value);

      if (isNaN(value)) {
        return { invalidPercentage: 'Percentage must be a number' };
      }

      if (value < -100 || value > 100) {
        return { percentageOutOfRange: 'Percentage must be between -100 and 100' };
      }

      return null;
    };
  }
}
```

---

## Form Structure

### Single Form (No Tabs)

- **Fields**: percentage, active
- **Simple layout** - no sections or tabs needed

### Form Model

```typescript
interface DifferentialFormModel {
  id?: number;
  percentage: number;
  active: boolean;
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/differential-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class DifferentialApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/differentials';

  getAll(params?: { active?: boolean }): Observable<DifferentialList[]> {
    return this.http.get<DifferentialList[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<DifferentialDetails> {
    return this.http.get<DifferentialDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: DifferentialCreate): Observable<DifferentialDetails> {
    return this.http.post<DifferentialDetails>(this.baseUrl, data);
  }

  update(id: number, data: DifferentialEdit): Observable<DifferentialDetails> {
    return this.http.put<DifferentialDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/differential-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class DifferentialApplicationService {
  private readonly api = inject(DifferentialApiService);
  private readonly mapper = inject(DifferentialMapper);

  // State signals
  readonly differentials = signal<DifferentialList[]>([]);
  readonly currentDifferential = signal<DifferentialDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(params?: { active?: boolean }): Observable<DifferentialList[]> {
    this.loading.set(true);
    return this.api.getAll(params).pipe(
      tap((differentials) => this.differentials.set(differentials)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: number): Observable<DifferentialDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((differential) => this.currentDifferential.set(differential)),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: DifferentialCreate): Observable<DifferentialDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(finalize(() => this.loading.set(false)));
  }

  update(id: number, data: DifferentialEdit): Observable<DifferentialDetails> {
    this.loading.set(true);
    return this.api.update(id, data).pipe(finalize(() => this.loading.set(false)));
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id);
  }

  /**
   * Calculate final price with differential applied
   * Formula: finalPrice = salePrice × (1 + percentage/100)
   */
  calculateFinalPrice(salePrice: number, percentage: number): number {
    const multiplier = 1 + percentage / 100;
    return Math.round(salePrice * multiplier * 100) / 100; // Round to 2 decimals
  }
}
```

---

### Mapper Service

**File**: `services/mappers/differential.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class DifferentialMapper {
  toFormModel(details: DifferentialDetails): DifferentialFormModel {
    return {
      id: details.id,
      percentage: details.percentage,
      active: details.active,
    };
  }

  toCreateRequest(form: DifferentialFormModel): DifferentialCreate {
    return {
      percentage: form.percentage,
      active: form.active,
    };
  }

  toUpdateRequest(form: DifferentialFormModel): DifferentialEdit {
    return {
      percentage: form.percentage,
      active: form.active,
    };
  }
}
```

---

## Business Rules

### Percentage Rules

1. Percentage must be between -100 and +100
2. Positive percentage = price increase (e.g., +10 = 10% more expensive)
3. Negative percentage = discount (e.g., -15 = 15% discount)
4. Zero percentage = no price change (allowed)
5. Precision: scale of 2 decimal places

### Active Status Rules

1. Only active differentials should be applied to prices
2. Inactive differentials exist but are not used
3. Can be activated/deactivated as needed

### Price Calculation

**Formula**: `finalPrice = salePrice × (1 + percentage/100)`

**Examples**:

- salePrice = $100, percentage = +10 → finalPrice = $110
- salePrice = $100, percentage = -15 → finalPrice = $85
- salePrice = $200, percentage = +25 → finalPrice = $250
- salePrice = $200, percentage = -50 → finalPrice = $100
- salePrice = $50, percentage = +100 → finalPrice = $100 (double price)

---

## Routes Configuration

```typescript
// router/differential.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const DIFFERENTIAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/differentials-list-page/differentials-list-page.component').then(
        (m) => m.DifferentialsListPageComponent,
      ),
    title: 'Diferenciales',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/differentials-form-page/differentials-form-page.component').then(
        (m) => m.DifferentialsFormPageComponent,
      ),
    title: 'Nuevo Diferencial',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/differentials-details-page/differentials-details-page.component').then(
        (m) => m.DifferentialsDetailsPageComponent,
      ),
    title: 'Detalles del Diferencial',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/differentials-form-page/differentials-form-page.component').then(
        (m) => m.DifferentialsFormPageComponent,
      ),
    title: 'Editar Diferencial',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Testing Requirements

### Unit Tests

- [ ] Percentage range validator tested (-100 to +100)
- [ ] Price calculation formula tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly
- [ ] List page shows positive/negative indicators
- [ ] Form page validates percentage range
- [ ] Details page displays correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow tested
- [ ] Filter by active status tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Differential operations require authentication
- [Products Module](./products.md) - Differentials may be applied to product prices

---

## Notes

### Important Considerations

1. **Simple Entity**: Differential is a simple entity with no nested structures.
2. **Percentage Meaning**: Positive = increase, Negative = discount.
3. **Active Validation**: Only apply active differentials to prices.
4. **Precision**: Use 2 decimal places for percentage values.
5. **Rounding**: Round final prices to 2 decimal places using HALF_UP.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Show visual indicators for positive (green) vs negative (red) percentages
- Include example price calculations in details page

### Usage Examples

#### 10% Price Increase

```
Differential: percentage = 10.00, active = true
Product base price: $100.00
Calculation: $100.00 × (1 + 10/100) = $100.00 × 1.10 = $110.00
Final price: $110.00
```

#### 15% Discount

```
Differential: percentage = -15.00, active = true
Product base price: $200.00
Calculation: $200.00 × (1 + (-15)/100) = $200.00 × 0.85 = $170.00
Final price: $170.00
```

#### 50% Discount

```
Differential: percentage = -50.00, active = true
Product base price: $80.00
Calculation: $80.00 × (1 + (-50)/100) = $80.00 × 0.50 = $40.00
Final price: $40.00
```

---

**Last Updated**: 2025-12-18

**Module Status**: [x] Planned | [ ] In Development | [ ] Implemented
