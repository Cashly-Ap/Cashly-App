# Merchants Module

## Overview

The Merchants module manages merchant (comercial) accounts that can authenticate into the system with limited access. Merchants are sales representatives who can create orders on behalf of customers and earn commissions when those orders are converted to invoices and paid.

**Important**:

- Merchants are **separate entities** from Users (not a User with a special role)
- Merchants can login to the system with **restricted permissions**
- Each merchant has a **single commission percentage** applied when invoices are paid
- Order management is handled in a **separate ORDERS module**

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/merchants/
├── models/
│   ├── interfaces/
│   │   ├── merchant-list.interface.ts
│   │   ├── merchant-details.interface.ts
│   │   ├── merchant-edit.interface.ts
│   │   ├── merchant-create.interface.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── merchants-list-page/
│   │   ├── merchants-list-page.component.ts
│   │   ├── merchants-list-page.component.html
│   │   └── merchants-list-page.component.spec.ts
│   ├── merchants-form-page/
│   │   ├── merchants-form-page.component.ts
│   │   ├── merchants-form-page.component.html
│   │   ├── merchants-form-page.component.spec.ts
│   │   └── merchants-form-page.config.ts
│   ├── merchants-details-page/
│   │   ├── merchants-details-page.component.ts
│   │   ├── merchants-details-page.component.html
│   │   └── merchants-details-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── merchant-api.service.ts
│   │   ├── merchant-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── merchant-application.service.ts
│   │   ├── merchant-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── merchant.mapper.ts
│   │   ├── merchant.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── merchant.validators.ts
│   ├── merchant.validators.spec.ts
│   └── index.ts
├── messages/
│   ├── error-messages.ts
│   ├── success-messages.ts
│   └── index.ts
├── router/
│   ├── merchant.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- Merchant registration with complete business information
- Login credentials management (email and password)
- Commission percentage configuration (0-100%)
- Active/Inactive status management
- Phone and address management
- Auto-generated sequential merchant codes
- Role-based access: Only ADMIN can create/edit/delete merchants

---

## What Merchants Can Do

| Action                       | Allowed |
| ---------------------------- | ------- |
| Login to system              | Yes     |
| Create orders                | Yes     |
| View own orders only         | Yes     |
| Cancel own pending orders    | Yes     |
| View products                | Yes     |
| View other merchants' orders | No      |
| Validate/reject orders       | No      |
| Convert orders to invoices   | No      |
| Access admin features        | No      |

---

## Pages

### List Page

**Route**: `/merchants`

**Component**: `MerchantsListPageComponent`

**Purpose**: Displays all merchants in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Search by name, email, code
- Filter by active status
- Pagination
- Action buttons (View, Edit, Delete)
- Add new merchant button
- Active status badge

**Access**: ADMIN and USER roles only (Merchants cannot view this page)

### Form Page

**Route**: `/merchants/new` (Create) | `/merchants/:id/edit` (Edit)

**Component**: `MerchantsFormPageComponent`

**Purpose**: Create new merchant or edit existing one.

**Features**:

- Reactive forms with validation
- Email validation (unique across merchants AND users)
- Password field (only on create)
- Commission percentage input (0-100%)
- Phone format validation
- Pending changes guard

**Access**: ADMIN role only

### Details Page

**Route**: `/merchants/:id`

**Component**: `MerchantsDetailsPageComponent`

**Purpose**: Display complete merchant information in read-only mode.

**Features**:

- Complete merchant data display
- Commission percentage display
- Active status indicator
- Edit and Delete actions

**Access**: ADMIN and USER roles

### Profile Page (Merchant Self)

**Route**: `/merchants/me` (or via main profile route)

**Component**: Uses `MerchantsDetailsPageComponent` with self mode

**Purpose**: Allow merchants to view their own profile.

**Features**:

- Own profile data display
- Commission percentage (read-only)
- Cannot edit own commission

**Access**: MERCHANT role only

---

## Data Models

### Interfaces

#### MerchantList

**Usage**: List page table rows (GET /api/merchants)

**Purpose**: Minimal data for table display.

```typescript
export interface MerchantList {
  id: string; // UUID identifier
  code: number; // Sequential merchant code (1, 2, 3...)
  name: string; // Merchant business name
  email: string; // Login email address
  commissionPercentage: number; // Commission rate (0-100)
  active: boolean; // Account active status
}
```

**API Mapping**: Maps directly from `MerchantListResponse`

---

#### MerchantDetails

**Usage**: Details page display (GET /api/merchants/:id)

**Purpose**: Complete merchant data for viewing.

```typescript
export interface MerchantDetails {
  id: string; // UUID identifier
  code: number; // Sequential merchant code
  name: string; // Merchant business name
  email: string; // Login email address
  phone: string; // Contact phone
  address: string | null; // Business address (optional)
  commissionPercentage: number; // Commission rate (0-100%)
  active: boolean; // Account active status
  createdAt: string; // ISO date string
}
```

**API Mapping**: Maps from `MerchantDetailResponse`

---

#### MerchantEdit

**Usage**: Edit form data (derived from GET /api/merchants/:id)

**Purpose**: Form data for editing existing merchant.

```typescript
export interface MerchantEdit {
  name: string; // Editable field
  email: string; // Editable field
  password?: string; // Optional - only if changing password
  phone: string; // Editable field
  address: string | null; // Editable field
  commissionPercentage: number; // Editable field (0-100%)
  active: boolean; // Editable field
}
```

**API Mapping**:

- Derived from `MerchantDetails` response
- Maps to `UpdateMerchantRequest` for PUT request

**Note**: Password is optional in edit mode. If not provided, the current password is kept.

---

#### MerchantCreate

**Usage**: Create form submission (POST /api/merchants)

**Purpose**: New merchant creation data.

```typescript
export interface MerchantCreate {
  name: string; // Required, 3-200 chars
  email: string; // Required, unique, valid email
  password: string; // Required, min 8 chars
  phone: string; // Required, non-blank
  address: string | null; // Optional, max 500 chars
  commissionPercentage: number; // Required, 0-100
  active: boolean; // Required, default true
}
```

**API Mapping**: Maps directly to `CreateMerchantRequest`

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/merchants`

### Interface Mapping Summary

| HTTP Method | Endpoint           | Request Interface | Response Interface | Frontend Usage    |
| ----------- | ------------------ | ----------------- | ------------------ | ----------------- |
| GET         | /api/merchants     | -                 | `MerchantList[]`   | List page         |
| GET         | /api/merchants/:id | -                 | `MerchantDetails`  | Details/Edit page |
| GET         | /api/merchants/me  | -                 | `MerchantDetails`  | Merchant profile  |
| POST        | /api/merchants     | `MerchantCreate`  | `MerchantDetails`  | Create form       |
| PUT         | /api/merchants/:id | `MerchantEdit`    | `MerchantDetails`  | Edit form         |
| DELETE      | /api/merchants/:id | -                 | void (204)         | Delete action     |

---

### GET /api/merchants

**Purpose**: List all merchants

**Frontend Interface**: `MerchantList[]`

**Roles**: ADMIN, USER

**Query Parameters** (optional):

- `active` (boolean): Filter by active status
- `page` (int): Page number (default: 0)
- `size` (int): Page size (default: 20)

**Example Response**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": 1,
    "name": "Juan Perez",
    "email": "juan.perez@comercial.com",
    "commissionPercentage": 15.0,
    "active": true
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "code": 2,
    "name": "Maria Garcia",
    "email": "maria.garcia@comercial.com",
    "commissionPercentage": 12.5,
    "active": true
  }
]
```

---

### GET /api/merchants/:id

**Purpose**: Get merchant by ID

**Frontend Interface**: `MerchantDetails`

**Roles**: ADMIN, USER

**Example Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": 1,
  "name": "Juan Perez",
  "email": "juan.perez@comercial.com",
  "phone": "+58-424-1234567",
  "address": "Av. Principal, Local 5, Caracas",
  "commissionPercentage": 15.0,
  "active": true,
  "createdAt": "2025-12-30T10:30:00"
}
```

**Errors**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not ADMIN or USER
- `404 Not Found`: Merchant not found

---

### GET /api/merchants/me

**Purpose**: Get authenticated merchant's own profile

**Frontend Interface**: `MerchantDetails`

**Roles**: MERCHANT only

**Description**: Allows merchants to view their own profile information.

**Example Response**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "code": 1,
  "name": "Juan Perez",
  "email": "juan.perez@comercial.com",
  "phone": "+58-424-1234567",
  "address": "Av. Principal, Local 5, Caracas",
  "commissionPercentage": 15.0,
  "active": true,
  "createdAt": "2025-12-30T10:30:00"
}
```

---

### POST /api/merchants

**Purpose**: Create new merchant

**Frontend Interface**: `MerchantCreate` (request), `MerchantDetails` (response)

**Roles**: ADMIN only

**Example Request**:

```json
{
  "name": "Juan Perez",
  "email": "juan.perez@comercial.com",
  "password": "SecurePass123!",
  "phone": "+58-424-1234567",
  "address": "Av. Principal, Local 5, Caracas",
  "commissionPercentage": 15.0,
  "active": true
}
```

**Example Response**: Same as GET /:id (with generated ID and code)

**Errors**:

- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not ADMIN
- `409 Conflict`: Email already exists (in merchants OR users)

---

### PUT /api/merchants/:id

**Purpose**: Update existing merchant

**Frontend Interface**: `MerchantEdit` (request), `MerchantDetails` (response)

**Roles**: ADMIN only

**Example Request**:

```json
{
  "name": "Juan Perez Actualizado",
  "email": "juan.perez.nuevo@comercial.com",
  "password": "NewSecurePass123!",
  "phone": "+58-424-9999999",
  "address": "Nueva Direccion, Caracas",
  "commissionPercentage": 18.0,
  "active": true
}
```

**Note**: Password is optional. If not provided or empty, the current password is kept.

**Errors**:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not ADMIN
- `404 Not Found`: Merchant not found

---

### DELETE /api/merchants/:id

**Purpose**: Delete merchant

**Roles**: ADMIN only

**Response**: 204 No Content

**Errors**:

- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not ADMIN
- `404 Not Found`: Merchant not found
- `409 Conflict`: Cannot delete merchant with pending orders

---

## Validation Rules

### Field Validations

| Field                  | Type    | Required          | Rules                                          | Error Message                                    |
| ---------------------- | ------- | ----------------- | ---------------------------------------------- | ------------------------------------------------ |
| `name`                 | string  | Yes               | 3-200 characters                               | "El nombre debe tener entre 3 y 200 caracteres"  |
| `email`                | string  | Yes (create only) | Valid email, unique across merchants AND users | "Email invalido" / "Email ya existe"             |
| `password`             | string  | Yes (create only) | Min 8 characters                               | "La contraseña debe tener al menos 8 caracteres" |
| `phone`                | string  | Yes               | Non-blank                                      | "El telefono es requerido"                       |
| `address`              | string  | No                | Max 500 characters                             | "La direccion debe tener maximo 500 caracteres"  |
| `commissionPercentage` | number  | Yes               | 0-100, 2 decimal precision                     | "La comision debe estar entre 0 y 100"           |
| `active`               | boolean | Yes               | -                                              | -                                                |

### Custom Validators

```typescript
// validators/merchant.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class MerchantValidators {
  static commissionRange(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;

      const value = Number(control.value);
      if (isNaN(value) || value < 0 || value > 100) {
        return { invalidCommission: 'La comision debe estar entre 0 y 100' };
      }

      return null;
    };
  }

  static phoneRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim() === '') {
        return { phoneRequired: 'El telefono es requerido' };
      }

      return null;
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      if (control.value.length < 8) {
        return { weakPassword: 'La contraseña debe tener al menos 8 caracteres' };
      }

      return null;
    };
  }
}
```

---

## Form Structure

### Form Layout (Single Page - No Tabs)

The merchant form is a simple single-page form without tabs since it doesn't have complex nested entities.

### Form Fields

**Create Mode Fields**:

- name (text input)
- email (email input)
- password (password input)
- phone (text input)
- address (textarea)
- commissionPercentage (number input with % suffix)
- active (switch/checkbox)

**Edit Mode Fields**:

- name (text input)
- email (email input) - editable
- password (password input) - optional, leave empty to keep current
- phone (text input)
- address (textarea)
- commissionPercentage (number input with % suffix)
- active (switch/checkbox)

### Form Model

```typescript
interface MerchantFormModel {
  id?: string;
  code?: number;
  name: string;
  email?: string; // Only for create
  password?: string; // Only for create
  phone: string;
  address: string | null;
  commissionPercentage: number;
  active: boolean;
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/merchant-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class MerchantApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/merchants';

  getAll(params?: { active?: boolean }): Observable<MerchantList[]> {
    return this.http.get<MerchantList[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<MerchantDetails> {
    return this.http.get<MerchantDetails>(`${this.baseUrl}/${id}`);
  }

  getProfile(): Observable<MerchantDetails> {
    return this.http.get<MerchantDetails>(`${this.baseUrl}/me`);
  }

  create(data: MerchantCreate): Observable<MerchantDetails> {
    return this.http.post<MerchantDetails>(this.baseUrl, data);
  }

  update(id: string, data: MerchantEdit): Observable<MerchantDetails> {
    return this.http.put<MerchantDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/merchant-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class MerchantApplicationService {
  private readonly api = inject(MerchantApiService);
  private readonly mapper = inject(MerchantMapper);

  // State signals
  readonly merchants = signal<MerchantList[]>([]);
  readonly currentMerchant = signal<MerchantDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(params?: { active?: boolean }): Observable<MerchantList[]> {
    this.loading.set(true);
    return this.api.getAll(params).pipe(
      tap((merchants) => this.merchants.set(merchants)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<MerchantDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((merchant) => this.currentMerchant.set(merchant)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadProfile(): Observable<MerchantDetails> {
    this.loading.set(true);
    return this.api.getProfile().pipe(
      tap((merchant) => this.currentMerchant.set(merchant)),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: MerchantCreate): Observable<MerchantDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(finalize(() => this.loading.set(false)));
  }

  update(id: string, data: MerchantEdit): Observable<MerchantDetails> {
    this.loading.set(true);
    return this.api.update(id, data).pipe(finalize(() => this.loading.set(false)));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }

  clearCurrentMerchant(): void {
    this.currentMerchant.set(null);
  }
}
```

---

### Mapper Service

**File**: `services/mappers/merchant.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class MerchantMapper {
  toFormModel(details: MerchantDetails): MerchantFormModel {
    return {
      id: details.id,
      code: details.code,
      name: details.name,
      phone: details.phone,
      address: details.address,
      commissionPercentage: details.commissionPercentage,
      active: details.active,
    };
  }

  toCreateRequest(form: MerchantFormModel): MerchantCreate {
    return {
      name: form.name,
      email: form.email!,
      password: form.password!,
      phone: form.phone,
      address: form.address,
      commissionPercentage: form.commissionPercentage,
      active: form.active ?? true,
    };
  }

  toUpdateRequest(form: MerchantFormModel): MerchantEdit {
    return {
      id: form.id!,
      name: form.name,
      phone: form.phone,
      address: form.address,
      commissionPercentage: form.commissionPercentage,
      active: form.active ?? true,
    };
  }
}
```

---

## Business Rules

### Merchant Registration

1. Email must be unique across merchants AND users (shared auth namespace)
2. Password must be at least 8 characters
3. Commission percentage must be between 0% and 100% (2 decimal precision)
4. Merchant code is auto-generated sequentially (1, 2, 3...)
5. New merchants are active by default
6. **Single commission**: One percentage per merchant, no variations

### Merchant Authentication

1. Merchants use the same login endpoint as users (`POST /api/auth/login`)
2. Merchant role has restricted permissions
3. Only active merchants can authenticate
4. Merchants can only access their own data

### Commission Rules

1. Commission percentage is stored on merchant (0-100%)
2. **Commission is NOT deducted from the order**
3. Commission is charged when the **invoice is paid**
4. Commission = Invoice Total x (Merchant Commission % / 100)
5. Pending payments are reported to merchant via PDF

### Commission Calculation Example

```
Merchant: Juan Perez (15% commission)
─────────────────────────────────────
Invoice Total:           $1,000.00
Commission (15%):        $150.00    <- Charged to merchant when invoice is paid
Merchant receives:       $850.00    <- Via PDF report of pending payments
```

### Update Rules

1. Email can be changed (must still be unique across merchants AND users)
2. Password is optional in update - if not provided, current password is kept
3. Commission can be changed by ADMIN at any time
4. Changes take effect immediately for new orders/invoices

### Deletion Rules

1. Cannot delete merchant with pending orders
2. Only ADMIN can delete merchants

---

## Routes Configuration

```typescript
// router/merchant.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const MERCHANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/merchants-list-page/merchants-list-page.component').then(
        (m) => m.MerchantsListPageComponent,
      ),
    title: 'Comerciales',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/merchants-form-page/merchants-form-page.component').then(
        (m) => m.MerchantsFormPageComponent,
      ),
    title: 'Nuevo Comercial',
  },
  {
    path: 'me',
    loadComponent: () =>
      import('../pages/merchants-details-page/merchants-details-page.component').then(
        (m) => m.MerchantsDetailsPageComponent,
      ),
    title: 'Mi Perfil',
    data: { selfMode: true },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/merchants-details-page/merchants-details-page.component').then(
        (m) => m.MerchantsDetailsPageComponent,
      ),
    title: 'Detalles del Comercial',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/merchants-form-page/merchants-form-page.component').then(
        (m) => m.MerchantsFormPageComponent,
      ),
    title: 'Editar Comercial',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Component Examples

### List Page Component

```typescript
@Component({
  selector: 'app-merchants-list-page',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule],
  templateUrl: './merchants-list-page.component.html',
})
export class MerchantsListPageComponent implements OnInit {
  private readonly service = inject(MerchantApplicationService);
  private readonly router = inject(Router);

  readonly merchants = this.service.merchants;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    this.service.loadAll().subscribe();
  }

  onAdd(): void {
    this.router.navigate(['/merchants', 'new']);
  }

  onView(merchant: MerchantList): void {
    this.router.navigate(['/merchants', merchant.id]);
  }

  onEdit(merchant: MerchantList): void {
    this.router.navigate(['/merchants', merchant.id, 'edit']);
  }

  onDelete(merchant: MerchantList): void {
    // Show confirmation dialog, then call service.delete()
  }

  getStatusSeverity(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger';
  }

  getStatusLabel(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }
}
```

### List Page Template

```html
<div class="card">
  <p-table
    [value]="merchants()"
    [loading]="loading()"
    [paginator]="true"
    [rows]="10"
    [showCurrentPageReport]="true"
    [globalFilterFields]="['name', 'email', 'code']"
  >
    <ng-template pTemplate="caption">
      <div class="flex justify-content-between align-items-center">
        <h2>Comerciales</h2>
        <p-button label="Nuevo Comercial" icon="pi pi-plus" (onClick)="onAdd()" />
      </div>
    </ng-template>

    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="code">Codigo <p-sortIcon field="code" /></th>
        <th pSortableColumn="name">Nombre <p-sortIcon field="name" /></th>
        <th pSortableColumn="email">Email <p-sortIcon field="email" /></th>
        <th pSortableColumn="commissionPercentage">
          Comision <p-sortIcon field="commissionPercentage" />
        </th>
        <th pSortableColumn="active">Estado <p-sortIcon field="active" /></th>
        <th>Acciones</th>
      </tr>
    </ng-template>

    <ng-template pTemplate="body" let-merchant>
      <tr>
        <td>{{ merchant.code }}</td>
        <td>{{ merchant.name }}</td>
        <td>{{ merchant.email }}</td>
        <td>{{ merchant.commissionPercentage }}%</td>
        <td>
          <p-tag
            [value]="getStatusLabel(merchant.active)"
            [severity]="getStatusSeverity(merchant.active)"
          />
        </td>
        <td>
          <p-button
            icon="pi pi-eye"
            [rounded]="true"
            [text]="true"
            pTooltip="Ver"
            (onClick)="onView(merchant)"
          />
          <p-button
            icon="pi pi-pencil"
            [rounded]="true"
            [text]="true"
            pTooltip="Editar"
            (onClick)="onEdit(merchant)"
          />
          <p-button
            icon="pi pi-trash"
            [rounded]="true"
            [text]="true"
            severity="danger"
            pTooltip="Eliminar"
            (onClick)="onDelete(merchant)"
          />
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>
```

---

## Testing Requirements

### Unit Tests

- [ ] Commission range validator tested
- [ ] Phone required validator tested
- [ ] Password strength validator tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly with status badges
- [ ] Form page validates correctly
- [ ] Form page hides email/password in edit mode
- [ ] Details page displays data correctly
- [ ] Profile page (me) loads correctly for MERCHANT role
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow tested
- [ ] Email uniqueness validation tested
- [ ] Role-based access control tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Merchants authenticate through AUTH module with MERCHANT role
- [Orders Module](./orders.md) - Orders can have an optional merchant association
- [Customers Module](./customers.md) - Merchants create orders for customers
- [Products Module](./products.md) - Merchants can view products to create orders

---

## Notes

### Important Considerations

1. **Separate Entity**: Merchant is NOT a User with a special role - it's a separate entity with its own table.
2. **Single Commission**: Each merchant has ONE commission percentage (not per product/category).
3. **Email Uniqueness**: Email must be unique across both merchants AND users tables.
4. **Password Handling**: Password is only set on create, never returned in responses.
5. **Commission Application**: Commission is NOT on orders - it's applied when invoice is paid.
6. **Role Restrictions**: Merchants have very limited access - mainly viewing products and managing their own orders.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Commission displayed with % suffix
- Active status shown as colored badges

---

**Last Updated**: 2025-12-30

**Module Status**: [ ] Planned | [ ] In Development | [ ] Implemented
