# Customers Module

## Overview

The Customers module manages customer information including legal data, contact details (emails, phones), and addresses. Supports both individual and business customers with credit management capabilities.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/partners/customers/
├── actions/                        # Row and toolbar actions
├── components/                     # Form sections and balance components
├── data/                           # Static data and option sources
├── i18n/                           # Translations
├── messages/                       # Toast and error messages
├── models/                         # Interfaces and enums
├── navigation/                     # Menu and navigation contributions
├── pages/                          # List, form, details, and balance pages
├── permissions/                    # Permission constants
├── routing/                        # Lazy-loaded routes
├── services/                       # API, application, and mapper services
└── validators/                     # Custom form validators
```

---

## Features

- Customer registration with complete business information
- Multiple emails, phones, and addresses per customer
- Credit management (credit days and credit limit)
- Customer type classification (Individual, Business, Government, Non-Profit)
- RIF validation (Venezuelan tax ID)
- Phone validation (Venezuelan phone format)
- Billing address designation
- Active/Inactive status management

---

## Pages

### List Page

**Route**: `/partners/customers`

**Component**: `CustomersListPageComponent`

**Purpose**: Displays all customers in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Search by name, alias, RIF
- Pagination
- Action buttons (View, Edit, Delete)
- Add new customer button

### Form Page

**Route**: `/partners/customers/new` (Create) | `/partners/customers/:id/edit` (Edit)

**Component**: `CustomersFormPageComponent`

**Purpose**: Create new customer or edit existing one.

**Features**:

- Reactive forms with validation
- Tab-based layout (General, Contact, Addresses)
- Real-time validation feedback
- Pending changes guard
- Dynamic arrays for emails, phones, addresses

### Details Page

**Route**: `/partners/customers/:id`

**Component**: `CustomersDetailsPageComponent`

**Purpose**: Display complete customer information in read-only mode.

### Balance Page

**Route**: `/partners/customers/:id/balance`

**Component**: `CustomerBalancePageComponent`

**Purpose**: Show the customer balance summary and transaction history, and register balance advances or refunds.

**Features**:

- Balance summary card
- Paginated balance transactions table
- Register advance and refund operations
- Permission-driven actions

**Features**:

- Complete customer data display
- Email list
- Phone list
- Address list with billing indicator
- Edit and Delete actions

---

## Data Models

### Interfaces

#### CustomerList

**Usage**: List page table rows (GET /api/customers)

**Purpose**: Minimal data for table display.

```typescript
export interface CustomerList {
  id: string; // UUID identifier
  code: number; // Sequential business code
  alias: string; // Short name/nickname
  legalName: string; // Legal business/person name
  rif: string; // Tax ID (RIF)
  type: CustomerType; // Customer classification
  active: boolean; // Active status
}
```

**API Mapping**: Maps directly from `CustomerListResponse`

---

#### CustomerDetails

**Usage**: Details page display (GET /api/customers/:id)

**Purpose**: Complete customer data for viewing.

```typescript
export interface CustomerEmail {
  id: string;
  customerId: string;
  email: string;
}

export interface CustomerPhone {
  id: string;
  customerId: string;
  phone: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  address: string;
  billing: boolean;
  active: boolean;
}

export interface CustomerDetails {
  id: string;
  code: number;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  createdAt: string;
  emails: CustomerEmail[];
  phones: CustomerPhone[];
  addresses: CustomerAddress[];
}
```

**API Mapping**: Maps from `CustomerDetailResponse`

---

#### CustomerEdit

**Usage**: Edit form data (derived from GET /api/customers/:id)

**Purpose**: Form data for editing existing customer.

```typescript
export interface CustomerEditEmail {
  id?: string;
  customerId?: string;
  email: string;
}

export interface CustomerEditPhone {
  id?: string;
  customerId?: string;
  phone: string;
}

export interface CustomerEditAddress {
  id?: string;
  customerId?: string;
  address: string;
  billing: boolean;
  active: boolean;
}

export interface CustomerEdit {
  id: string;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: CustomerEditEmail[];
  phones: CustomerEditPhone[];
  addresses: CustomerEditAddress[];
}
```

**API Mapping**:

- Derived from `CustomerDetails` response
- Maps to `UpdateCustomerRequest` for PUT request

---

#### CustomerCreate

**Usage**: Create form submission (POST /api/customers)

**Purpose**: New customer creation data (no IDs).

```typescript
export interface CustomerCreateEmail {
  email: string;
}

export interface CustomerCreatePhone {
  phone: string;
}

export interface CustomerCreateAddress {
  address: string;
  billing: boolean;
  active: boolean;
}

export interface CustomerCreate {
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;
  emails: CustomerCreateEmail[];
  phones: CustomerCreatePhone[];
  addresses: CustomerCreateAddress[];
}
```

**API Mapping**: Maps directly to `CreateCustomerRequest`

---

### Enums

#### CustomerType

```typescript
export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL', // Natural person
  BUSINESS = 'BUSINESS', // Business/Company
  GOVERNMENT = 'GOVERNMENT', // Government entity
  NON_PROFIT = 'NON_PROFIT', // Non-profit organization
}

export interface CustomerTypeOption {
  label: string;
  value: CustomerType;
}

export const CUSTOMER_TYPES: readonly CustomerTypeOption[] = [
  { label: 'Natural', value: CustomerType.INDIVIDUAL },
  { label: 'Jurídico', value: CustomerType.BUSINESS },
  { label: 'Gobierno', value: CustomerType.GOVERNMENT },
  { label: 'Otros', value: CustomerType.NON_PROFIT },
] as const;

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  [CustomerType.INDIVIDUAL]: 'Natural',
  [CustomerType.BUSINESS]: 'Jurídico',
  [CustomerType.GOVERNMENT]: 'Gobierno',
  [CustomerType.NON_PROFIT]: 'Otros',
};

export function getCustomerTypeLabel(type: CustomerType): string {
  return CUSTOMER_TYPE_LABELS[type] || type;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/customers`

### Interface Mapping Summary

| HTTP Method | Endpoint           | Request Interface | Response Interface | Frontend Usage    |
| ----------- | ------------------ | ----------------- | ------------------ | ----------------- |
| GET         | /api/customers     | -                 | `CustomerList[]`   | List page         |
| GET         | /api/customers/:id | -                 | `CustomerDetails`  | Details/Edit page |
| POST        | /api/customers     | `CustomerCreate`  | `CustomerDetails`  | Create form       |
| PUT         | /api/customers/:id | `CustomerEdit`    | `CustomerDetails`  | Edit form         |
| DELETE      | /api/customers/:id | -                 | void (204)         | Delete action     |

---

### GET /api/customers

**Purpose**: List all customers

**Frontend Interface**: `CustomerList[]`

**Example Response**:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": 1001,
    "alias": "ACME Corp",
    "legalName": "Acme Corporation C.A.",
    "rif": "J-12345678-9",
    "type": "BUSINESS",
    "active": true
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "code": 1002,
    "alias": "Juan Pérez",
    "legalName": "Juan Pérez",
    "rif": "V-12345678-1",
    "type": "INDIVIDUAL",
    "active": true
  }
]
```

---

### GET /api/customers/:id

**Purpose**: Get customer by ID

**Frontend Interface**: `CustomerDetails`

**Example Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": 1001,
  "legalName": "Acme Corporation C.A.",
  "type": "BUSINESS",
  "rif": "J-12345678-9",
  "alias": "ACME Corp",
  "creditDays": 30,
  "creditLimit": 50000.0,
  "active": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "emails": [
    {
      "id": "email-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "email": "contacto@acme.com"
    },
    {
      "id": "email-002",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "email": "ventas@acme.com"
    }
  ],
  "phones": [
    {
      "id": "phone-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "phone": "0212-1234567"
    },
    {
      "id": "phone-002",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "phone": "0414-1234567"
    }
  ],
  "addresses": [
    {
      "id": "addr-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "address": "Av. Principal, Edificio Acme, Piso 5, Caracas",
      "billing": true,
      "active": true
    },
    {
      "id": "addr-002",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "address": "Zona Industrial, Galpón 10, Valencia",
      "billing": false,
      "active": true
    }
  ]
}
```

---

### POST /api/customers

**Purpose**: Create new customer

**Frontend Interface**: `CustomerCreate` (request), `CustomerDetails` (response)

**Example Request**:

```json
{
  "legalName": "Nueva Empresa C.A.",
  "type": "BUSINESS",
  "rif": "J-98765432-1",
  "alias": "Nueva Empresa",
  "creditDays": 15,
  "creditLimit": 25000.0,
  "active": true,
  "emails": [{ "email": "info@nuevaempresa.com" }],
  "phones": [{ "phone": "0212-9876543" }],
  "addresses": [
    {
      "address": "Calle Principal, Edificio Nuevo, Piso 3",
      "billing": true,
      "active": true
    }
  ]
}
```

**Example Response**: Same as GET /:id (with generated ID and code)

---

### PUT /api/customers/:id

**Purpose**: Update existing customer

**Frontend Interface**: `CustomerEdit` (request), `CustomerDetails` (response)

**Example Request**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "legalName": "Acme Corporation C.A. (Actualizada)",
  "type": "BUSINESS",
  "rif": "J-12345678-9",
  "alias": "ACME Corp Updated",
  "creditDays": 45,
  "creditLimit": 75000.0,
  "active": true,
  "emails": [
    {
      "id": "email-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "email": "contacto@acme.com"
    },
    {
      "email": "nuevo@acme.com"
    }
  ],
  "phones": [
    {
      "id": "phone-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "phone": "0212-1234567"
    }
  ],
  "addresses": [
    {
      "id": "addr-001",
      "customerId": "123e4567-e89b-12d3-a456-426614174000",
      "address": "Av. Principal, Edificio Acme, Piso 5, Caracas",
      "billing": true,
      "active": true
    }
  ]
}
```

**Note**: Update replaces all nested entities. Frontend must send complete arrays.

---

### DELETE /api/customers/:id

**Purpose**: Delete customer

**Response**: 204 No Content

---

## Validation Rules

### Field Validations

| Field         | Type    | Required | Rules                                      | Error Message                         |
| ------------- | ------- | -------- | ------------------------------------------ | ------------------------------------- |
| `legalName`   | string  | Yes      | 3-200 characters                           | "Legal name must be 3-200 characters" |
| `type`        | enum    | Yes      | Valid CustomerType                         | "Customer type is required"           |
| `rif`         | string  | Yes      | Venezuelan RIF format (J/V/E/G-XXXXXXXX-X) | "Invalid RIF format"                  |
| `alias`       | string  | Yes      | 3-100 characters                           | "Alias must be 3-100 characters"      |
| `creditDays`  | number  | Yes      | Integer >= 0, max 365                      | "Credit days must be 0-365"           |
| `creditLimit` | number  | Yes      | Number >= 0                                | "Credit limit must be non-negative"   |
| `active`      | boolean | Yes      | -                                          | -                                     |
| `emails`      | array   | Yes      | At least 1, valid email format             | "At least one email is required"      |
| `phones`      | array   | Yes      | At least 1, Venezuelan phone format        | "At least one phone is required"      |
| `addresses`   | array   | Yes      | At least 1, max 1 billing address          | "At least one address is required"    |

### Custom Validators

```typescript
// validators/customer.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomerValidators {
  static rifFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const pattern = /^[JVEGP]-\d{8}-\d$/;
      if (!pattern.test(control.value)) {
        return { invalidRif: 'RIF format must be X-XXXXXXXX-X (e.g., J-12345678-9)' };
      }

      return null;
    };
  }

  static phoneFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const pattern = /^0\d{3}-\d{7}$/;
      if (!pattern.test(control.value)) {
        return { invalidPhone: 'Phone format must be 0XXX-XXXXXXX' };
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

  static maxOneBillingAddress(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) return null;

      const billingCount = control.value.filter((addr: any) => addr.billing).length;
      if (billingCount > 1) {
        return { maxOneBilling: 'Only one billing address allowed' };
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

- **Component**: `customer-general-section`
- **Fields**: legalName, type, rif, alias, creditDays, creditLimit, active

#### Tab 2: Contact Information

- **Component**: `customer-contact-section`
- **Fields**: emails[] (array), phones[] (array)

#### Tab 3: Addresses

- **Component**: `customer-addresses-section`
- **Fields**: addresses[] (array with address, billing, active)

### Form Model

```typescript
interface CustomerFormModel {
  // Tab 1: General
  id?: string;
  code?: number;
  legalName: string;
  type: CustomerType;
  rif: string;
  alias: string;
  creditDays: number;
  creditLimit: number;
  active: boolean;

  // Tab 2: Contact
  emails: CustomerEditEmail[];
  phones: CustomerEditPhone[];

  // Tab 3: Addresses
  addresses: CustomerEditAddress[];
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/customer-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

  getAll(): Observable<CustomerList[]> {
    return this.http.get<CustomerList[]>(this.baseUrl);
  }

  getById(id: string): Observable<CustomerDetails> {
    return this.http.get<CustomerDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CustomerCreate): Observable<CustomerDetails> {
    return this.http.post<CustomerDetails>(this.baseUrl, data);
  }

  update(id: string, data: CustomerEdit): Observable<CustomerDetails> {
    return this.http.put<CustomerDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/customer-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class CustomerApplicationService {
  private readonly api = inject(CustomerApiService);
  private readonly mapper = inject(CustomerMapper);

  // State signals
  readonly customers = signal<CustomerList[]>([]);
  readonly currentCustomer = signal<CustomerDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<CustomerList[]> {
    this.loading.set(true);
    return this.api.getAll().pipe(
      tap((customers) => this.customers.set(customers)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: string): Observable<CustomerDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((customer) => this.currentCustomer.set(customer)),
      finalize(() => this.loading.set(false)),
    );
  }

  create(data: CustomerCreate): Observable<CustomerDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(finalize(() => this.loading.set(false)));
  }

  update(id: string, data: CustomerEdit): Observable<CustomerDetails> {
    this.loading.set(true);
    const mapped = this.mapper.toUpdateRequest(data);
    return this.api.update(id, mapped).pipe(finalize(() => this.loading.set(false)));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
```

---

### Mapper Service

**File**: `services/mappers/customer.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class CustomerMapper {
  toFormModel(details: CustomerDetails): CustomerFormModel {
    return {
      id: details.id,
      code: details.code,
      legalName: details.legalName,
      type: details.type,
      rif: details.rif,
      alias: details.alias,
      creditDays: details.creditDays,
      creditLimit: details.creditLimit,
      active: details.active,
      emails: details.emails.map((e) => ({
        id: e.id,
        customerId: e.customerId,
        email: e.email,
      })),
      phones: details.phones.map((p) => ({
        id: p.id,
        customerId: p.customerId,
        phone: p.phone,
      })),
      addresses: details.addresses.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        address: a.address,
        billing: a.billing,
        active: a.active,
      })),
    };
  }

  toCreateRequest(form: CustomerFormModel): CustomerCreate {
    return {
      legalName: form.legalName,
      type: form.type,
      rif: form.rif,
      alias: form.alias,
      creditDays: form.creditDays,
      creditLimit: form.creditLimit,
      active: form.active ?? true,
      emails: form.emails.map((e) => ({ email: e.email })),
      phones: form.phones.map((p) => ({ phone: p.phone })),
      addresses: form.addresses.map((a) => ({
        address: a.address,
        billing: a.billing,
        active: a.active,
      })),
    };
  }

  toUpdateRequest(form: CustomerFormModel): CustomerEdit {
    return {
      id: form.id!,
      legalName: form.legalName,
      type: form.type,
      rif: form.rif,
      alias: form.alias,
      creditDays: form.creditDays,
      creditLimit: form.creditLimit,
      active: form.active ?? true,
      emails: form.emails.map((e) => ({ email: e.email })),
      phones: form.phones.map((p) => ({ phone: p.phone })),
      addresses: form.addresses.map((a) => ({
        address: a.address,
        billing: a.billing,
        active: a.active,
      })),
    };
  }
}
```

---

## Business Rules

### Customer Entity Rules

1. Customer code is auto-generated by backend (sequential: 1, 2, 3...)
2. Customer code cannot be modified after creation
3. Legal name is required and must be 3-200 characters
4. RIF must follow valid Venezuelan format (J/V/E/G/P-XXXXXXXX-X)
5. Credit days must be between 0-365
6. Credit limit must be non-negative
7. Zero credit days means immediate payment required
8. Zero credit limit means no credit allowed

### Contact Information Rules

1. At least one email is required per customer
2. At least one phone is required per customer
3. Emails must be in valid format
4. Phones must follow Venezuelan format (0XXX-XXXXXXX)
5. Contact entities are managed ONLY through customer (no separate endpoints)

### Address Rules

1. At least one address is required per customer
2. Only one address can be marked as billing address
3. Addresses can be active or inactive
4. When marking a new address as billing, previous billing address is automatically unmarked
5. Address entities are managed ONLY through customer (no separate endpoints)

### Update Pattern (Replace All)

When updating a customer:

- Backend **replaces ALL** emails, phones, and addresses
- Frontend must send complete arrays with ALL desired entities
- Backend deletes old entities and creates new ones
- IDs in nested entities are optional (ignored by backend)

---

## Routes Configuration

```typescript
// routing/customer.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/partners/customers-list-page/partners/customers-list-page.component').then(
        (m) => m.CustomersListPageComponent,
      ),
    title: 'Clientes',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/partners/customers-form-page/partners/customers-form-page.component').then(
        (m) => m.CustomersFormPageComponent,
      ),
    title: 'Nuevo Cliente',
  },
  {
    path: ':id',
    loadComponent: () =>
      import(
        '../pages/partners/customers-details-page/partners/customers-details-page.component'
      ).then((m) => m.CustomersDetailsPageComponent),
    title: 'Detalles del Cliente',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/partners/customers-form-page/partners/customers-form-page.component').then(
        (m) => m.CustomersFormPageComponent,
      ),
    title: 'Editar Cliente',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Testing Requirements

### Unit Tests

- [x] RIF validator tested
- [x] Phone validator tested
- [x] Min array length validator tested
- [x] Mapper transformations tested
- [x] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly
- [x] Form page reports a duplicate RIF returned by create or update
- [ ] Details page displays data correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Customer operations require authentication
- [Dashboard Module](./dashboard.md) - Customer metrics displayed in dashboard

---

## Notes

### Important Considerations

1. **Nested Entity Management**: Backend uses "Replace All" strategy. Frontend must always send complete arrays when updating.
2. **ID Handling**: New nested entities don't need IDs. Existing ones can include IDs but backend ignores them during update.
3. **Form State**: Use pending changes guard to prevent data loss on navigation.
4. **Error Handling**: All HTTP errors display user-friendly messages via toast notifications. A duplicate RIF conflict also marks the RIF field and keeps the form open for correction.
5. **RIF Validation**: Venezuelan format includes letters J (Business), V (Individual), E (Foreign), G (Government), P (Passport).
6. **Phone Format**: Standard Venezuelan format 0XXX-XXXXXXX (e.g., 0212-1234567 or 0414-1234567).

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation between API and form
- Separate API (infrastructure) from application logic (business rules)
- Use PrimeNG components for UI consistency
- Use TabView for form sections with many fields

---

**Last Updated**: 2026-11-03

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
