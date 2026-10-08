# Architecture

This document describes the architecture, project structure, and design patterns used in the Lexand application.

## 🏗️ Application Overview

Lexand is a comprehensive business management system built with Angular 21, following modern best practices and clean architecture principles.

### Technology Stack

- **Frontend Framework**: Angular 21 (standalone components)
- **UI Library**: PrimeNG 21
- **Language**: TypeScript 5.8
- **State Management**: Signals + RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Angular Reactive Forms
- **Architecture**: Single Page Application (SPA)
- **Testing**: Vitest

## 📁 Project Structure

```
lexand-app/
├── public/                          # Static assets
├── src/
│   ├── app/
│   │   ├── core/                    # Core module (forms, layouts, theme, errors)
│   │   │   ├── forms/              # Reusable form components and helpers
│   │   │   ├── layouts/            # Layout components (main-layout)
│   │   │   ├── theme/              # Theme management and toggle
│   │   │   ├── errors/             # HTTP error handlers
│   │   │   └── pending-tabs/       # Pending changes management
│   │   │
│   │   ├── shared/                 # Shared components
│   │   │   ├── components/
│   │   │   │   ├── details/        # Detail page components
│   │   │   │   ├── list/           # List page components
│   │   │   │   └── ui/             # UI components (empty-state, loading-spinner)
│   │   │
│   │   ├── features/               # Feature modules (lazy-loaded)
│   │   │   │
│   │   │   ├── customers/          # Customer management module
│   │   │   │   ├── components/     # Feature-specific components (form tabs)
│   │   │   │   ├── pages/          # Routable page components
│   │   │   │   │   ├── customers-list-page/
│   │   │   │   │   ├── customers-form-page/
│   │   │   │   │   └── customers-details-page/
│   │   │   │   ├── models/         # Customer-specific models and interfaces
│   │   │   │   │   ├── interfaces/ # Customer, CustomerList, CustomerEdit, CustomerCreate, CustomerDetail
│   │   │   │   │   └── enums/      # Customer enums (status, type)
│   │   │   │   ├── validators/     # Form validators
│   │   │   │   ├── services/       # Customer services
│   │   │   │   │   ├── api/        # API service layer
│   │   │   │   │   ├── application/# Business logic layer
│   │   │   │   │   └── mappers/    # DTO mappers
│   │   │   │   ├── router/         # Customer routes
│   │   │   │   └── index.ts        # Public API
│   │   │   │
│   │   │   ├── auth/               # Authentication module
│   │   │   │   └── [same structure]
│   │   │   │
│   │   │   ├── dashboard/          # Dashboard module
│   │   │   │   └── [same structure]
│   │   │   │
│   │   │   ├── products/           # Product management module
│   │   │   │   └── [same structure]
│   │   │   │
│   │   │   └── warehouses/         # Warehouse management module
│   │   │       └── [same structure]
│   │   │
│   │   ├── app.config.ts           # App configuration
│   │   ├── app.routes.ts           # Root routes
│   │   └── app.ts                  # Root component
│   │
│   ├── environments/                # Environment configurations
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # Application entry point
│   └── styles.css                   # Global styles entry
│
├── docs/                            # Documentation
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.app.json               # App TypeScript config
├── tsconfig.spec.json              # Test TypeScript config
├── vitest.config.mts               # Vitest configuration
├── package.json                     # Dependencies and scripts
├── Dockerfile                       # Production Dockerfile
├── Dockerfile.dev                  # Development Dockerfile
├── Dockerfile.test                 # Testing Dockerfile
├── docker-compose.yml              # Docker Compose configuration
├── .gitignore                      # Git ignore rules
├── README.md                        # Main documentation
└── ROADMAP.md                       # Project roadmap
```

## 🏛️ Architecture Patterns

### 1. Feature-Based Module Structure

Each feature module is self-contained with its own:

- **Components**: Feature-specific UI components (usually for form tabs)
- **Pages**: Three main routable pages (list, form, details)
- **Models**: TypeScript interfaces organized by type (interfaces/ and enums/)
- **Services**: Business logic (application/) and API communication (api/), plus mappers
- **Validators**: Form validators
- **Router**: Feature-specific routing configuration

**Page Structure**:

Lexand uses **three standardized pages** per module:

1. **List Page** (`pages/<module>-list-page/`) - Orchestrates list data, filters, navigation, and feature components using `shared/components/list`
2. **Form Page** (`pages/<module>-form-page/`) - Handles both create and edit using `core/forms`
3. **Details Page** (`pages/<module>-details-page/`) - Shows detailed view using `shared/components/details`; record operations use the shared `detail-actions-menu`

Related datasets that need their own filtering or pagination, such as warehouse stock and movement history, use dedicated lazy pages instead of expanding the entity details page.

Search controls reuse `SearchFieldComponent`. The component keeps typed text as an internal draft and emits the applied term only when the user presses its search button or the Enter key, preventing server requests on each ordinary keystroke.
List toolbars remain rendered during initial loading and empty states so search, filters, and creation actions are always reachable. Icon-only search actions expose an accessible `Buscar` label and the same text through a hover tooltip.

**Components Folder**:

The `components/` folder contains reusable feature presentation such as form sections, dialogs, and focused interactive flows. Routable pages compose these components and keep modal markup and validation outside page templates.

**Model Interfaces**:

Instead of Builder pattern, use specific interfaces for different views:

- **`<Entity>`** - Complete entity interface
- **`<Entity>List`** - Minimal data for list views
- **`<Entity>Edit`** - Data for edit forms
- **`<Entity>Create`** - Data for creation (DTOs)
- **`<Entity>Detail`** - Complete data for detail views

**Benefits**:

- Better code organization
- Easier to maintain and scale
- Clear boundaries between features
- Facilitates lazy loading
- Standardized structure across all modules

### 2. Lazy Loading

All feature modules are lazy-loaded to improve initial load time:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'customers',
    loadChildren: () =>
      import('./features/customers/routes/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  },
  // ... other routes
];
```

### 3. Standalone Components

Angular 21 standalone components with modern syntax:

Authenticated feature pages render inside a persistent `MainLayoutComponent` route shell. Feature templates contain only page content and must not wrap themselves in `<app-main-layout>`. This keeps the menu, notification connection, pending tabs, and shared overlays alive while child routes change. Heavy report dialogs in the shell use `@defer` and load only when a report action opens them.

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  customers = input.required<Customer[]>();
  loading = input<boolean>(false);

  view = output<Customer>();
  edit = output<Customer>();
}
```

**Template file** (`customer-list.component.html`):

```html
@if (loading()) {
<p-progressSpinner />
} @for (customer of customers(); track customer.id) {
<div class="p-4 border rounded-lg">
  <h3 class="text-lg font-semibold">{{ customer.name }}</h3>
  <p class="text-gray-600">{{ customer.email }}</p>
</div>
} @empty {
<p class="text-center text-gray-500">No customers found</p>
}
```

**Note**: All components use **external HTML templates** (templateUrl) and **Tailwind CSS** for styling. Never use inline templates or styleUrls/styles.

### 4. Service Layer Architecture

```
┌─────────────────────────────────────────┐
│          Component Layer                │
│  (Presentation & User Interaction)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Service Layer                  │
│  (Business Logic & State Management)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          API Service Layer              │
│  (HTTP Communication)                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Backend API                    │
│  (Spring Boot + MySQL)                  │
└─────────────────────────────────────────┘
```

**Example**:

```typescript
// customer-api.service.ts (HTTP layer)
@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }
}

// customer.service.ts (Business logic layer)
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private customers$ = new BehaviorSubject<Customer[]>([]);

  constructor(private api: CustomerApiService) {}

  loadCustomers(): void {
    this.api.getAll().subscribe((customers) => {
      this.customers$.next(customers);
    });
  }

  getCustomers(): Observable<Customer[]> {
    return this.customers$.asObservable();
  }
}
```

### 5. Reactive Programming with RxJS

Heavy use of RxJS for:

- Asynchronous operations
- Event handling
- State management
- Data streams

```typescript
// Example: Combining multiple streams
export class CustomerDetailComponent {
  customer$ = this.route.params.pipe(
    switchMap((params) => this.customerService.getById(params['id'])),
    shareReplay(1),
  );

  orders$ = this.customer$.pipe(
    switchMap((customer) => this.orderService.getByCustomerId(customer.id)),
  );

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private orderService: OrderService,
  ) {}
}
```

### 6. Route Guards

Protect routes with guards:

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// role.guard.ts
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);

    if (authService.hasRole(requiredRole)) {
      return true;
    }

    return false;
  };
};
```

### 7. HTTP Interceptors

Interceptors handle cross-cutting concerns:

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notificationService.error(error.message);
      return throwError(() => error);
    }),
  );
};
```

## 🔄 Data Flow

### Request Flow

```
User Action (Component)
    ↓
Component Method
    ↓
Service Method (Business Logic)
    ↓
API Service (HTTP Request)
    ↓
HTTP Interceptors (Add Auth, etc.)
    ↓
Backend API
    ↓
HTTP Interceptors (Error Handling)
    ↓
API Service (HTTP Response)
    ↓
Service (State Update)
    ↓
Component (UI Update via Observable)
```

### State Management

Using Signals and RxJS for reactive state:

```typescript
export class CustomerService {
  private customersSignal = signal<Customer[]>([]);
  public customers = this.customersSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  addCustomer(customer: Customer): void {
    this.customersSignal.update((current) => [...current, customer]);
  }

  loadCustomers(): Observable<Customer[]> {
    this.loadingSignal.set(true);
    return this.apiService.getAll().pipe(
      tap((customers) => {
        this.customersSignal.set(customers);
        this.loadingSignal.set(false);
      }),
    );
  }
}
```

## 🎨 Component Patterns

### Smart vs Presentational Components

**Smart Components (Pages)**:

- Located in `features/<module>/pages/` folder
- Three standard pages: list, form, details
- Connected to services
- Handle business logic and routing
- Manage state

**Presentational Components**:

- Located in `shared/components/` for reusable components
- Located in `features/<module>/components/` for module-specific tab sections
- Receive data via `input()`
- Emit events via `output()`
- Pure UI components with Tailwind CSS

```typescript
// Smart Component (Page)
@Component({
  selector: 'app-customers-list-page',
  standalone: true,
  imports: [ListContainerComponent],
  templateUrl: './customers-list-page.component.html',
})
export class CustomersListPageComponent {
  protected service = inject(CustomerApplicationService);

  onView(customer: CustomerList): void {
    this.router.navigate(['/customers', customer.id]);
  }
}

// Presentational Component
@Component({
  selector: 'app-customer-general-section',
  standalone: true,
  imports: [FieldComponent],
  templateUrl: './customer-general-section.component.html',
})
export class CustomerGeneralSectionComponent {
  form = input.required<FormGroup>();
  mode = input.required<FormMode>();
}
```

### Page Structure

Each module starts with **three standard page roles** and can add focused routed pages for related datasets:

1. **List Page** - Orchestrates data and navigation with `shared/components/list/list-container` and `list-action-buttons`; row actions are presented through the shared three-dot menu in the stable order `Ver detalle`, `Editar`, `Eliminar` when applicable, followed by module-specific actions
2. **Form Page** - Uses `core/forms/base/base-form` (handles create AND edit)
3. **Details Page** - Uses `shared/components/details/*`; actions are projected into `detail-actions-menu` while the page keeps orchestration and status rules. Because the record is already open, details omit the redundant `Ver detalle` action and prioritize `Editar`, then `Eliminar` when applicable, before module-specific actions

### Components Folder Usage

Create `components/` for reusable feature presentation, including form sections and dialogs. Routable pages coordinate these components and must not define dialog markup or validation flows inline.

```
features/customers/
├── components/
│   ├── customer-general-section/  # Tab 1: General info
│   ├── customer-contact-section/  # Tab 2: Contact details
│   ├── customer-addresses-section/# Tab 3: Addresses
├── pages/
│   ├── customers-list-page/
│   ├── customers-form-page/       # Uses components above
│   └── customers-details-page/
```

Keep business messages in the feature `messages/` folder so pages and components reuse the same toast contracts.

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials
2. AuthService sends request to backend
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. AuthInterceptor adds token to all requests
6. AuthGuard protects routes
7. Token refresh on expiration
```

### Role-Based Access Control (RBAC)

```typescript
export enum UserRole {
  ADMIN = 'admin',
  WORKER = 'worker',
  SALES_REP = 'sales_rep'
}

// Usage in routes
{
  path: 'admin',
  canActivate: [authGuard, roleGuard(UserRole.ADMIN)],
  loadChildren: () => import('./admin/routes')
}
```

## 📱 Responsive Design

- Mobile-first approach
- PrimeNG responsive components
- CSS Grid and Flexbox
- Breakpoint system

```css
/* Breakpoints */
--mobile: 576px --tablet: 768px --desktop: 992px --large: 1200px;
```

## 🔍 Error Handling Strategy

### Global Error Handler

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redirect to login
      } else if (error.status === 403) {
        // Show unauthorized message
      } else if (error.status >= 500) {
        // Show server error message
      }
      return throwError(() => error);
    }),
  );
};
```

## 📊 Performance Optimization

### Strategies

1. **Lazy Loading**: Feature modules loaded on demand
2. **Signals**: Reactive state management with fine-grained reactivity
3. **OnPush Change Detection**: Used in presentational components
4. **TrackBy Functions**: For efficient list rendering with `@for`
5. **Virtual Scrolling**: For large lists (PrimeNG)
6. **Code Splitting**: Automatic with Angular
7. **Tailwind CSS**: Utility-first CSS with JIT compilation
8. **Defer Blocks**: Lazy load heavy components with `@defer`

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent {
  customers = input.required<CustomerList[]>();
}
```

**Template with modern syntax**:

```html
@for (customer of customers(); track customer.id) {
<div class="p-4">{{ customer.name }}</div>
} @defer (on viewport) {
<app-customer-chart />
} @loading {
<p-skeleton />
}
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/)
- [Angular Signals Guide](https://angular.io/guide/signals)
- [RxJS Documentation](https://rxjs.dev/)
- [PrimeNG Components](https://primeng.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)

---

[← Back to Environment Variables](ENVIRONMENT.md) | [Next: Deployment →](DEPLOYMENT.md)
