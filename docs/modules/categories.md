# Categories Module

## Overview

The Categories module manages product categories for the invoicing system. Categories are independent entities with their own lifecycle (ID, Code, Name), enabling consistent categorization, filtering, and reporting of products.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/categories/
├── messages/
│   ├── success-messages.ts
│   ├── error-messages.ts
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── category-list.interface.ts
│   │   ├── category-details.interface.ts
│   │   ├── category-create.interface.ts
│   │   ├── category-edit.interface.ts
│   │   ├── category-form-data.interface.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── categories-list-page/
│   │   ├── categories-list-page.component.ts
│   │   ├── categories-list-page.component.html
│   │   └── categories-list-page.component.spec.ts
│   ├── categories-form-page/
│   │   ├── categories-form-page.component.ts
│   │   ├── categories-form-page.component.html
│   │   ├── categories-form-page.component.spec.ts
│   │   └── categories-form-page.config.ts
│   ├── categories-details-page/
│   │   ├── categories-details-page.component.ts
│   │   ├── categories-details-page.component.html
│   │   └── categories-details-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── category-api.service.ts
│   │   ├── category-api.service.spec.ts
│   │   ├── category.service.ts
│   │   ├── category.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── category.mapper.ts
│   │   ├── category.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── category.validators.ts
│   ├── category.validators.spec.ts
│   └── index.ts
├── router/
│   ├── category.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- Category CRUD operations (create, read, update, delete)
- Auto-generated sequential category codes (CAT-XXXXX)
- Unique category names (case-insensitive)
- Category name validation (2-100 characters)
- Products association tracking
- Deletion protection (cannot delete categories with products)

---

## Pages

### List Page

**Route**: `/categories`

**Component**: `CategoriesListPageComponent`

**Purpose**: Displays all categories in a searchable, sortable table.

**Features**:

- PrimeNG DataTable with sorting and filtering
- Search by code and name
- Pagination
- Action buttons (View, Edit, Delete)
- Add new category button
- Delete confirmation dialog

### Form Page

**Route**: `/categories/new` (Create) | `/categories/:id/edit` (Edit)

**Component**: `CategoriesFormPageComponent`

**Purpose**: Create new category or edit existing one.

**Features**:

- Simple form layout (no tabs needed)
- Reactive forms with validation
- Name uniqueness validation (server-side)
- Pending changes guard

### Details Page

**Route**: `/categories/:id`

**Component**: `CategoriesDetailsPageComponent`

**Purpose**: Display complete category information in read-only mode.

**Features**:

- Complete category data display
- Code (auto-generated) display
- Edit and Delete actions
- Creation and update timestamps

---

## Data Models

### Interfaces

#### CategoryList

**Usage**: List page table rows (GET /api/categories)

**Purpose**: Data for table display.

```typescript
export interface CategoryList {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

**API Mapping**: Maps directly from `CategoryResponse`

---

#### CategoryDetails

**Usage**: Details page display (GET /api/categories/:id)

**Purpose**: Complete category data for viewing.

```typescript
export interface CategoryDetails {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

**API Mapping**: Maps from `CategoryResponse`

---

#### CategoryEdit

**Usage**: Edit form data (derived from GET /api/categories/:id)

**Purpose**: Form data for editing existing category.

```typescript
export interface CategoryEdit {
  name: string;
}
```

**API Mapping**: Maps to `UpdateCategoryRequest` for PUT request

---

#### CategoryCreate

**Usage**: Create form submission (POST /api/categories)

**Purpose**: New category creation data.

```typescript
export interface CategoryCreate {
  name: string;
}
```

**API Mapping**: Maps directly to `CreateCategoryRequest`

---

#### CategoryFormData

**Usage**: Internal form model for create/edit forms

**Purpose**: Form state management.

```typescript
export interface CategoryFormData {
  id?: number;
  code?: string;
  name: string;
}
```

---

#### CategoryOption

**Usage**: Dropdown options in product forms

**Purpose**: Simplified category data for select inputs.

```typescript
export interface CategoryOption {
  id: number;
  code: string;
  name: string;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/categories`

### Interface Mapping Summary

| HTTP Method | Endpoint            | Request Interface | Response Interface | Frontend Usage                   |
| ----------- | ------------------- | ----------------- | ------------------ | -------------------------------- |
| GET         | /api/categories     | -                 | `CategoryList[]`   | List page, Product form dropdown |
| GET         | /api/categories/:id | -                 | `CategoryDetails`  | Details/Edit page                |
| POST        | /api/categories     | `CategoryCreate`  | `CategoryDetails`  | Create form                      |
| PUT         | /api/categories/:id | `CategoryEdit`    | `CategoryDetails`  | Edit form                        |
| DELETE      | /api/categories/:id | -                 | void (204)         | Delete action                    |

---

### GET /api/categories

**Purpose**: List all categories

**Frontend Interface**: `CategoryList[]`

**Example Response**:

```json
[
  {
    "id": 1,
    "code": "CAT-00001",
    "name": "Electronics",
    "createdAt": "2025-12-19T10:00:00",
    "updatedAt": "2025-12-19T10:00:00"
  },
  {
    "id": 2,
    "code": "CAT-00002",
    "name": "Gifts",
    "createdAt": "2025-12-19T10:05:00",
    "updatedAt": "2025-12-19T10:05:00"
  }
]
```

---

### GET /api/categories/:id

**Purpose**: Get category by ID

**Frontend Interface**: `CategoryDetails`

**Example Response**:

```json
{
  "id": 1,
  "code": "CAT-00001",
  "name": "Electronics",
  "createdAt": "2025-12-19T10:00:00",
  "updatedAt": "2025-12-19T10:00:00"
}
```

**Errors**:

- `404 Not Found`: Category not found

---

### POST /api/categories

**Purpose**: Create new category

**Frontend Interface**: `CategoryCreate` (request), `CategoryDetails` (response)

**Example Request**:

```json
{
  "name": "Electronics"
}
```

**Example Response**:

```json
{
  "id": 1,
  "code": "CAT-00001",
  "name": "Electronics",
  "createdAt": "2025-12-19T10:00:00",
  "updatedAt": "2025-12-19T10:00:00"
}
```

**Errors**:

- `400 Bad Request`: Invalid request data or validation error
- `409 Conflict`: Category name already exists

---

### PUT /api/categories/:id

**Purpose**: Update existing category

**Frontend Interface**: `CategoryEdit` (request), `CategoryDetails` (response)

**Example Request**:

```json
{
  "name": "Electronics & Gadgets"
}
```

**Example Response**:

```json
{
  "id": 1,
  "code": "CAT-00001",
  "name": "Electronics & Gadgets",
  "createdAt": "2025-12-19T10:00:00",
  "updatedAt": "2025-12-19T11:30:00"
}
```

**Errors**:

- `400 Bad Request`: Invalid request data or validation error
- `404 Not Found`: Category not found
- `409 Conflict`: Category name already exists

---

### DELETE /api/categories/:id

**Purpose**: Delete a category

**Response**: 204 No Content

**Errors**:

- `404 Not Found`: Category not found
- `409 Conflict`: Cannot delete category with associated products

---

## Validation Rules

### Field Validations

| Field  | Type   | Required | Rules                    | Error Message                               |
| ------ | ------ | -------- | ------------------------ | ------------------------------------------- |
| `name` | string | Yes      | 2-100 characters, unique | "El nombre es requerido (2-100 caracteres)" |

### Custom Validators

```typescript
// validators/category.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CategoryValidators {
  static nameLength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const name = control.value.trim();
      if (name.length < 2 || name.length > 100) {
        return { nameLength: 'El nombre debe tener entre 2 y 100 caracteres' };
      }

      return null;
    };
  }
}
```

---

## Form Structure

### Simple Form (No Tabs)

Since categories have only one field (name), no tabs are needed. The form uses `BaseFormComponent` directly without tab sections.

### Form Model

```typescript
interface CategoryFormModel {
  id?: number;
  code?: string;
  name: string;
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/category-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  getAll(): Observable<CategoryList[]> {
    return this.http.get<CategoryList[]>(this.baseUrl);
  }

  getById(id: number): Observable<CategoryDetails> {
    return this.http.get<CategoryDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CategoryCreate): Observable<CategoryDetails> {
    return this.http.post<CategoryDetails>(this.baseUrl, data);
  }

  update(id: number, data: CategoryEdit): Observable<CategoryDetails> {
    return this.http.put<CategoryDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/api/category.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(CategoryApiService);
  private readonly mapper = inject(CategoryMapper);

  // State signals
  readonly categories = signal<CategoryList[]>([]);
  readonly currentCategory = signal<CategoryDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(): Observable<CategoryList[]> {
    this.loading.set(true);
    return this.api.getAll().pipe(
      tap((categories) => this.categories.set(categories)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadById(id: number): Observable<CategoryDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap((category) => this.currentCategory.set(category)),
      finalize(() => this.loading.set(false)),
    );
  }

  getFormData(id: number): Observable<CategoryFormData> {
    return this.loadById(id).pipe(map((category) => this.mapper.toFormData(category)));
  }

  create(formData: CategoryFormData): Observable<CategoryDetails> {
    this.loading.set(true);
    const request = this.mapper.toCreateRequest(formData);
    return this.api.create(request).pipe(finalize(() => this.loading.set(false)));
  }

  update(id: number, formData: CategoryFormData): Observable<CategoryDetails> {
    this.loading.set(true);
    const request = this.mapper.toUpdateRequest(formData);
    return this.api.update(id, request).pipe(
      tap((category) => this.currentCategory.set(category)),
      finalize(() => this.loading.set(false)),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete(id).pipe(
      tap(() => {
        this.categories.update((cats) => cats.filter((c) => c.id !== id));
      }),
    );
  }

  // For dropdown options in other modules (Products)
  getOptionsForDropdown(): Observable<CategoryOption[]> {
    return this.loadAll().pipe(
      map((categories) =>
        categories.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        })),
      ),
    );
  }
}
```

---

### Mapper Service

**File**: `services/mappers/category.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class CategoryMapper {
  toFormData(details: CategoryDetails): CategoryFormData {
    return {
      id: details.id,
      code: details.code,
      name: details.name,
    };
  }

  toCreateRequest(form: CategoryFormData): CategoryCreate {
    return {
      name: form.name.trim(),
    };
  }

  toUpdateRequest(form: CategoryFormData): CategoryEdit {
    return {
      name: form.name.trim(),
    };
  }
}
```

---

## Business Rules

### Category Code Rules

1. Category code is auto-generated sequentially (CAT-00001, CAT-00002...)
2. Category code cannot be changed after creation
3. Code format: `CAT-XXXXX` where X is a digit

### Category Name Rules

1. Name is required (2-100 characters)
2. Name must be unique (case-insensitive)
3. Leading/trailing whitespace is trimmed

### Deletion Rules

1. Cannot delete category if it has associated products
2. Returns `409 Conflict` if products exist

---

## Routes Configuration

```typescript
// router/category.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/categories-list-page/categories-list-page.component').then(
        (m) => m.CategoriesListPageComponent,
      ),
    title: 'Categorías',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/categories-form-page/categories-form-page.component').then(
        (m) => m.CategoriesFormPageComponent,
      ),
    title: 'Nueva Categoría',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/categories-details-page/categories-details-page.component').then(
        (m) => m.CategoriesDetailsPageComponent,
      ),
    title: 'Detalles de la Categoría',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/categories-form-page/categories-form-page.component').then(
        (m) => m.CategoriesFormPageComponent,
      ),
    title: 'Editar Categoría',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Messages

### Success Messages

```typescript
// messages/success-messages.ts
export const CATEGORY_SUCCESS_MESSAGES = {
  CREATED: 'Categoría creada exitosamente',
  UPDATED: 'Categoría actualizada exitosamente',
  DELETED: 'Categoría eliminada exitosamente',
} as const;
```

### Error Messages

```typescript
// messages/error-messages.ts
export const CATEGORY_ERROR_MESSAGES = {
  LOAD_ERROR: 'Error al cargar las categorías. Por favor, intente nuevamente.',
  LOAD_ONE_ERROR: 'Error al cargar la categoría. Es posible que no exista.',
  CREATE_ERROR: 'Error al crear la categoría. Por favor, intente nuevamente.',
  UPDATE_ERROR: 'Error al actualizar la categoría. Por favor, intente nuevamente.',
  DELETE_ERROR: 'Error al eliminar la categoría. Por favor, intente nuevamente.',
  DELETE_HAS_PRODUCTS: 'No se puede eliminar la categoría porque tiene productos asociados.',
  DUPLICATE_NAME: 'Ya existe una categoría con este nombre.',
  VALIDATION_ERROR: 'Por favor, complete todos los campos requeridos correctamente.',
} as const;
```

---

## Testing Requirements

### Unit Tests

- [ ] Name length validator tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested

### Component Tests

- [ ] List page renders correctly
- [ ] Form page validation works
- [ ] Details page displays data correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full CRUD workflow tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Products Module](./products.md) - Products reference categories by ID

---

## Notes

### Important Considerations

1. **Category Code**: Auto-generated as CAT-XXXXX and cannot be changed.
2. **Unique Names**: Category names must be unique (case-insensitive).
3. **Deletion Protection**: Categories with products cannot be deleted.
4. **Dropdown Integration**: CategoryService provides `getOptionsForDropdown()` for product forms.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Simple form without tabs (single field)

---

**Last Updated**: 2025-12-19

**Module Status**: [ ] Planned | [x] In Development | [ ] Implemented
