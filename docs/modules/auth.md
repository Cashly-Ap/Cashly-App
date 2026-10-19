# Auth Module

## Overview

The Auth module handles user authentication, JWT token management, and user profile updates. It provides login, logout, token refresh, and account management functionality.

**Module Type**: `Auth`

---

## Module Structure

```
src/app/features/auth/
├── guards/                   # Route guards
│   ├── auth.guard.ts
│   ├── auth.guard.spec.ts
│   └── index.ts
├── interceptors/             # HTTP interceptors
│   ├── auth.interceptor.ts
│   ├── auth.interceptor.spec.ts
│   └── index.ts
├── models/                   # Interfaces and types
│   ├── user.model.ts
│   └── index.ts
├── pages/                    # Route components
│   ├── login-page/
│   │   └── login-page.component.ts
│   ├── change-password-page/
│   │   └── change-password-page.component.ts
│   ├── change-username-page/
│   │   └── change-username-page.component.ts
│   ├── configuration-page/
│   │   └── configuration-page.component.ts
│   └── index.ts
├── services/
│   ├── auth-api.service.ts
│   ├── auth-api.service.spec.ts
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   └── index.ts
├── validators/
│   ├── auth-validators.ts
│   ├── auth-validators.spec.ts
│   └── index.ts
├── router/
│   ├── auth.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- User login with email and password
- JWT access token management
- Refresh token automatic renewal
- Logout with token revocation
- Change username functionality
- Change password functionality
- Route guards for protected routes
- HTTP interceptor for automatic token injection
- Automatic redirect on 401 responses

---

## Pages

### Login Page

**Route**: `/auth/login`

**Component**: `LoginPageComponent`

**Purpose**: User authentication entry point.

**Features**:

- Email and password form
- Form validation
- Error message display
- Remember me option (optional)
- Redirect to dashboard on success

### Change Password Page

**Route**: `/auth/change-password`

**Component**: `ChangePasswordPageComponent`

**Purpose**: Allow users to update their password.

**Features**:

- New password input with confirmation
- Password strength validation
- Success notification
- Error handling

### Change Username Page

**Route**: `/auth/change-username`

**Component**: `ChangeUsernamePageComponent`

**Purpose**: Allow users to update their display name.

**Features**:

- Username input
- Format validation
- Success notification
- Error handling

### Configuration Page

**Route**: `/auth/configuration`

**Component**: `ConfigurationPageComponent`

**Purpose**: User account settings dashboard.

**Features**:

- Profile information display
- Links to change password
- Links to change username
- Account settings

---

## Data Models

### Interfaces

#### User

**Usage**: Complete user entity representation

```typescript
export interface User {
  id: string;
  email: string;
  password?: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### UserResponse

**Usage**: User data returned by API (no password)

```typescript
export interface UserResponse {
  id: string;
  email: string;
  userName: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### RegisterUserRequest

**Usage**: User registration payload

```typescript
export interface RegisterUserRequest {
  email: string;
  password: string;
}
```

---

#### LoginRequest

**Usage**: Login form submission

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}
```

---

#### AuthenticationResponse

**Usage**: Response after successful login or token refresh

```typescript
export interface AuthenticationResponse {
  accessToken: string; // JWT access token (short-lived)
  refreshToken: string; // Refresh token (long-lived)
  tokenType: string; // Always "Bearer"
  expiresIn: number; // Seconds until expiration
  user: UserResponse; // User information
}
```

---

#### RefreshTokenRequest

**Usage**: Token refresh request

```typescript
export interface RefreshTokenRequest {
  refreshToken: string;
}
```

---

#### LogoutRequest

**Usage**: Logout request

```typescript
export interface LogoutRequest {
  refreshToken: string;
}
```

---

#### ChangeUsernameRequest

**Usage**: Username change request

```typescript
export interface ChangeUsernameRequest {
  username: string;
}
```

---

#### ChangePasswordRequest

**Usage**: Password change request

```typescript
export interface ChangePasswordRequest {
  newPassword: string;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/auth`

### Interface Mapping Summary

| HTTP Method | Endpoint                  | Request Interface       | Response Interface       | Auth Required |
| ----------- | ------------------------- | ----------------------- | ------------------------ | ------------- |
| POST        | /api/auth/register        | `RegisterUserRequest`   | `UserResponse`           | No            |
| POST        | /api/auth/login           | `LoginRequest`          | `AuthenticationResponse` | No            |
| POST        | /api/auth/refresh         | `RefreshTokenRequest`   | `AuthenticationResponse` | No            |
| POST        | /api/auth/logout          | `LogoutRequest`         | void (204)               | No            |
| PATCH       | /api/auth/change-username | `ChangeUsernameRequest` | `UserResponse`           | Yes           |
| PATCH       | /api/auth/change-password | `ChangePasswordRequest` | void (204)               | Yes           |

---

### POST /api/auth/register

**Purpose**: Register new user account

**Frontend Interface**: `RegisterUserRequest` (request), `UserResponse` (response)

**Example Request**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Example Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "userName": "user@example.com",
  "active": true,
  "emailVerified": false,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Errors**:

- `400 Bad Request`: Invalid email or password format
- `409 Conflict`: Email already exists

---

### POST /api/auth/login

**Purpose**: Authenticate user and get tokens

**Frontend Interface**: `LoginRequest` (request), `AuthenticationResponse` (response)

**Example Request**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Example Response**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "userName": "user@example.com",
    "active": true,
    "emailVerified": false,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Errors**:

- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: User account is inactive

---

### POST /api/auth/refresh

**Purpose**: Get new access token using refresh token

**Frontend Interface**: `RefreshTokenRequest` (request), `AuthenticationResponse` (response)

**Example Request**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Response**: Same as login response

**Errors**:

- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid or expired refresh token

---

### POST /api/auth/logout

**Purpose**: Revoke refresh token

**Frontend Interface**: `LogoutRequest` (request), void (response)

**Example Request**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: 204 No Content

---

### PATCH /api/auth/change-username

**Purpose**: Update user display name

**Frontend Interface**: `ChangeUsernameRequest` (request), `UserResponse` (response)

**Example Request**:

```json
{
  "username": "new_username"
}
```

**Example Response**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "userName": "new_username",
  "active": true,
  "emailVerified": false,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T12:45:00Z"
}
```

---

### PATCH /api/auth/change-password

**Purpose**: Update user password

**Frontend Interface**: `ChangePasswordRequest` (request), void (response)

**Example Request**:

```json
{
  "newPassword": "NewSecurePass456!"
}
```

**Response**: 204 No Content

---

## Validation Rules

### Login Form

| Field      | Type   | Required | Rules              | Error Message          |
| ---------- | ------ | -------- | ------------------ | ---------------------- |
| `email`    | string | Yes      | Valid email format | "Invalid email format" |
| `password` | string | Yes      | Non-empty          | "Password is required" |

### Registration Form

| Field      | Type   | Required | Rules                                                   | Error Message                     |
| ---------- | ------ | -------- | ------------------------------------------------------- | --------------------------------- |
| `email`    | string | Yes      | Valid email format                                      | "Invalid email format"            |
| `password` | string | Yes      | Min 8 chars, uppercase, lowercase, number, special char | "Password must meet requirements" |

### Change Username Form

| Field      | Type   | Required | Rules                                    | Error Message                      |
| ---------- | ------ | -------- | ---------------------------------------- | ---------------------------------- |
| `username` | string | Yes      | 3-50 chars, alphanumeric and underscores | "Username must be 3-50 characters" |

### Change Password Form

| Field             | Type   | Required | Rules                                                   | Error Message                     |
| ----------------- | ------ | -------- | ------------------------------------------------------- | --------------------------------- |
| `newPassword`     | string | Yes      | Min 8 chars, uppercase, lowercase, number, special char | "Password must meet requirements" |
| `confirmPassword` | string | Yes      | Must match newPassword                                  | "Passwords must match"            |

### Custom Validators

```typescript
// validators/auth-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AuthValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const password = control.value;
      const errors: string[] = [];

      if (password.length < 8) {
        errors.push('At least 8 characters');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('At least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('At least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('At least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('At least one special character');
      }

      return errors.length > 0 ? { weakPassword: errors } : null;
    };
  }

  static usernameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const pattern = /^[a-zA-Z0-9_]{3,50}$/;
      if (!pattern.test(control.value)) {
        return { invalidUsername: 'Username must be 3-50 alphanumeric characters or underscores' };
      }

      return null;
    };
  }

  static passwordMatch(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.parent?.get(passwordField);
      if (!password || !control.value) return null;

      if (password.value !== control.value) {
        return { passwordMismatch: 'Passwords do not match' };
      }

      return null;
    };
  }
}
```

---

## Service Architecture

### Auth API Service (Infrastructure Layer)

**File**: `services/auth-api.service.ts`

**Purpose**: Raw HTTP communication with auth backend

```typescript
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  register(data: RegisterUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/login`, data);
  }

  refresh(data: RefreshTokenRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(`${this.baseUrl}/refresh`, data);
  }

  logout(data: LogoutRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, data);
  }

  changeUsername(data: ChangeUsernameRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.baseUrl}/change-username`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/change-password`, data);
  }
}
```

---

### Auth Service (Application Layer)

**File**: `services/auth.service.ts`

**Purpose**: Authentication state management, token handling

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  // State signals
  readonly currentUser = signal<UserResponse | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly loading = signal(false);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthenticationResponse> {
    this.loading.set(true);
    return this.api.login(credentials).pipe(
      tap((response) => this.handleAuthResponse(response)),
      finalize(() => this.loading.set(false)),
    );
  }

  logout(): Observable<void> {
    if (!this.refreshToken) {
      this.clearAuth();
      return of(void 0);
    }

    return this.api
      .logout({ refreshToken: this.refreshToken })
      .pipe(finalize(() => this.clearAuth()));
  }

  refreshAccessToken(): Observable<AuthenticationResponse> {
    if (!this.refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    return this.api
      .refresh({ refreshToken: this.refreshToken })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private handleAuthResponse(response: AuthenticationResponse): void {
    this.accessToken = response.accessToken;
    this.refreshToken = response.refreshToken;
    this.currentUser.set(response.user);
    this.saveToStorage();
  }

  private clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser.set(null);
    this.clearStorage();
    this.router.navigate(['/auth/login']);
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const data = JSON.parse(stored);
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.currentUser.set(data.user);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        user: this.currentUser(),
      }),
    );
  }

  private clearStorage(): void {
    localStorage.removeItem('auth');
  }
}
```

---

## Guards and Interceptors

### Auth Guard

**File**: `guards/auth.guard.ts`

**Purpose**: Protect routes that require authentication

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};
```

---

### Auth Interceptor

**File**: `interceptors/auth.interceptor.ts`

**Purpose**: Add Authorization header and handle 401 responses

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Try to refresh token or redirect to login
        return authService.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(clonedReq);
          }),
          catchError(() => {
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
```

---

## Business Rules

### Authentication Rules

1. Only active users can authenticate
2. Password must match encrypted stored password
3. Successful login generates both access and refresh tokens
4. Access tokens expire after 1 hour (3600 seconds)
5. Refresh tokens expire after 7 days

### Token Management Rules

1. Access token must be included in Authorization header for protected endpoints
2. Refresh token is single-use (revoked after successful refresh)
3. Revoked tokens cannot be reused
4. Logout revokes the refresh token immediately
5. 401 response triggers automatic token refresh attempt

### Registration Rules

1. Email must be unique in the system
2. Email must be in valid format
3. Password must be at least 8 characters
4. Password must contain uppercase, lowercase, number, and special character
5. New users are active by default
6. New users have unverified email by default

### Username Rules

1. Username must be 3-50 characters
2. Only alphanumeric characters and underscores allowed
3. Cannot be empty

---

## Routes Configuration

```typescript
// router/auth.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
    title: 'Iniciar Sesión',
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('../pages/change-password-page/change-password-page.component').then(
        (m) => m.ChangePasswordPageComponent,
      ),
    title: 'Cambiar Contraseña',
    canActivate: [authGuard],
  },
  {
    path: 'change-username',
    loadComponent: () =>
      import('../pages/change-username-page/change-username-page.component').then(
        (m) => m.ChangeUsernamePageComponent,
      ),
    title: 'Cambiar Usuario',
    canActivate: [authGuard],
  },
  {
    path: 'configuration',
    loadComponent: () =>
      import('../pages/configuration-page/configuration-page.component').then(
        (m) => m.ConfigurationPageComponent,
      ),
    title: 'Configuración',
    canActivate: [authGuard],
  },
];
```

---

## Testing Requirements

### Unit Tests

- [x] Password strength validator tested
- [x] Username format validator tested
- [x] Auth guard tested
- [x] Auth interceptor tested
- [x] Auth API service HTTP calls mocked
- [x] Auth service state management tested

### Component Tests

- [ ] Login page form validation
- [ ] Change password form validation
- [ ] Change username form validation
- [ ] Error message display

### Integration Tests

- [ ] Full login workflow tested
- [ ] Token refresh workflow tested
- [ ] Logout workflow tested
- [ ] 401 handling tested

---

## Related Modules

- All other modules depend on Auth for route protection
- [Dashboard Module](./dashboard.md) - Default redirect after login
- [Customers Module](./customers.md) - Example of protected module

---

## Notes

### Important Considerations

1. **Token Storage**: Tokens are stored in localStorage. Consider httpOnly cookies for production.
2. **Token Refresh**: Automatic refresh on 401 prevents user session interruption.
3. **Password Security**: Passwords are never logged or exposed.
4. **State Persistence**: Auth state is restored from localStorage on app load.
5. **Interceptor Skip**: Auth endpoints are excluded from token injection.

### Security Best Practices

- Use HTTPS in production
- Consider shorter access token expiration
- Implement refresh token rotation
- Add rate limiting for login attempts
- Log authentication events
- Consider adding 2FA support

### Common Patterns

- Use signals for reactive state management
- Centralize token handling in AuthService
- Use guards for route protection
- Use interceptors for automatic token injection
- Handle 401 globally with retry logic

---

**Last Updated**: 2025-12-18

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented

### Perfil de la cuenta autenticada

La página **Mi perfil** reúne nombre y apellidos, usuario, correo, teléfono único,
dirección completa, rol y departamento, estado de cuenta y verificación del correo,
fechas de registro y actualización. El identificador interno no se muestra. Los campos sin datos
se muestran como **No indicado** o **Sin asignar**.

`SelfProfileService` consulta `GET /api/auth/profile` para leer exclusivamente la
cuenta autenticada, sin necesitar permiso de lectura de usuarios. La sección
**Mis permisos** consulta el acceso efectivo de `/api/auth/access`, muestra módulos
y acciones en español y no permite modificar permisos. La indicación de
administrador del sistema depende del indicador `systemAdministrator`, no del
nombre del rol. Cada consulta tiene su propio estado de carga, error y reintento.

La acción **Editar perfil** abre el formulario compartido por pestañas General y
Contacto y dirección, conservando la ruta `/platform/auth/change-username`. Guarda
únicamente usuario, nombre, apellidos, teléfono único y dirección mediante
`PUT /api/auth/profile`. El correo es de solo lectura. No contiene controles de rol,
departamento, permisos ni estado. La sincronización local actualiza solo el nombre
visible y conserva el acceso efectivo. Se mantiene la acción de contraseña. La composición utiliza los componentes de detalle
compartidos y una cuadrícula adaptable que amplía los campos sueltos a toda la fila.
