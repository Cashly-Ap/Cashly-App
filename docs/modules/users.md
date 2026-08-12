# Users Module

## Overview

The Users module provides user administration functionality for system administrators. It allows CRUD operations on users and role assignment.

**Module Type**: `CRUD`

---

## Module Structure

```
src/app/features/users/
├── models/                   # Interfaces and types
│   ├── interfaces/
│   │   ├── user-list.interface.ts
│   │   ├── user-details.interface.ts
│   │   ├── user-edit.interface.ts
│   │   ├── user-create.interface.ts
│   │   └── index.ts
│   └── enums/
│       ├── user-type.enum.ts
│       └── index.ts
├── pages/                    # Route components
│   ├── users-list-page/
│   ├── users-form-page/
│   └── users-details-page/
├── services/
│   ├── api/
│   │   ├── user-api.service.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── user-application.service.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── user.mapper.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── user.validators.ts
│   └── index.ts
├── router/
│   ├── users.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- List all users with search and filtering
- Create new users with role assignment
- Edit existing user information and roles
- View user details
- Delete users (soft delete by setting active to false)
- Role-based access control display

---

## Pages

### List Page

**Route**: `/users`

**Component**: `UsersListPageComponent`

**Purpose**: Displays all users in a searchable, sortable table.

**Features**:

- PrimeNG Table with sorting and filtering
- Search by email or display name
- Status filter (active/inactive)
- Action buttons (View, Edit, Delete)
- Add new user button

### Form Page

**Route**: `/users/new` (Create) | `/users/:id/edit` (Edit)

**Component**: `UsersFormPageComponent`

**Purpose**: Create new user or edit existing one.

**Features**:

- Reactive forms with validation
- Email and password fields
- Role selection dropdown
- Active status toggle
- Real-time validation feedback

### Details Page

**Route**: `/users/:id`

**Component**: `UsersDetailsPageComponent`

**Purpose**: Display complete user information in read-only mode.

**Features**:

- Complete user data display
- Edit and Delete actions
- User activity information

---

## Data Models

### Interfaces

#### UserList

**Usage**: List page table rows (GET /api/users)

**Purpose**: Minimal data for table display.

```typescript
export interface UserList {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
  createdAt: string;
}
```

---

#### UserDetails

**Usage**: Details page display (GET /api/users/:id)

**Purpose**: Complete user data for viewing.

```typescript
export interface UserDetails {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  merchantId?: string;
  commissionDeductionPercentage: number;
}
```

---

#### UserEdit

**Usage**: Edit form data (derived from GET /api/users/:id)

**Purpose**: Form data for editing existing user.

```typescript
export interface UserEdit {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
}
```

---

#### UserCreate

**Usage**: Create form submission (POST /api/users)

**Purpose**: New user creation data.

```typescript
export interface UserCreate {
  email: string;
  password: string;
  displayName: string;
  type: UserType;
  active: boolean;
}
```

---

### Enums

#### UserType

```typescript
export enum UserType {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
}

export interface UserTypeOption {
  label: string;
  value: UserType;
}

export const USER_TYPES: readonly UserTypeOption[] = [
  { label: 'Usuario', value: UserType.USER },
  { label: 'Vendedor', value: UserType.MERCHANT },
  { label: 'Administrador', value: UserType.ADMIN },
  { label: 'Despachador', value: UserType.DISPATCHER },
] as const;

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.USER]: 'Usuario',
  [UserType.MERCHANT]: 'Vendedor',
  [UserType.ADMIN]: 'Administrador',
  [UserType.DISPATCHER]: 'Despachador',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] || type;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/users`

### Interface Mapping Summary

| HTTP Method | Endpoint       | Request Interface | Response Interface | Frontend Usage    |
| ----------- | -------------- | ----------------- | ------------------ | ----------------- |
| GET         | /api/users     | -                 | `UserList[]`       | List page         |
| GET         | /api/users/:id | -                 | `UserDetails`      | Details/Edit page |
| POST        | /api/users     | `UserCreate`      | `UserDetails`      | Create form       |
| PUT         | /api/users/:id | `UserEdit`        | `UserDetails`      | Edit form         |
| DELETE      | /api/users/:id | -                 | void (204)         | Delete action     |

---

### GET /api/users

**Purpose**: List all users

**Frontend Interface**: `UserList[]`

**Example Response**:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@example.com",
    "displayName": "Admin User",
    "type": "ADMIN",
    "active": true,
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

---

### GET /api/users/:id

**Purpose**: Get user by ID

**Frontend Interface**: `UserDetails`

**Example Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@example.com",
  "displayName": "Admin User",
  "type": "ADMIN",
  "active": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "commissionDeductionPercentage": 0
}
```

---

### POST /api/users

**Purpose**: Create new user

**Frontend Interface**: `UserCreate` (request), `UserDetails` (response)

**Example Request**:

```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "displayName": "New User",
  "type": "USER",
  "active": true
}
```

**Example Response**: Same as GET /:id

---

### PUT /api/users/:id

**Purpose**: Update existing user

**Frontend Interface**: `UserEdit` (request), `UserDetails` (response)

**Example Request**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "updated@example.com",
  "displayName": "Updated User",
  "type": "MERCHANT",
  "active": true
}
```

---

### DELETE /api/users/:id

**Purpose**: Delete user (soft delete)

**Response**: 204 No Content

---

## Validation Rules

### Field Validations

| Field         | Type    | Required | Rules                                                   | Error Message                                                                                                    |
| ------------- | ------- | -------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `email`       | string  | Yes      | Valid email format                                      | "El formato del correo electrónico es inválido"                                                                  |
| `password`    | string  | Yes      | Min 8 chars, uppercase, lowercase, number, special char | "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial" |
| `displayName` | string  | Yes      | 3-100 chars                                             | "El nombre debe tener entre 3 y 100 caracteres"                                                                  |
| `type`        | string  | Yes      | Valid UserType                                          | "El tipo de usuario es requerido"                                                                                |
| `active`      | boolean | Yes      | -                                                       | -                                                                                                                |

### Custom Validators

```typescript
// validators/user.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UserValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const password = control.value;
      const errors: string[] = [];

      if (password.length < 8) {
        errors.push('Al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Una mayúscula');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Una minúscula');
      }
      if (!/\d/.test(password)) {
        errors.push('Un número');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Un carácter especial');
      }

      return errors.length > 0 ? { weakPassword: errors } : null;
    };
  }

  static displayNameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      if (control.value.length < 3 || control.value.length > 100) {
        return { invalidDisplayName: 'El nombre debe tener entre 3 y 100 caracteres' };
      }

      return null;
    };
  }
}
```

---

## Form Structure

### Form Fields

- **Email**: Input text, required, email validation
- **Password**: Input password, required only on create, password strength validation
- **Display Name**: Input text, required, 3-100 characters
- **Type**: Dropdown select, required, UserType options
- **Active**: Toggle switch, required

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/user-api.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  getAll(): Observable<UserList[]> {
    return this.http.get<UserList[]>(this.baseUrl);
  }

  getById(id: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: UserCreate): Observable<UserDetails> {
    return this.http.post<UserDetails>(this.baseUrl, data);
  }

  update(id: string, data: UserEdit): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

### Application Service (Application Layer)

**File**: `services/application/user-application.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class UserApplicationService {
  private readonly api = inject(UserApiService);
  private readonly mapper = inject(UserMapper);

  readonly users = signal<UserList[]>([]);
  readonly currentUser = signal<UserDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadUsers(): Observable<UserList[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getAll().pipe(
      tap((users) => this.users.set(users)),
      tap({
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  loadUserById(id: string): Observable<UserDetails> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getById(id).pipe(
      tap((user) => this.currentUser.set(user)),
      tap({
        error: (err) => this.error.set(err.message),
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  createUser(data: UserCreate): Observable<UserDetails> {
    this.loading.set(true);

    return this.api.create(data).pipe(
      tap({
        next: (user) => {
          const listItem = this.mapper.toList(user);
          this.users.update((current) => [...current, listItem]);
        },
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  updateUser(id: string, data: UserEdit): Observable<UserDetails> {
    this.loading.set(true);

    return this.api.update(id, data).pipe(
      tap({
        next: (user) => {
          const listItem = this.mapper.toList(user);
          this.users.update((current) => current.map((u) => (u.id === id ? listItem : u)));
          if (this.currentUser()?.id === id) {
            this.currentUser.set(user);
          }
        },
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  deleteUser(id: string): Observable<void> {
    this.loading.set(true);

    return this.api.delete(id).pipe(
      tap({
        next: () => {
          this.users.update((current) => current.filter((u) => u.id !== id));
        },
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
```

---

### Mapper Service

**File**: `services/mappers/user.mapper.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class UserMapper {
  toList(user: UserDetails): UserList {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      type: user.type,
      active: user.active,
      createdAt: user.createdAt,
    };
  }

  toEdit(user: UserDetails): UserEdit {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      type: user.type,
      active: user.active,
    };
  }
}
```

---

## Business Rules

### User Management Rules

1. Only ADMIN users can access user management
2. Cannot delete own admin account
3. Password required only for new user creation
4. Email must be unique in the system
5. Soft delete (set active to false) instead of hard delete

### Role Assignment Rules

1. USER: Basic access, cannot manage other users
2. MERCHANT: Can access orders and customers
3. ADMIN: Full access including user management
4. DISPATCHER: Can access invoices and collections

---

## Routes Configuration

```typescript
// router/users.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards';
import { adminGuard } from '../guards/admin.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/users-list-page/users-list-page.component').then(
            (m) => m.UsersListPageComponent,
          ),
        title: 'Usuarios',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/users-form-page/users-form-page.component').then(
            (m) => m.UsersFormPageComponent,
          ),
        title: 'Nuevo Usuario',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/users-details-page/users-details-page.component').then(
            (m) => m.UsersDetailsPageComponent,
          ),
        title: 'Detalles del Usuario',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/users-form-page/users-form-page.component').then(
            (m) => m.UsersFormPageComponent,
          ),
        title: 'Editar Usuario',
        canDeactivate: [pendingChangesGuard],
      },
    ],
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

- [Auth Module](./auth.md) - Authentication and user types
- [Dashboard Module](./dashboard.md) - Default redirect after login

---

## Notes

### Important Considerations

1. **Admin Guard**: User management should only be accessible to ADMIN users
2. **Password Handling**: Password field should be hidden/disabled in edit mode
3. **Self-Protection**: Cannot delete or deactivate own admin account
4. **Email Uniqueness**: Backend will reject duplicate emails

### Common Patterns

- Use signals for state management
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency

---

**Last Updated**: 2026-03-26

**Module Status**: [ ] Planned | [x] In Development | [ ] Implemented
