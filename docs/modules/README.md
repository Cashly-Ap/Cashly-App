# Lexand Frontend Modules

This directory contains documentation for all frontend modules in the Lexand application.

---

## Module Index

| Module                              | Type         | Status      | Description                                                                |
| ----------------------------------- | ------------ | ----------- | -------------------------------------------------------------------------- |
| [Auth](./auth.md)                   | Auth         | Implemented | Authentication, JWT tokens, and user profile management                    |
| [Dashboard](./dashboard.md)         | Display-only | Implemented | Business metrics, charts, and analytics overview                           |
| [Customers](./customers.md)         | CRUD         | Implemented | Customer management with contacts and addresses                            |
| [Products](./products.md)           | CRUD         | Implemented | Product catalog with simple/composite types and compositions               |
| [Differentials](./differentials.md) | CRUD         | Implemented | Price percentage adjustments (surcharges/discounts)                        |
| [Warehouses](./warehouses.md)       | CRUD         | Implemented | Warehouse management with stock operations                                 |
| [Merchants](./merchants.md)         | CRUD         | Implemented | Merchant management with commission tracking                               |
| [Orders](./orders.md)               | CRUD         | Implemented | Order management with line items and status workflow                       |
| [Invoices](./invoices.md)           | CRUD         | Implemented | Invoice management with payments and due dates                             |
| [Collections](./collections.md)     | Display-only | Implemented | Commission records (auto-generated from invoice payments)                  |
| [Receivables](./receivables.md)     | Special      | Implemented | Customer debt management and payment registration with validation workflow |
| [Payables](./payables.md)           | Special      | Implemented | Merchant commission payments tracking and settlement                       |
| [Notifications](./notifications.md) | Display-only | Implemented | In-app notifications system with role-based routing                        |
| [Cash Register](./cash-register.md) | Special | Implemented | Session-based opening, movements, closing, and history |
| [Credit Notes](./credit-notes.md) | CRUD | Implemented | Customer credit adjustments |
| [Debit Notes](./debit-notes.md) | CRUD | Implemented | Customer debit adjustments |
| [Payment Methods](./payment-methods.md) | CRUD | Implemented | Available payment instruments |
| [Payments](./payments.md) | Special | Implemented | Payment administration and detail views |
| [Price Types](./price-types.md) | CRUD | Implemented | Product price classifications |
| [Purchases](./purchases.md) | Special | Implemented | Supplier purchases and stock confirmation |
| [Quotes](./quotes.md) | Special | Implemented | Quote allocation and conversion |
| [Returns](./returns.md) | Special | Implemented | Customer returns and stock effects |
| [Suppliers](./suppliers.md) | CRUD | Implemented | Supplier management |

---

## Module Types

### CRUD Modules

Standard modules with Create, Read, Update, Delete operations. They follow the full module structure with:

- **List Page**: Table view with filtering, sorting, and pagination
- **Form Page**: Create/Edit forms with validation
- **Details Page**: Read-only view with complete entity data
- **Services**: API (infrastructure) + Application (business logic) + Mappers
- **Validators**: Custom form validators

**Examples**: Customers, Products, Warehouse

### Display-only Modules

Modules that only display data without modification capabilities. Typically used for dashboards, reports, and auto-generated records.

**Examples**: Dashboard, Collections, Notifications

### Special Modules

Modules with specialized workflows that don't fit standard CRUD patterns. They may have unique operations like payment registration, validation workflows, or settlement operations.

**Examples**: Receivables (debt management + payment validation), Payables (commission settlement)

### Auth Modules

Special modules handling authentication and authorization.

**Examples**: Auth

---

## Module Structure

All CRUD modules follow this standard structure:

```
src/app/features/[module-name]/
├── components/               # Reusable UI components (tabs/sections)
│   └── [entity]-[section]-section/
├── models/                   # Interfaces, types, and enums
│   ├── interfaces/
│   └── enums/
├── pages/                    # Route components (smart components)
│   ├── [module]-list-page/
│   ├── [module]-form-page/
│   └── [module]-details-page/
├── services/
│   ├── api/                  # HTTP services (infrastructure layer)
│   ├── application/          # Business logic services
│   └── mappers/              # Data transformation
├── validators/               # Custom form validators
├── router/                   # Module routes
└── index.ts                  # Public API exports
```

---

## Documentation Schema

Each module documentation includes:

1. **Overview** - Purpose and module type
2. **Module Structure** - Folder organization
3. **Features** - Main functionality list
4. **Pages** - Routes and page descriptions
5. **Data Models** - All interfaces and enums
6. **API Endpoints** - Complete API documentation with interface mapping
7. **Validation Rules** - Field validation table
8. **Form Structure** - Tab organization (if applicable)
9. **Service Architecture** - API + Application services
10. **Business Rules** - Important logic and constraints
11. **Routes Configuration** - Angular route definitions
12. **Testing Requirements** - Test coverage checklist
13. **Related Modules** - Dependencies and relationships
14. **Notes** - Important considerations and patterns

---

## Implemented Modules

### Auth Module

**Status**: Implemented

**Features**:

- User login with email and password
- JWT access token management
- Refresh token automatic renewal
- Change username/password functionality
- Route guards for protected routes
- HTTP interceptor for automatic token injection

**Key Files**:

- `src/app/features/auth/services/auth.service.ts`
- `src/app/features/auth/guards/auth.guard.ts`
- `src/app/features/auth/interceptors/auth.interceptor.ts`

[View Full Documentation](./auth.md)

---

### Dashboard Module

**Status**: Implemented (with mock data)

**Features**:

- Sales metrics cards
- Monthly sales trend chart
- Category distribution chart
- Revenue analytics
- Recent orders table
- Top products table

**Key Files**:

- `src/app/features/dashboard/pages/dashboard-page.component.ts`

[View Full Documentation](./dashboard.md)

---

### Customers Module

**Status**: Implemented

**Features**:

- Customer CRUD operations
- Multiple emails, phones, and addresses
- Credit management (days and limit)
- Customer type classification
- RIF validation (Venezuelan tax ID)
- Billing address designation

**Key Files**:

- `src/app/features/customers/services/api/customer-api.service.ts`
- `src/app/features/customers/services/application/customer-application.service.ts`
- `src/app/features/customers/validators/customer.validators.ts`

[View Full Documentation](./customers.md)

---

## Planned Modules

### Products Module

**Status**: Planned | [Full Documentation](./products.md)

**Description**: Product catalog management with simple and composite product types, unit of measure support, and composition tracking.

**Key Features**:

- Product CRUD operations (Simple and Composite types)
- Unit of measure management
- Composite product compositions
- SKU and barcode support
- Base price management

**Key Interfaces**: `ProductList`, `ProductDetail`, `ProductEdit`, `ProductCreate`, `ProductComposition`

---

### Differentials Module

**Status**: Planned | [Full Documentation](./differentials.md)

**Description**: Price percentage adjustments for surcharges or discounts that can be applied to orders.

**Key Features**:

- Differential CRUD operations
- Percentage-based pricing
- Active/Inactive status
- Surcharge and discount support

**Key Interfaces**: `DifferentialList`, `DifferentialDetail`, `DifferentialEdit`, `DifferentialCreate`

---

### Warehouses Module

**Status**: Planned | [Full Documentation](./warehouses.md)

**Description**: Warehouse management with stock operations including entry, exit, and transfer.

**Key Features**:

- Warehouse CRUD operations
- Stock entry/exit operations
- Inter-warehouse transfers
- Stock level tracking
- Transaction history

**Key Interfaces**: `WarehouseList`, `WarehouseDetail`, `WarehouseEdit`, `StockEntry`, `StockExit`, `StockTransfer`

---

### Collections Module

**Status**: Planned | [Full Documentation](./collections.md)

**Description**: Display commission records (cobranzas) automatically generated when payments are registered on invoices with merchants.

**Key Features**:

- View collection list with filtering and pagination
- View collection details
- Merchant collection summaries with aggregated data
- Role-based access (MERCHANT sees only their own)
- No create/edit/delete (read-only module)

**Key Interfaces**: `CollectionList`, `CollectionDetails`, `CollectionSummary`, `DailyCollectionSummary`

---

### Receivables Module

**Status**: Implemented | [Full Documentation](./receivables.md)

**Description**: Customer-centric view of outstanding debts with payment registration, proof-of-payment upload, and validation workflow. MERCHANT payments require USER/ADMIN approval. Single-page architecture with tabs and dialogs.

**Key Features**:

- Global debt summary across all customers (USER/ADMIN)
- Customer-specific debt details with invoice breakdown (via dialog)
- Register payments for single invoices, all debt, or partial amount
- Proof-of-payment file upload required for MERCHANT payments
- Payment validation workflow (PENDING_APPROVAL → APPROVED/REJECTED)
- Approve or reject pending payments (USER/ADMIN only)
- Merchant self-view: see own registered payments and their status
- Rejected payments tab with rejection reason display

**Key Interfaces**: `GlobalDebtSummary`, `CustomerDebtList`, `CustomerDebtSummary`, `CustomerInvoiceDebt`, `PendingPayment`, `PaymentResult`, `BulkPaymentResult`, `InvoiceDetail`

---

### Payables Module

**Status**: Planned | [Full Documentation](./payables.md)

**Description**: Merchant commission payments tracking. Auto-generated when payments are approved. Provides settlement operations for paying merchants their commissions.

**Key Features**:

- Global payables summary across all merchants
- Merchant-specific payable details
- Settlement operations: single, multiple, or all pending
- Settlement method tracking (TRANSFER, CASH, CHECK)
- Merchant self-service view (MERCHANT sees only their own)
- Role-based access (USER/ADMIN can settle, MERCHANT view-only)

**Key Interfaces**: `GlobalPayablesSummary`, `MerchantPayablesList`, `MerchantPayablesSummary`, `PayableList`, `PayableDetail`, `SettlementResult`

---

### Notifications Module

**Status**: Planned | [Full Documentation](./notifications.md)

**Description**: In-app notifications system with role-based routing. Notifications are auto-generated by domain events.

**Key Features**:

- View all notifications for authenticated user
- Unread notifications count badge
- Mark single or all notifications as read
- Delete notifications
- Filter by read/unread status and notification type
- Navigate to related entity from notification
- Automatic polling for new notifications

**Key Interfaces**: `NotificationList`, `NotificationDetail`, `UnreadCount`

---

## Creating New Modules

When creating a new module, use the [TEMPLATE.md](./TEMPLATE.md) as a starting point:

1. Copy `TEMPLATE.md` to `[module-name].md`
2. Replace all placeholders:
   - `[MODULE_NAME]` with the module name (PascalCase)
   - `[module-name]` with the route name (kebab-case)
   - `[Entity]` with the main entity name
   - `[entities]` with the plural API path
3. Fill in all sections based on actual implementation
4. Verify against backend API documentation
5. Update this README to include the new module

---

## Backend API Documentation

For backend API details, refer to the backend documentation at:
`/Users/gabrielvargas/work/Clients/Lexand/Lexand-Api/docs/modules/`

---

## Related Documentation

- [Architecture](../ARCHITECTURE.md) - Overall application architecture
- [Getting Started](../GETTING_STARTED.md) - Development setup guide
- [Testing](../TESTING.md) - Testing guidelines
- [Environment](../ENVIRONMENT.md) - Environment configuration

---

**Last Updated**: 2026-03-12

---

## Documentation Coverage

| Backend Module   | Frontend Doc                           | Status                      |
| ---------------- | -------------------------------------- | --------------------------- |
| AUTH.md          | [auth.md](./auth.md)                   | ✅ Complete                 |
| CUSTOMERS.md     | [customers.md](./customers.md)         | ✅ Complete                 |
| PRODUCTS.md      | [products.md](./products.md)           | ✅ Complete                 |
| DIFFERENTIAL.md  | [differentials.md](./differentials.md) | ✅ Complete                 |
| WAREHOUSE.md     | [warehouses.md](./warehouses.md)       | ✅ Complete                 |
| MERCHANTS.md     | [merchants.md](./merchants.md)         | ✅ Complete                 |
| ORDERS.md        | [orders.md](./orders.md)               | ✅ Complete                 |
| INVOICES.md      | [invoices.md](./invoices.md)           | ✅ Complete                 |
| COLLECTIONS.md   | [collections.md](./collections.md)     | ✅ Complete                 |
| RECEIVABLES.md   | [receivables.md](./receivables.md)     | ✅ Complete                 |
| PAYABLES.md      | [payables.md](./payables.md)           | ✅ Complete                 |
| NOTIFICATIONS.md | [notifications.md](./notifications.md) | ✅ Complete                 |
| -                | [dashboard.md](./dashboard.md)         | ✅ Complete (Frontend-only) |
