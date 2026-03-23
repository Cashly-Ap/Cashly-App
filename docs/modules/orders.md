# Orders Module

## Overview

The Orders module manages sales orders (pedidos) in the invoicing system. Orders can be created by Users or Merchants, and can optionally have a merchant associated for commission tracking. Orders serve as the basis for invoice generation.

**Key Concepts**:
- **Customer Required**: Every order MUST have a customer associated
- **Merchant Optional**: Orders MAY have a merchant associated (for commission tracking)
- **No Validation Required**: Orders do not require validation workflow
- **Delivery Date**: Orders must specify a delivery date
- **Invoice Conversion**: Orders can be converted to invoices

**Module Type**: `CRUD` with special actions (cancel, convert to invoice)

---

## Who Can Create Orders

| Role | Can Create Orders | Merchant Association |
|------|-------------------|---------------------|
| USER | Yes | Optional (can assign any merchant) |
| MERCHANT | Yes | Automatic (self-assigned) |
| ADMIN | Yes | Optional (can assign any merchant) |

**Important**:
- When a **MERCHANT** creates an order, they are automatically associated as the merchant
- When a **USER/ADMIN** creates an order, they can optionally assign a merchant
- Orders without merchant = no commission charged
- Orders with merchant = commission charged when invoice is paid

---

## Role-Based Endpoint Usage

| Endpoint | USER/ADMIN | MERCHANT |
|----------|-----------|---------|
| `GET /api/orders` | Returns ALL orders | Returns ONLY own orders (filtered automatically by backend) |
| `GET /api/orders/:id` | Any order | Only own orders (403 if not owner) |
| `POST /api/orders` | With optional merchantId | merchantId ignored, auto-assigned |
| `PUT /api/orders/:id` | Any PENDING order | Only own PENDING orders |
| `PUT /api/orders/:id/cancel` | Any PENDING order | Only own PENDING orders |
| `POST /api/orders/:id/convert-to-invoice` | Any PENDING order | **NOT ALLOWED** (403) |

**Key rule for MERCHANT**: The same `GET /api/orders` endpoint is used for all roles. The backend automatically filters results based on the authenticated user's role — no extra query parameters needed.

---

## Order Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ORDER LIFECYCLE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  USER / MERCHANT                    ADMIN / USER                    SYSTEM
        │                                 │                              │
        │  1. Crea pedido                │                              │
        │     (con cliente)              │                              │
        ▼                                │                              │
   ┌─────────┐                           │                              │
   │ PEDIDO  │                           │                              │
   │ PENDING │                           │                              │
   └────┬────┘                           │                              │
        │                                │                              │
        │  (puede cancelar               │                              │
        │   mientras PENDING)            │                              │
        │                                │                              │
        └───────────────────────────────►│  2. Convierte a factura     │
                                         │     (boton)                  │
                                         ▼                              │
                                   ┌───────────┐                        │
                                   │  FACTURA  │                        │
                                   │  EMITIDA  │ ──────────────────────►│
                                   └───────────┘                        │
                                         │                              │
                                         │  3. Cliente paga             │
                                         │     la factura               │
                                         ▼                              │
                                   ┌───────────┐                        │
                                   │  FACTURA  │    Si tiene merchant:  │
                                   │  PAGADA   │ ──comision generada───►│
                                   └───────────┘                        │
                                                                        │
                                                        (solo si order tiene merchant)
```

---

## Module Structure

```
src/app/features/orders/
├── components/
│   ├── order-general-section/
│   │   ├── order-general-section.component.ts
│   │   ├── order-general-section.component.html
│   │   └── order-general-section.component.spec.ts
│   ├── order-lines-section/
│   │   ├── order-lines-section.component.ts
│   │   ├── order-lines-section.component.html
│   │   └── order-lines-section.component.spec.ts
│   ├── order-cancel-dialog/
│   │   ├── order-cancel-dialog.component.ts
│   │   ├── order-cancel-dialog.component.html
│   │   └── order-cancel-dialog.component.spec.ts
│   └── index.ts
├── models/
│   ├── interfaces/
│   │   ├── order-list.interface.ts
│   │   ├── order-details.interface.ts
│   │   ├── order-edit.interface.ts
│   │   ├── order-create.interface.ts
│   │   ├── order-line.interface.ts
│   │   ├── order-cancel.interface.ts
│   │   ├── convert-to-invoice.interface.ts
│   │   └── index.ts
│   ├── enums/
│   │   ├── order-status.enum.ts
│   │   ├── creator-type.enum.ts
│   │   └── index.ts
│   └── index.ts
├── pages/
│   ├── orders-list-page/
│   │   ├── orders-list-page.component.ts
│   │   ├── orders-list-page.component.html
│   │   └── orders-list-page.component.spec.ts
│   ├── orders-form-page/
│   │   ├── orders-form-page.component.ts
│   │   ├── orders-form-page.component.html
│   │   ├── orders-form-page.component.spec.ts
│   │   └── orders-form-page.config.ts
│   ├── orders-details-page/
│   │   ├── orders-details-page.component.ts
│   │   ├── orders-details-page.component.html
│   │   └── orders-details-page.component.spec.ts
│   └── index.ts
├── services/
│   ├── api/
│   │   ├── order-api.service.ts
│   │   ├── order-api.service.spec.ts
│   │   └── index.ts
│   ├── application/
│   │   ├── order-application.service.ts
│   │   ├── order-application.service.spec.ts
│   │   └── index.ts
│   ├── mappers/
│   │   ├── order.mapper.ts
│   │   ├── order.mapper.spec.ts
│   │   └── index.ts
│   └── index.ts
├── validators/
│   ├── order.validators.ts
│   ├── order.validators.spec.ts
│   └── index.ts
├── messages/
│   ├── error-messages.ts
│   ├── success-messages.ts
│   └── index.ts
├── router/
│   ├── order.routes.ts
│   └── index.ts
└── index.ts
```

---

## Features

- Order creation with customer and optional merchant association
- Order line management (products, quantities, prices)
- Delivery date scheduling (today or future)
- Order cancellation with reason
- Convert order to invoice (USER/ADMIN only)
- Auto-generated sequential order numbers (ORD-2025-00001)
- Product snapshots at order creation (name, code, price)
- Role-based access control (Merchants see only their orders)
- Subtotal calculation from order lines

---

## Pages

### List Page

**Route**: `/orders`

**Component**: `OrdersListPageComponent`

**Purpose**: Displays all orders in a searchable, sortable table.

**Features**:
- PrimeNG DataTable with sorting and filtering
- Search by order number, customer name
- Filter by status (PENDING, INVOICED, CANCELLED)
- Filter by customer, merchant, date range
- Pagination
- Action buttons (View, Edit, Cancel, Convert to Invoice)
- Add new order button
- Status badges with colors

**Access**:
- USER/ADMIN: View all orders
- MERCHANT: View only own orders

### Form Page

**Route**: `/orders/new` (Create) | `/orders/:id/edit` (Edit)

**Component**: `OrdersFormPageComponent`

**Purpose**: Create new order or edit existing one.

**Features**:
- Tab-based layout (General, Lines)
- Customer selection (required)
- Merchant selection (optional, hidden for MERCHANT role)
- Delivery date picker (today or future)
- Dynamic order lines management
- Product search/selection
- Quantity and price inputs
- Real-time subtotal calculation
- Pending changes guard

**Access**:
- All roles can create
- Edit only PENDING orders
- MERCHANT can only edit own orders

### Details Page

**Route**: `/orders/:id`

**Component**: `OrdersDetailsPageComponent`

**Purpose**: Display complete order information in read-only mode.

**Features**:
- Complete order data display
- Customer information section
- Merchant information (if assigned)
- Order lines table with totals
- Status indicator
- Cancellation info (if cancelled)
- Invoice link (if invoiced)
- Action buttons: Edit, Cancel, Convert to Invoice

**Access**:
- USER/ADMIN: View all orders
- MERCHANT: View only own orders

---

## Data Models

### Interfaces

#### OrderList

**Usage**: List page table rows (GET /api/orders)

**Purpose**: Minimal data for table display.

```typescript
export interface OrderList {
  id: string;                    // UUID identifier
  orderNumber: string;           // ORD-2025-00001
  customerId: string;            // Customer UUID
  customerName: string;          // Customer name
  merchantId: string | null;     // Merchant UUID (null if no merchant)
  merchantName: string | null;   // Merchant name (null if no merchant)
  status: OrderStatus;           // PENDING, INVOICED, CANCELLED
  deliveryDate: string;          // ISO date string (date only)
  subtotal: number;              // Order subtotal
  lineCount: number;             // Number of order lines
  invoiceId: string | null;      // Invoice UUID (null if not invoiced)
  createdAt: string;             // ISO datetime string
}
```

**API Mapping**: Maps directly from `OrderListResponse`

---

#### OrderDetails

**Usage**: Details page display (GET /api/orders/:id)

**Purpose**: Complete order data for viewing.

```typescript
export interface OrderLineDetails {
  id: string;                    // Order line UUID
  productId: string;             // Product UUID
  productName: string;           // Product name snapshot
  productCode: string;           // Product code snapshot
  quantity: number;              // Quantity ordered
  unitPrice: number;             // Price per unit
  lineTotal: number;             // Line total (qty x price)
}

export interface OrderDetails {
  id: string;                    // UUID identifier
  orderNumber: string;           // ORD-2025-00001
  customerId: string;            // Customer UUID
  customerName: string;          // Customer name
  customerRif: string;           // Customer RIF
  merchantId: string | null;     // Merchant UUID
  merchantName: string | null;   // Merchant name
  merchantCommission: number | null; // Merchant commission %
  createdBy: string;             // Creator UUID
  createdByName: string;         // Creator name
  createdByType: CreatorType;    // USER or MERCHANT
  status: OrderStatus;           // PENDING, INVOICED, CANCELLED
  deliveryDate: string;          // ISO date string
  notes: string | null;          // Order notes
  subtotal: number;              // Order subtotal
  invoiceId: string | null;      // Invoice UUID
  invoiceNumber: string | null;  // Invoice number
  cancelledAt: string | null;    // Cancellation timestamp
  cancelledReason: string | null; // Cancellation reason
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
  lines: OrderLineDetails[];     // Order line items
}
```

**API Mapping**: Maps from `OrderDetailResponse`

---

#### OrderEdit

**Usage**: Edit form data (derived from GET /api/orders/:id)

**Purpose**: Form data for editing existing order.

```typescript
export interface OrderLineEdit {
  productId: string;             // Product UUID
  quantity: number;              // Quantity
  unitPrice: number;             // Price per unit
}

export interface OrderEdit {
  deliveryDate: string;          // ISO date string
  notes: string | null;          // Order notes
  lines: OrderLineEdit[];        // Replaces all lines
}
```

**API Mapping**: Maps to `UpdateOrderRequest` for PUT request

**Note**: `customerId` and `merchantId` cannot be changed after creation.

---

#### OrderCreate

**Usage**: Create form submission (POST /api/orders)

**Purpose**: New order creation data.

```typescript
export interface OrderLineCreate {
  productId: string;             // Product UUID
  quantity: number;              // Quantity (> 0)
  unitPrice: number;             // Price per unit (>= 0)
}

export interface OrderCreate {
  customerId: string;            // Required, customer UUID
  merchantId: string | null;     // Optional, ignored for MERCHANT role
  deliveryDate: string;          // Required, today or future
  notes: string | null;          // Optional, max 1000 chars
  lines: OrderLineCreate[];      // At least 1 required
}
```

**API Mapping**: Maps directly to `CreateOrderRequest`

---

#### OrderCancel

**Usage**: Cancel order submission (PUT /api/orders/:id/cancel)

```typescript
export interface OrderCancelRequest {
  reason: string;                // Required, max 500 chars
}

export interface OrderCancelResponse extends OrderDetails {
  // Same as OrderDetails with updated status and cancellation info
}
```

---

#### ConvertToInvoice

**Usage**: Convert order to invoice response (POST /api/orders/:id/convert-to-invoice)

```typescript
export interface ConvertToInvoiceResponse {
  orderId: string;               // Order UUID
  orderNumber: string;           // Order number
  orderStatus: OrderStatus;      // INVOICED
  invoiceId: string;             // Generated invoice UUID
  invoiceNumber: string;         // Generated invoice number
  hasMerchant: boolean;          // If order had merchant
  merchantId: string | null;     // Merchant UUID
  merchantName: string | null;   // Merchant name
  merchantCommission: number | null; // Commission percentage
}
```

---

### Enums

#### OrderStatus

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',           // Created, awaiting conversion to invoice
  INVOICED = 'INVOICED',         // Converted to invoice
  CANCELLED = 'CANCELLED',       // Cancelled by user/merchant
}

export interface OrderStatusOption {
  label: string;
  value: OrderStatus;
}

export const ORDER_STATUSES: readonly OrderStatusOption[] = [
  { label: 'Pendiente', value: OrderStatus.PENDING },
  { label: 'Facturado', value: OrderStatus.INVOICED },
  { label: 'Cancelado', value: OrderStatus.CANCELLED },
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.INVOICED]: 'Facturado',
  [OrderStatus.CANCELLED]: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.INVOICED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] || 'info';
}
```

---

#### CreatorType

```typescript
export enum CreatorType {
  USER = 'USER',                 // Created by a system user (ADMIN/USER role)
  MERCHANT = 'MERCHANT',         // Created by a merchant
}

export const CREATOR_TYPE_LABELS: Record<CreatorType, string> = {
  [CreatorType.USER]: 'Usuario',
  [CreatorType.MERCHANT]: 'Comercial',
};

export function getCreatorTypeLabel(type: CreatorType): string {
  return CREATOR_TYPE_LABELS[type] || type;
}
```

---

## API Endpoints

### Backend Base URL

All endpoints use: `/api/orders`

### Interface Mapping Summary

| HTTP Method | Endpoint | Request Interface | Response Interface | Frontend Usage |
|-------------|----------|-------------------|-------------------|----------------|
| GET | /api/orders | - | `OrderList[]` | List page |
| GET | /api/orders/:id | - | `OrderDetails` | Details/Edit page |
| POST | /api/orders | `OrderCreate` | `OrderDetails` | Create form |
| PUT | /api/orders/:id | `OrderEdit` | `OrderDetails` | Edit form |
| PUT | /api/orders/:id/cancel | `OrderCancelRequest` | `OrderDetails` | Cancel action |
| POST | /api/orders/:id/convert-to-invoice | - | `ConvertToInvoiceResponse` | Convert action |

---

### GET /api/orders

**Purpose**: List all orders (filtered by role automatically)

**Frontend Interface**: `OrderList[]`

**Roles**:
- USER/ADMIN: Returns all orders in the system
- MERCHANT: Returns **only own orders** — backend filters automatically by authenticated merchant, no extra params needed

**Query Parameters** (optional):
- `customerId` (UUID): Filter by customer
- `merchantId` (UUID): Filter by merchant (**ignored for MERCHANT role** — backend enforces own filter)
- `status` (string): Filter by status (PENDING, INVOICED, CANCELLED)
- `fromDate` (date): Filter from delivery date
- `toDate` (date): Filter to delivery date
- `page` (int): Page number (default: 0)
- `size` (int): Page size (default: 20)

**Frontend note**: The MERCHANT role uses the **exact same endpoint and same API service call** as USER/ADMIN. No role-switching logic needed on the frontend — the backend handles the filtering transparently.

**Example Response**:
```json
[
  {
    "id": "order-001-uuid",
    "orderNumber": "ORD-2025-00001",
    "customerId": "customer-uuid-here",
    "customerName": "ABC Company S.A.",
    "merchantId": "merchant-uuid-here",
    "merchantName": "Juan Perez",
    "status": "PENDING",
    "deliveryDate": "2025-01-15",
    "subtotal": 1275.00,
    "lineCount": 2,
    "invoiceId": null,
    "createdAt": "2025-12-30T10:30:00"
  }
]
```

---

### GET /api/orders/:id

**Purpose**: Get order by ID

**Frontend Interface**: `OrderDetails`

**Roles**:
- USER/ADMIN: View any order
- MERCHANT: View only own orders

**Example Response**:
```json
{
  "id": "order-001-uuid",
  "orderNumber": "ORD-2025-00001",
  "customerId": "customer-uuid-here",
  "customerName": "ABC Company S.A.",
  "customerRif": "J-12345678-9",
  "merchantId": "merchant-uuid-here",
  "merchantName": "Juan Perez",
  "merchantCommission": 15.00,
  "createdBy": "user-uuid-here",
  "createdByName": "Admin User",
  "createdByType": "USER",
  "status": "PENDING",
  "deliveryDate": "2025-01-15",
  "notes": "Entrega en horario de oficina",
  "subtotal": 1275.00,
  "invoiceId": null,
  "invoiceNumber": null,
  "cancelledAt": null,
  "cancelledReason": null,
  "createdAt": "2025-12-30T10:30:00",
  "updatedAt": "2025-12-30T10:30:00",
  "lines": [
    {
      "id": "line-001-uuid",
      "productId": "product-001-uuid",
      "productName": "Producto A",
      "productCode": "PRD-00001",
      "quantity": 10,
      "unitPrice": 100.00,
      "lineTotal": 1000.00
    },
    {
      "id": "line-002-uuid",
      "productId": "product-002-uuid",
      "productName": "Producto B",
      "productCode": "PRD-00002",
      "quantity": 5.5,
      "unitPrice": 50.00,
      "lineTotal": 275.00
    }
  ]
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Merchant trying to access another merchant's order
- `404 Not Found`: Order not found

---

### POST /api/orders

**Purpose**: Create new order

**Frontend Interface**: `OrderCreate` (request), `OrderDetails` (response)

**Roles**: USER, ADMIN, MERCHANT

**Notes on merchantId**:
- **USER/ADMIN**: Can send `merchantId` (optional) or omit it (null)
- **MERCHANT**: The `merchantId` field is **ignored** - system automatically assigns the authenticated merchant

**Example Request**:
```json
{
  "customerId": "customer-uuid-here",
  "merchantId": "merchant-uuid-here",
  "deliveryDate": "2025-01-15",
  "notes": "Entrega en horario de oficina",
  "lines": [
    {
      "productId": "product-001-uuid",
      "quantity": 10,
      "unitPrice": 100.00
    },
    {
      "productId": "product-002-uuid",
      "quantity": 5.5,
      "unitPrice": 50.00
    }
  ]
}
```

**Example Response**: Same as GET /:id

**Errors**:
- `400 Bad Request`: Invalid request data or validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Customer or product not found
- `422 Unprocessable Entity`: Delivery date is in the past

---

### PUT /api/orders/:id

**Purpose**: Update existing order

**Frontend Interface**: `OrderEdit` (request), `OrderDetails` (response)

**Roles**:
- USER/ADMIN: Can update any PENDING order
- MERCHANT: Can only update own PENDING orders

**Example Request**:
```json
{
  "deliveryDate": "2025-01-20",
  "notes": "Nueva nota actualizada",
  "lines": [
    {
      "productId": "product-001-uuid",
      "quantity": 15,
      "unitPrice": 100.00
    }
  ]
}
```

**Note**: `customerId` and `merchantId` cannot be changed after creation. Lines are replaced completely.

**Errors**:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Merchant trying to update another's order
- `404 Not Found`: Order not found
- `409 Conflict`: Cannot update order (not in PENDING status)

---

### PUT /api/orders/:id/cancel

**Purpose**: Cancel a pending order

**Frontend Interface**: `OrderCancelRequest` (request), `OrderDetails` (response)

**Roles**:
- USER/ADMIN: Can cancel any PENDING order
- MERCHANT: Can only cancel own PENDING orders

**Example Request**:
```json
{
  "reason": "Cliente solicito cancelacion"
}
```

**Example Response**:
```json
{
  "id": "order-001-uuid",
  "orderNumber": "ORD-2025-00001",
  "status": "CANCELLED",
  "cancelledAt": "2025-12-30T11:00:00",
  "cancelledReason": "Cliente solicito cancelacion",
  ...
}
```

**Errors**:
- `400 Bad Request`: Reason is required
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Merchant trying to cancel another's order
- `404 Not Found`: Order not found
- `409 Conflict`: Cannot cancel order (not in PENDING status)

---

### POST /api/orders/:id/convert-to-invoice

**Purpose**: Convert pending order to invoice

**Frontend Interface**: `ConvertToInvoiceResponse`

**Roles**: USER, ADMIN only (MERCHANTS cannot convert orders)

**Request Body**: None

**Example Response**:
```json
{
  "orderId": "order-001-uuid",
  "orderNumber": "ORD-2025-00001",
  "orderStatus": "INVOICED",
  "invoiceId": "invoice-001-uuid",
  "invoiceNumber": "INV-2025-00001",
  "hasMerchant": true,
  "merchantId": "merchant-uuid",
  "merchantName": "Juan Perez",
  "merchantCommission": 15.00
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: MERCHANT role cannot convert orders
- `404 Not Found`: Order not found
- `409 Conflict`: Order is not in PENDING status
- `422 Unprocessable Entity`: Insufficient stock for products

**Business Logic**:
1. Validates order is in PENDING status
2. Validates stock availability for all products
3. Creates invoice from order data
4. Links order to invoice (sets invoiceId)
5. Updates order status to INVOICED
6. Decrements stock for each product
7. **If order has merchant**: When invoice is paid, commission charge is generated

---

## Validation Rules

### Field Validations

| Field | Type | Required | Rules | Error Message |
|-------|------|----------|-------|---------------|
| `customerId` | UUID | Yes | Must exist | "El cliente es requerido" |
| `merchantId` | UUID | No | Must exist if provided | "Comercial no encontrado" |
| `deliveryDate` | date | Yes | Today or future | "La fecha de entrega debe ser hoy o futura" |
| `notes` | string | No | Max 1000 chars | "Las notas deben tener maximo 1000 caracteres" |
| `lines` | array | Yes | At least 1 line | "Se requiere al menos una linea de pedido" |
| `productId` | UUID | Yes | Must exist | "El producto es requerido" |
| `quantity` | number | Yes | > 0 | "La cantidad debe ser mayor a cero" |
| `unitPrice` | number | Yes | >= 0 | "El precio debe ser mayor o igual a cero" |
| `cancelReason` | string | Yes | Max 500 chars | "El motivo es requerido" |

### Custom Validators

```typescript
// validators/order.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class OrderValidators {
  static deliveryDateFutureOrToday(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        return { pastDate: 'La fecha de entrega debe ser hoy o futura' };
      }
      
      return null;
    };
  }

  static minOrderLines(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !Array.isArray(control.value)) {
        return { minLines: `Se requiere al menos ${min} linea(s)` };
      }
      
      if (control.value.length < min) {
        return { minLines: `Se requiere al menos ${min} linea(s)` };
      }
      
      return null;
    };
  }

  static positiveQuantity(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;
      
      if (control.value <= 0) {
        return { invalidQuantity: 'La cantidad debe ser mayor a cero' };
      }
      
      return null;
    };
  }

  static nonNegativePrice(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined) return null;
      
      if (control.value < 0) {
        return { invalidPrice: 'El precio debe ser mayor o igual a cero' };
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
- **Component**: `order-general-section`
- **Fields**: customerId (dropdown), merchantId (dropdown, optional), deliveryDate (calendar), notes (textarea)

#### Tab 2: Order Lines
- **Component**: `order-lines-section`
- **Fields**: lines[] (product selector, quantity, unitPrice, lineTotal)

### Form Model

```typescript
interface OrderFormModel {
  // Tab 1: General
  id?: string;
  orderNumber?: string;
  customerId: string;
  customerName?: string;         // Display only
  merchantId: string | null;
  merchantName?: string | null;  // Display only
  deliveryDate: Date;
  notes: string | null;
  
  // Tab 2: Lines
  lines: OrderLineFormModel[];
  
  // Calculated
  subtotal?: number;
}

interface OrderLineFormModel {
  productId: string;
  productCode?: string;          // Display only
  productName?: string;          // Display only
  quantity: number;
  unitPrice: number;
  lineTotal?: number;            // Calculated: quantity * unitPrice
}
```

---

## Service Architecture

### API Service (Infrastructure Layer)

**File**: `services/api/order-api.service.ts`

**Purpose**: Raw HTTP communication with backend

```typescript
@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  getAll(params?: OrderFilterParams): Observable<OrderList[]> {
    return this.http.get<OrderList[]>(this.baseUrl, { params: this.toHttpParams(params) });
  }

  getById(id: string): Observable<OrderDetails> {
    return this.http.get<OrderDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: OrderCreate): Observable<OrderDetails> {
    return this.http.post<OrderDetails>(this.baseUrl, data);
  }

  update(id: string, data: OrderEdit): Observable<OrderDetails> {
    return this.http.put<OrderDetails>(`${this.baseUrl}/${id}`, data);
  }

  cancel(id: string, request: OrderCancelRequest): Observable<OrderDetails> {
    return this.http.put<OrderDetails>(`${this.baseUrl}/${id}/cancel`, request);
  }

  convertToInvoice(id: string): Observable<ConvertToInvoiceResponse> {
    return this.http.post<ConvertToInvoiceResponse>(`${this.baseUrl}/${id}/convert-to-invoice`, {});
  }

  private toHttpParams(params?: OrderFilterParams): HttpParams {
    let httpParams = new HttpParams();
    if (params?.customerId) httpParams = httpParams.set('customerId', params.customerId);
    if (params?.merchantId) httpParams = httpParams.set('merchantId', params.merchantId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.fromDate) httpParams = httpParams.set('fromDate', params.fromDate);
    if (params?.toDate) httpParams = httpParams.set('toDate', params.toDate);
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    return httpParams;
  }
}

interface OrderFilterParams {
  customerId?: string;
  merchantId?: string;
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}
```

---

### Application Service (Application Layer)

**File**: `services/application/order-application.service.ts`

**Purpose**: Business logic, state management, error handling

```typescript
@Injectable({ providedIn: 'root' })
export class OrderApplicationService {
  private readonly api = inject(OrderApiService);
  private readonly mapper = inject(OrderMapper);

  // State signals
  readonly orders = signal<OrderList[]>([]);
  readonly currentOrder = signal<OrderDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadAll(params?: OrderFilterParams): Observable<OrderList[]> {
    this.loading.set(true);
    return this.api.getAll(params).pipe(
      tap(orders => this.orders.set(orders)),
      finalize(() => this.loading.set(false))
    );
  }

  loadById(id: string): Observable<OrderDetails> {
    this.loading.set(true);
    return this.api.getById(id).pipe(
      tap(order => this.currentOrder.set(order)),
      finalize(() => this.loading.set(false))
    );
  }

  create(data: OrderCreate): Observable<OrderDetails> {
    this.loading.set(true);
    return this.api.create(data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  update(id: string, data: OrderEdit): Observable<OrderDetails> {
    this.loading.set(true);
    return this.api.update(id, data).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  cancel(id: string, reason: string): Observable<OrderDetails> {
    this.loading.set(true);
    return this.api.cancel(id, { reason }).pipe(
      tap(order => this.currentOrder.set(order)),
      finalize(() => this.loading.set(false))
    );
  }

  convertToInvoice(id: string): Observable<ConvertToInvoiceResponse> {
    this.loading.set(true);
    return this.api.convertToInvoice(id).pipe(
      finalize(() => this.loading.set(false))
    );
  }

  clearCurrentOrder(): void {
    this.currentOrder.set(null);
  }

  canEdit(order: OrderDetails | OrderList): boolean {
    return order.status === OrderStatus.PENDING;
  }

  canCancel(order: OrderDetails | OrderList): boolean {
    return order.status === OrderStatus.PENDING;
  }

  canConvertToInvoice(order: OrderDetails | OrderList): boolean {
    return order.status === OrderStatus.PENDING;
  }
}
```

---

### Mapper Service

**File**: `services/mappers/order.mapper.ts`

**Purpose**: Transform data between API and frontend formats

```typescript
@Injectable({ providedIn: 'root' })
export class OrderMapper {
  toFormModel(details: OrderDetails): OrderFormModel {
    return {
      id: details.id,
      orderNumber: details.orderNumber,
      customerId: details.customerId,
      customerName: details.customerName,
      merchantId: details.merchantId,
      merchantName: details.merchantName,
      deliveryDate: new Date(details.deliveryDate),
      notes: details.notes,
      lines: details.lines.map(line => ({
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
      })),
      subtotal: details.subtotal,
    };
  }

  toCreateRequest(form: OrderFormModel): OrderCreate {
    return {
      customerId: form.customerId,
      merchantId: form.merchantId,
      deliveryDate: this.formatDate(form.deliveryDate),
      notes: form.notes,
      lines: form.lines.map(line => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    };
  }

  toUpdateRequest(form: OrderFormModel): OrderEdit {
    return {
      deliveryDate: this.formatDate(form.deliveryDate),
      notes: form.notes,
      lines: form.lines.map(line => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
```

---

## Business Rules

### Order Creation

1. Customer is REQUIRED for all orders
2. Merchant is OPTIONAL for USER/ADMIN created orders
3. When MERCHANT creates order, they are automatically assigned as merchantId
4. Delivery date must be today or in the future
5. At least one order line is required
6. Product snapshots (name, code) are captured at creation time
7. Subtotal is automatically calculated from lines
8. Order number is auto-generated (ORD-YYYY-NNNNN)

### Order Lifecycle

1. Orders start with status PENDING
2. Only PENDING orders can be updated
3. Only PENDING orders can be cancelled
4. Only PENDING orders can be converted to invoices
5. Cancelled orders cannot be modified

### Order Status Transitions

```
PENDING ──┬──► INVOICED (via convert-to-invoice)
          │
          └──► CANCELLED (via cancel)
```

### Access Control

1. USER/ADMIN can view all orders
2. USER/ADMIN can update/cancel any PENDING order
3. USER/ADMIN can convert any PENDING order to invoice
4. MERCHANT can only view their own orders — **backend filters `GET /api/orders` automatically**
5. MERCHANT can only update/cancel their own PENDING orders
6. **MERCHANT cannot convert orders to invoices**
7. Frontend does NOT need to pass `merchantId` as a filter for MERCHANT role — the backend identifies the authenticated user and applies the filter server-side

### Commission Rules

1. Commission only applies if order has a merchant associated
2. **Commission is NOT calculated on the order**
3. Commission is charged when the **invoice is paid**
4. Commission = Invoice Total x (Merchant Commission % / 100)
5. Orders without merchant = no commission charged

### Update Pattern (Replace All Lines)

When updating an order:
- Backend **replaces ALL** order lines
- Frontend must send complete arrays with ALL desired lines
- Backend deletes old lines and creates new ones

---

## Routes Configuration

```typescript
// router/order.routes.ts
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/pending-tabs';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/orders-list-page/orders-list-page.component')
        .then(m => m.OrdersListPageComponent),
    title: 'Pedidos',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/orders-form-page/orders-form-page.component')
        .then(m => m.OrdersFormPageComponent),
    title: 'Nuevo Pedido',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/orders-details-page/orders-details-page.component')
        .then(m => m.OrdersDetailsPageComponent),
    title: 'Detalles del Pedido',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/orders-form-page/orders-form-page.component')
        .then(m => m.OrdersFormPageComponent),
    title: 'Editar Pedido',
    canDeactivate: [pendingChangesGuard],
  },
];
```

---

## Component Examples

### Order Lines Section Component

```typescript
@Component({
  selector: 'app-order-lines-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    AutoCompleteModule,
  ],
  templateUrl: './order-lines-section.component.html',
})
export class OrderLinesSectionComponent {
  private readonly productService = inject(ProductApplicationService);
  
  @Input({ required: true }) formArray!: FormArray;
  @Input() readonly = false;

  products = this.productService.products;
  filteredProducts = signal<ProductList[]>([]);

  addLine(): void {
    const lineGroup = new FormGroup({
      productId: new FormControl('', Validators.required),
      productName: new FormControl({ value: '', disabled: true }),
      productCode: new FormControl({ value: '', disabled: true }),
      quantity: new FormControl(1, [Validators.required, Validators.min(0.001)]),
      unitPrice: new FormControl(0, [Validators.required, Validators.min(0)]),
    });
    
    this.formArray.push(lineGroup);
  }

  removeLine(index: number): void {
    this.formArray.removeAt(index);
  }

  onProductSelect(event: any, index: number): void {
    const product = event.value;
    const group = this.formArray.at(index) as FormGroup;
    group.patchValue({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      unitPrice: product.salePrice,
    });
  }

  calculateLineTotal(index: number): number {
    const group = this.formArray.at(index) as FormGroup;
    const quantity = group.get('quantity')?.value || 0;
    const unitPrice = group.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  calculateSubtotal(): number {
    return this.formArray.controls.reduce((sum, control) => {
      const group = control as FormGroup;
      const quantity = group.get('quantity')?.value || 0;
      const unitPrice = group.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);
  }

  searchProducts(event: { query: string }): void {
    const query = event.query.toLowerCase();
    this.filteredProducts.set(
      this.products().filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
      )
    );
  }
}
```

### Cancel Dialog Component

```typescript
@Component({
  selector: 'app-order-cancel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextareaModule,
  ],
  template: `
    <p-dialog
      header="Cancelar Pedido"
      [visible]="visible"
      (visibleChange)="visibleChange.emit($event)"
      [modal]="true"
      [style]="{ width: '450px' }"
    >
      <div class="p-fluid">
        <div class="field">
          <label for="reason">Motivo de cancelacion *</label>
          <textarea
            id="reason"
            pInputTextarea
            [formControl]="reasonControl"
            rows="4"
            placeholder="Ingrese el motivo de la cancelacion"
          ></textarea>
          @if (reasonControl.invalid && reasonControl.touched) {
            <small class="p-error">El motivo es requerido</small>
          }
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          [text]="true"
          (onClick)="onClose()"
        />
        <p-button
          label="Confirmar Cancelacion"
          severity="danger"
          [disabled]="reasonControl.invalid"
          (onClick)="onConfirm()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class OrderCancelDialogComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<string>();

  reasonControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(500),
  ]);

  onClose(): void {
    this.reasonControl.reset();
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    if (this.reasonControl.valid) {
      this.confirm.emit(this.reasonControl.value!);
      this.onClose();
    }
  }
}
```

---

## Testing Requirements

### Unit Tests

- [ ] Delivery date validator tested
- [ ] Min order lines validator tested
- [ ] Positive quantity validator tested
- [ ] Non-negative price validator tested
- [ ] Mapper transformations tested
- [ ] API service HTTP calls mocked
- [ ] Application service state management tested
- [ ] canEdit, canCancel, canConvertToInvoice logic tested

### Component Tests

- [ ] List page renders correctly with status badges
- [ ] List page filters work correctly
- [ ] Form page validates correctly
- [ ] Form page shows/hides merchant field based on role
- [ ] Order lines section adds/removes lines correctly
- [ ] Subtotal calculation works correctly
- [ ] Details page displays data correctly
- [ ] Cancel dialog validates and emits correctly
- [ ] Navigation works correctly

### Integration Tests

- [ ] Full create order workflow tested
- [ ] Full update order workflow tested
- [ ] Cancel order workflow tested
- [ ] Convert to invoice workflow tested
- [ ] Role-based access control tested
- [ ] Error handling tested
- [ ] Loading states tested

---

## Related Modules

- [Auth Module](./auth.md) - Authentication and role-based access
- [Customers Module](./customers.md) - Orders require a customer
- [Merchants Module](./merchants.md) - Orders can have optional merchant
- [Products Module](./products.md) - Order lines reference products
- [Warehouses Module](./warehouses.md) - Stock validated on convert to invoice

---

## Notes

### Important Considerations

1. **Order Lines Management**: Backend uses "Replace All" strategy. Frontend must always send complete arrays when updating.
2. **Product Snapshots**: Product name, code, and price are captured at order creation time and stored in order lines.
3. **Merchant Assignment**: For MERCHANT role, merchantId is automatically set and cannot be changed.
4. **Status Restrictions**: Most actions (edit, cancel, convert) only available for PENDING orders.
5. **Commission Flow**: Commission is NOT on orders - it's applied when invoice is paid.
6. **Stock Validation**: Occurs only when converting to invoice, not when creating order.

### Common Patterns

- Use signals for state management in services
- Use mapper service for data transformation
- Separate API (infrastructure) from application logic
- Use PrimeNG components for UI consistency
- Use TabView for form sections
- Real-time subtotal calculation in form
- Status badges with semantic colors
- Confirmation dialog for destructive actions

### UI/UX Recommendations

1. **Customer Selection**: Use searchable dropdown with customer name and RIF
2. **Merchant Selection**: Hide for MERCHANT role, show for USER/ADMIN with clear "opcional" label
3. **Product Selection**: Use autocomplete with product code and name
4. **Delivery Date**: Default to tomorrow, highlight today option
5. **Status Display**: Use colored badges (yellow=pending, green=invoiced, red=cancelled)
6. **Action Buttons**: Disable based on status and permissions

---

**Last Updated**: 2025-12-30

**Module Status**: [ ] Planned | [ ] In Development | [ ] Implemented
