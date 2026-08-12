# [MODULE_NAME] Module

## Overview

Brief description of what this module does and its purpose in the frontend application. Explain the key functionality and user workflows.

**Module Type**: `[CRUD | Display-only | Auth | Special]`

---

## Module Structure

```
src/app/features/[module-name]/
├── components/               # Reusable UI components (if tabs/sections needed)
│   ├── [entity]-[section]-section/
│   │   ├── [entity]-[section]-section.component.ts
│   │   ├── [entity]-[section]-section.component.html
│   │   └── [entity]-[section]-section.component.spec.ts
│   └── index.ts
├── models/                   # Interfaces, types, and enums
│   ├── interfaces/
│   │   ├── [entity]-list.interface.ts
│   │   ├── [entity]-details.interface.ts
│   │   ├── [entity]-edit.interface.ts
│   │   ├── [entity]-create.interface.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── [entity]-type.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/                    # Route components (smart components)
│   ├── [module]-list-page/
│   │   ├── [module]-list-page.component.ts
│   │   ├── [module]-list-page.component.html
│   │   └── [module]-list-page.component.spec.ts
│   ├── [module]-form-page/
│   │   ├── [module]-form-page.component.ts
│   │   ├── [module]-form-page.component.html
│   │   └── [module]-form-page.component.spec.ts
│   ├── [module]-details-page/
│   │   ├── [module]-details-page.component.ts
│   │   ├── [module]-details-page.component.html
│   │   └── [module]-details-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/                  # HTTP services (infrastructure layer)
│   │   ├── [entity]-api.service.ts
│   │   ├── [entity]-api.service.spec.ts
│   │   └── index.ts
│   ├── application/          # Business logic services (application layer)
│   │   ├── [entity]-application.service.ts
│   │   ├── [entity]-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/              # Data transformation
│   │   ├── [entity].mapper.ts
│   │   ├── [entity].mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/               # Custom form validators
│   ├── [entity].validators.ts
│   ├── [entity].validators.spec.ts
│   └── index.ts
├── router/                   # Module routes
│   ├── [entity].routes.ts
│   └── index.ts
└── index.ts                  # Public API exports
```

---

## Features

- Feature 1 description
- Feature 2 description
- Feature 3 description

---

## Pages

### List Page

**Route**: `/[module-name]`

**Component**: `[Module]ListPageComponent`

**Purpose**: Displays all [entities] in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Search functionality
- Pagination
- Action buttons (View, Edit, Delete)
- Add new button

### Form Page

**Route**: `/[module-name]/new` (Create) | `/[module-name]/:id/edit` (Edit)

**Component**: `[Module]FormPageComponent`

**Purpose**: Create new [entity] or edit existing one.

**Features**:

- Reactive forms with validation
- Tab-based layout (if multiple sections)
- Real-time validation feedback
- Pending changes guard

### Details Page

**Route**: `/[module-name]/:id`

**Component**: `[Module]DetailsPageComponent`

**Purpose**: Display complete [entity] information in read-only mode.

**Features**:

- Complete [entity] data display
- Edit and Delete actions
- Related information sections

---

## Data Models

### Interfaces

#### [Entity]List

**Usage**: List page table rows (GET /api/[entities])

**Purpose**: Minimal data for table display.

```typescript
export interface [Entity]List {
  id: string;              // UUID identifier
  code: number;            // Sequential business code
  field1: string;          // Main display field
  active: boolean;         // Active status
}
```

**API Mapping**: Maps directly from `[Entity]ListResponse`

---

#### [Entity]Details

**Usage**: Details page display (GET /api/[entities]/:id)

**Purpose**: Complete entity data for viewing.

```typescript
export interface [Entity]Details {
  id: string;              // UUID identifier
  code: number;            // Sequential business code
  field1: string;          // Main field
  field2: number;          // Secondary field
  active: boolean;         // Active status
  createdAt: string;       // ISO date string
  // Nested entities (if applicable)
  nestedEntities: [NestedEntity]Details[];
}

export interface [NestedEntity]Details {
  id: string;
  [entity]Id: string;
  nestedField1: string;
}
```

**API Mapping**: Maps from `[Entity]DetailResponse`

---

#### [Entity]Edit

**Usage**: Edit form data (derived from GET /api/[entities]/:id)

**Purpose**: Form data for editing existing entity.

```typescript
export interface [Entity]EditNested {
  id?: string;              // Optional - existing nested entity
  [entity]Id?: string;      // Optional - parent ID
  nestedField1: string;     // Required field
}

export interface [Entity]Edit {
  id: string;               // Required for update
  field1: string;           // Editable field
  field2: number;           // Editable field
  active: boolean;          // Editable field
  nestedEntities: [Entity]EditNested[];
}
```

**API Mapping**:

- Derived from `[Entity]Details` response
- Maps to `Update[Entity]Request` for PUT request

---

#### [Entity]Create

**Usage**: Create form submission (POST /api/[entities])

**Purpose**: New entity creation data (no IDs).

```typescript
export interface [Entity]CreateNested {
  nestedField1: string;     // Required field
  // No IDs for nested entities
}

export interface [Entity]Create {
  field1: string;           // Required field
  field2: number;           // Required field
  active: boolean;          // Required field
  nestedEntities: [Entity]CreateNested[];
}
```

**API Mapping**: Maps directly to `Create[Entity]Request`

---

### Enums

#### [Entity]Type

```typescript
export enum [Entity]Type {
  TYPE_1 = 'TYPE_1',
  TYPE_2 = 'TYPE_2',
  TYPE_3 = 'TYPE_3',
}

export interface [Entity]TypeOption {
  label: string;
  value: [Entity]Type;
}

export const [ENTITY]_TYPES: readonly [Entity]TypeOption[] = [
  { label: 'Type 1 Label', value: [Entity]Type.TYPE_1 },
  { label: 'Type 2 Label', value: [Entity]Type.TYPE_2 },
  { label: 'Type 3 Label', value: [Entity]Type.TYPE_3 },
] as const;

export const [ENTITY]_TYPE_LABELS: Record<[Entity]Type, string> = {
  [[Entity]Type.TYPE_1]: 'Type 1 Label',
  [[Entity]Type.TYPE_2]: 'Type 2 Label',
  [[Entity]Type.TYPE_3]: 'Type 3 Label',
};

export function get[Entity]TypeLabel(type: [Entity]Type): string {
  return [ENTITY]_TYPE_LABELS[type] || type;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/[entities]`

### Interface Mapping Summary

| HTTP Method | Endpoint            | Request Interface | Response Interface | Frontend Usage    |
| ----------- | ------------------- | ----------------- | ------------------ | ----------------- |
| GET         | /api/[entities]     | -                 | `[Entity]List[]`   | List page         |
| GET         | /api/[entities]/:id | -                 | `[Entity]Details`  | Details/Edit page |
| POST        | /api/[entities]     | `[Entity]Create`  | `[Entity]Details`  | Create form       |
| PUT         | /api/[entities]/:id | `[Entity]Edit`    | `[Entity]Details`  | Edit form         |
| DELETE      | /api/[entities]/:id | -                 | void (204)         | Delete action     |

---

### GET /api/[entities]

**Purpose**: List all [entities]

**Frontend Interface**: `[Entity]List[]`

**Example Response**:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "code": 1001,
    "field1": "Value 1",
    "active": true
  }
]
```

---

### GET /api/[entities]/:id

**Purpose**: Get [entity] by ID

**Frontend Interface**: `[Entity]Details`

**Example Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": 1001,
  "field1": "Value 1",
  "field2": 100,
  "active": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "nestedEntities": [
    {
      "id": "nested-001",
      "[entity]Id": "123e4567-e89b-12d3-a456-426614174000",
      "nestedField1": "Nested Value"
    }
  ]
}
```

---

### POST /api/[entities]

**Purpose**: Create new [entity]

**Frontend Interface**: `[Entity]Create` (request), `[Entity]Details` (response)

**Example Request**:

```json
{
  "field1": "New Value",
  "field2": 100,
  "active": true,
  "nestedEntities": [{ "nestedField1": "Nested Value" }]
}
```

**Example Response**: Same as GET /:id (with generated ID and code)

---

### PUT /api/[entities]/:id

**Purpose**: Update existing [entity]

**Frontend Interface**: `[Entity]Edit` (request), `[Entity]Details` (response)

**Example Request**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "field1": "Updated Value",
  "field2": 150,
  "active": true,
  "nestedEntities": [{ "nestedField1": "Updated Nested Value" }]
}
```

**Note**: Update replaces all nested entities. Frontend must send complete arrays.

---

### DELETE /api/[entities]/:id

**Purpose**: Delete [entity]

**Response**: 204 No Content

---

## Validation Rules

### Field Validations

| Field          | Type    | Required | Rules        | Error Message                     |
| -------------- | ------- | -------- | ------------ | --------------------------------- |
| `field1`       | string  | Yes      | 3-100 chars  | "Field1 must be 3-100 characters" |
| `field2`       | number  | Yes      | >= 0         | "Field2 must be non-negative"     |
| `active`       | boolean | Yes      | -            | -                                 |
| `nestedField1` | string  | Yes      | Valid format | "Invalid format"                  |

### Custom Validators

```typescript
// validators/[entity].validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class [Entity]Validators {
  static field1Format(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const pattern = /^[A-Z]-\d{8}-\d$/;
      if (!pattern.test(control.value)) {
        return { invalidFormat: 'Invalid field1 format' };
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

### Tab Organization (if applicable)

#### Tab 1: General Information

- **Component**: `[entity]-general-section`
- **Fields**: field1, field2, type, active

#### Tab 2: Contact Information (example)

- **Component**: `[entity]-contact-section`
- **Fields**: emails[], phones[]

#### Tab 3: Addresses (example)

- **Component**: `[entity]-addresses-section`
- **Fields**: addresses[]

### Form Model

```typescript
interface [Entity]FormModel {
  // Tab 1: General
  field1: string;
  field2: number;
  type: [Entity]Type;
  active: boolean;

  // Tab 2: Nested Arrays (example)
  nestedItems: [Entity]NestedFormModel[];
}

interface [Entity]NestedFormModel {
  id?: string;           // Optional for existing items
  nestedField1: string;
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/[entity]-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/[entities]';

  getAll(): Observable<[Entity]List[]> {
    return this.http.get<[Entity]List[]>(this.baseUrl);
  }

  getById(id: string): Observable<[Entity]Details> {
    return this.http.get<[Entity]Details>(`${this.baseUrl}/${id}`);
  }

  create(data: [Entity]Create): Observable<[Entity]Details> {
    return this.http.post<[Entity]Details>(this.baseUrl, data);
  }

  update(id: string, data: [Entity]Edit): Observable<[Entity]Details> {
    return this.http.put<[Entity]Details>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/[entity]-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]ApplicationService {
  private readonly api = inject([Entity]ApiService);
  private readonly mapper = inject([Entity]Mapper);

  // State signals
  readonly items = signal<[Entity]List[]>([]);
  readonly currentItem = signal<[Entity]Details | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<[Entity]List[]> {
    this.loading.set(true);
    return this.api.getAll().pipe(
      tap(items => this.items.set(items)),
      finalize(() => this.loading.set(false))
    );
  }

  loadById(id: string): Observable<[Entity]Details> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap(item => this.currentItem.set(item)),
      finalize(() => this.loading.set(false))
    );
  }

  create(data: [Entity]Create): Observable<[Entity]Details> {
    this.loading.set(true);
    return this.api.create(data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  update(id: string, data: [Entity]Edit): Observable<[Entity]Details> {
    this.loading.set(true);
    const mapped = this.mapper.toUpdateRequest(data);
    return this.api.update(id, mapped).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id);
  }
}
```

---

### Mapper Service

**File**: `services/mappers/[entity].mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]Mapper {
  toFormModel(details: [Entity]Details): [Entity]FormModel {
    return {
      id: details.id,
      field1: details.field1,
      field2: details.field2,
      active: details.active,
      nestedItems: details.nestedEntities.map(n => ({
        id: n.id,
        nestedField1: n.nestedField1,
      })),
    };
  }

  toCreateRequest(form: [Entity]FormModel): [Entity]Create {
    return {
      field1: form.field1,
      field2: form.field2,
      active: form.active ?? true,
      nestedEntities: form.nestedItems.map(n => ({
        nestedField1: n.nestedField1,
      })),
    };
  }

  toUpdateRequest(form: [Entity]FormModel): [Entity]Edit {
    return {
      id: form.id!,
      field1: form.field1,
      field2: form.field2,
      active: form.active ?? true,
      nestedEntities: form.nestedItems.map(n => ({
        nestedField1: n.nestedField1,
      })),
    };
  }
}
```

---

## Business Rules

### Entity Rules

1. Rule 1 description
2. Rule 2 description
3. Rule 3 description

### Nested Entity Rules

1. Nested entities are managed ONLY through main entity
2. Minimum 1 nested entity required
3. Update replaces all nested entities (frontend must send complete arrays)

---

## Component Examples

### List Page Component

```typescript
@Component({
  selector: 'app-[entity]-list-page',
  standalone: true,
  imports: [/* PrimeNG imports */],
  templateUrl: './[entity]-list-page.component.html',
})
export class [Entity]ListPageComponent implements OnInit {
  private readonly service = inject([Entity]ApplicationService);
  private readonly router = inject(Router);

  readonly items = this.service.items;
  readonly loading = this.service.loading;

  ngOnInit() {
    this.service.loadAll().subscribe();
  }

  onAdd() {
    this.router.navigate(['/[entities]', 'new']);
  }

  onView(item: [Entity]List) {
    this.router.navigate(['/[entities]', item.id]);
  }

  onEdit(item: [Entity]List) {
    this.router.navigate(['/[entities]', item.id, 'edit']);
  }

  onDelete(item: [Entity]List) {
    // Confirm and delete
  }
}
```

---

## Routes Configuration

```typescript
// router/[entity].routes.ts
import { Routes } from '@angular/router';

export const [ENTITY]_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/[entity]-list-page/[entity]-list-page.component')
        .then(m => m.[Entity]ListPageComponent),
    title: '[Entities]',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/[entity]-form-page/[entity]-form-page.component')
        .then(m => m.[Entity]FormPageComponent),
    title: 'New [Entity]',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/[entity]-details-page/[entity]-details-page.component')
        .then(m => m.[Entity]DetailsPageComponent),
    title: '[Entity] Details',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/[entity]-form-page/[entity]-form-page.component')
        .then(m => m.[Entity]FormPageComponent),
    title: 'Edit [Entity]',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Testing Requirements

### Unit Tests

- [ ] All validators tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly
- [ ] Form page validates correctly
- [ ] Details page displays data correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Module 1](./module1.md) - Relationship description
- [Module 2](./module2.md) - Relationship description

---

## Notes

### Important Considerations

1. **Nested Entity Management**: Backend uses "Replace All" strategy. Frontend must always send complete arrays when updating.
2. **ID Handling**: New nested entities don't have IDs. Existing ones preserve IDs from GET response.
3. **Form State**: Use pending changes guard to prevent data loss.
4. **Error Handling**: All HTTP errors should display user-friendly messages.

### Common Patterns

- Use signals for state management
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency

---

**Last Updated**: YYYY-MM-DD

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented
