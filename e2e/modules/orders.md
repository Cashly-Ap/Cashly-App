# Orders (Pedidos) — Test Plan

> **Module**: Orders
> **Business Module**: `SALES`
> **Routes**: `/orders` (list), `/orders/new`, `/orders/:id`, `/orders/:id/edit`
> **API Base**: `/api/orders`
> **Total Tests**: 50

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### ORD-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/orders`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/orders`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Pedidos" visible. `GET /api/orders` returns 200.

#### ORD-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### ORD-003 — List displays orders from API
- **Severity**: HIGH
- **Expected**: Orders table loaded. Columns: Número, Cliente, Estado, Subtotal, Líneas, Fecha.

#### ORD-004 — Status badges display correctly
- **Severity**: HIGH
- **Expected**: DRAFT = "Borrador" (grey), CONFIRMED = "Confirmado" (blue), CANCELLED = "Cancelado" (red), INVOICED = "Facturado" (green).

#### ORD-005 — Filter by status
- **Severity**: MEDIUM
- **Steps**:
  1. Filter by "Confirmado"
- **Expected**: Only confirmed orders shown. API `?status=CONFIRMED` → 200.

#### ORD-006 — Filter by date range
- **Severity**: MEDIUM
- **Steps**:
  1. Set date range
- **Expected**: API `?fromDate=...&toDate=...` → 200. Orders in range only.

#### ORD-007 — Filter by customer
- **Severity**: MEDIUM
- **Steps**:
  1. Select a customer filter
- **Expected**: API `?customerId=...` → 200.

#### ORD-008 — Search by order number
- **Severity**: MEDIUM
- **Steps**:
  1. Search "ORD-2026"
- **Expected**: Matching orders shown.

#### ORD-009 — Sort columns
- **Severity**: LOW
- **Steps**:
  1. Click column headers (Fecha, Subtotal, etc.)
- **Expected**: Sort toggles asc/desc.

#### ORD-010 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator shows correct page counts.

---

### CREATE

#### ORD-011 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/orders/new`
- **Expected**: Title "Nuevo Pedido". Customer picker button. Product picker button. Items table. Notes field.

#### ORD-012 — Create order with customer and products
- **Severity**: CRITICAL
- **Steps**:
  1. Select customer via CustomerPickerDialog
  2. Add products via ProductPickerDialog (select HERR-001 Taladro, qty 2)
  3. Allocate to warehouse (Caracas)
  4. Set unit prices
  5. Submit
- **Expected**: `POST /api/orders` → 201 Created. Order number `ORD-2026-NNNNN` assigned. Redirected to detail.

#### ORD-013 — Order number format is correct
- **Severity**: MEDIUM
- **Expected**: Number format: `ORD-{year}-{sequence:05d}`.

#### ORD-014 — Order subtotal auto-calculated
- **Severity**: HIGH
- **Steps**:
  1. Add products with prices
- **Expected**: Subtotal = sum of (qty * unitPrice) for all lines.

#### ORD-015 — Cannot create order without customer
- **Severity**: HIGH
- **Expected**: Submit disabled until customer selected.

#### ORD-016 — Cannot create order without products
- **Severity**: HIGH
- **Expected**: Submit disabled until at least one product line added.

#### ORD-017 — Cancel create returns to list
- **Severity**: LOW
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/orders`. No order created.

#### ORD-018 — Warehouse allocation required
- **Severity**: HIGH
- **Expected**: Each product line must have warehouse allocation before submit.

#### ORD-019 — Create multiple line order
- **Severity**: HIGH
- **Steps**:
  1. Add Taladro (qty 2) + Aceite Motor (qty 5)
- **Expected**: Both lines saved. Subtotal calculated correctly.

---

### DETAILS

#### ORD-020 — View order details
- **Severity**: HIGH
- **URL**: `/orders/{id}`
- **Expected**: Shows order number, customer info, created by, status, notes, subtotal, lines table with product/quantity/price/line total/warehouse allocations, dates. `GET /api/orders/{id}` → 200.

#### ORD-021 — Details shows stock per warehouse
- **Severity**: HIGH
- **Expected**: Each line shows warehouse allocations with available stock.

#### ORD-022 — Details shows action buttons based on status
- **Severity**: HIGH
- **Expected**: DRAFT: Edit, Confirm, Cancel, Delete visible. CONFIRMED: Cancel, Convert-to-Invoice visible. INVOICED: Read-only. CANCELLED: Read-only.

---

### STATUS TRANSITIONS

#### ORD-023 — Confirm order (DRAFT → CONFIRMED)
- **Severity**: CRITICAL
- **Steps**:
  1. Create a DRAFT order
  2. Click "Confirmar"
- **Expected**: `PUT /api/orders/{id}/confirm` → 200. Status changes to CONFIRMED. Stock deducted (reserved moves to actual exit). Toast success.

#### ORD-024 — Cancel DRAFT order
- **Severity**: HIGH
- **Steps**:
  1. Create a DRAFT order
  2. Click "Cancelar" with reason
- **Expected**: `PUT /api/orders/{id}/cancel` → 200. Status CANCELLED. Stock reservations released.

#### ORD-025 — Cancel CONFIRMED order
- **Severity**: HIGH
- **Steps**:
  1. Confirm an order
  2. Cancel with reason
- **Expected**: Status CANCELLED. Stock returned to inventory. `CANCEL_ENTRY` movement logged.

#### ORD-026 — Cancel requires reason
- **Severity**: MEDIUM
- **Steps**:
  1. Click "Cancelar" without reason
- **Expected**: Validation error. Reason required (1-500 chars).

#### ORD-027 — Convert confirmed order to invoice
- **Severity**: CRITICAL
- **Steps**:
  1. Confirm an order
  2. Click "Facturar"
  3. Select payment type (CASH/CREDIT) and payment method
  4. Submit
- **Expected**: `POST /api/orders/{id}/convert-to-invoice` → 200. Status changes to INVOICED. Invoice created. Toast success.

#### ORD-028 — Cannot convert OPERATOR order to invoice
- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **Steps**:
  1. Confirm an order
  2. Try to convert to invoice
- **Expected**: 403 Forbidden. OPERATOR cannot convert to invoice.

#### ORD-029 — Cannot edit CONFIRMED order
- **Severity**: HIGH
- **Steps**:
  1. Try to edit a CONFIRMED order
- **Expected**: Edit button hidden or disabled.

#### ORD-030 — Cannot delete CONFIRMED order
- **Severity**: HIGH
- **Steps**:
  1. Try to delete a CONFIRMED order
- **Expected**: Delete button hidden.

#### ORD-031 — Cannot confirm already confirmed order
- **Severity**: MEDIUM
- **Expected**: Confirm button disabled/hidden after CONFIRMED.

---

### EDIT (DRAFT)

#### ORD-032 — Edit order lines
- **Severity**: HIGH
- **Steps**:
  1. Edit a DRAFT order: add a new line, change quantity
  2. Submit
- **Expected**: `PUT /api/orders/{id}` → 200. Lines updated. Warehouse allocations recalculated. Subtotal recalculated.

#### ORD-033 — Edit notes
- **Severity**: LOW
- **Steps**:
  1. Change notes field
- **Expected**: Notes updated on submit.

---

### PRODUCT PICKER

#### ORD-034 — Product picker opens
- **Severity**: MEDIUM
- **Steps**:
  1. Click "Agregar Producto"
- **Expected**: Product picker dialog opens. Shows paginated product list with search, category filter.

#### ORD-035 — Product picker search works
- **Severity**: MEDIUM
- **Steps**:
  1. Search "taladro"
- **Expected**: Filtered results.

#### ORD-036 — Product picker shows stock per warehouse
- **Severity**: MEDIUM
- **Expected**: Each product shows total stock and per-warehouse breakdown.

#### ORD-037 — Product picker shows customer price
- **Severity**: MEDIUM
- **Expected**: Price column shows customer-specific price based on price type.

#### ORD-038 — Customer picker opens and searches
- **Severity**: MEDIUM
- **Steps**:
  1. Click "Seleccionar Cliente"
- **Expected**: Customer picker dialog with search and type filter.

---

### DELETE

#### ORD-039 — Delete DRAFT order
- **Severity**: HIGH
- **Steps**:
  1. Click delete on a DRAFT order
  2. Confirm
- **Expected**: `DELETE /api/orders/{id}` → 204. Order removed. Reservations released.

#### ORD-040 — Cannot delete non-DRAFT order
- **Severity**: HIGH
- **Steps**:
  1. Try to delete CONFIRMED order
- **Expected**: Delete disabled or 400 error.

#### ORD-041 — Cancel delete dialog
- **Severity**: LOW
- **Steps**:
  1. Click delete, then Cancelar
- **Expected**: Order NOT deleted.

---

### PDF REPORT

#### ORD-042 — Download single order PDF
- **Severity**: MEDIUM
- **Steps**:
  1. View order detail
  2. Click "Descargar PDF"
- **Expected**: `GET /api/reports/orders/{id}/pdf` → 200. PDF generated and downloaded/opened.

#### ORD-043 — Download orders report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button on list
  2. Select filters (date range, status)
  3. Select mode (Simple/Detallado)
  4. Click generar
- **Expected**: `GET /api/reports/orders/pdf` → 200. PDF downloaded.

---

### PERMISSIONS & ERROR HANDLING

#### ORD-044 — 404 for non-existent order
- **Severity**: MEDIUM
- **URL**: `/orders/00000000-0000-0000-0000-000000000000`
- **Expected**: `GET` → 404. Error shown.

#### ORD-045 — 401 handling
- **Severity**: MEDIUM
- **Steps**:
  1. Clear token
  2. Navigate to `/orders/draft`
- **Expected**: Redirected to login.

#### ORD-046 — OPERATOR can create orders
- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **Expected**: Can create, edit DRAFT, confirm, cancel orders. Cannot convert to invoice.

#### ORD-047 — Insufficient stock during confirm — blocked
- **Severity**: HIGH
- **Steps**:
  1. Create order with more quantity than available stock
  2. Try to confirm
- **Expected**: Validation error. Insufficient stock message.

#### ORD-048 — Invalid status transition returns 409
- **Severity**: MEDIUM
- **Steps**:
  1. Try to confirm a CANCELLED order
- **Expected**: 409 Conflict. Proper error message.

---

### MOBILE / RESPONSIVE

#### ORD-049 — Mobile list view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **Expected**: Table converts to cards. Filters accessible.

#### ORD-050 — Mobile form view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/orders/new`
- **Expected**: Form stacks vertically. Dialogs usable.
