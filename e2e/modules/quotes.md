# Quotes (Presupuestos) — Test Plan

> **Module**: Quotes
> **Business Module**: `SALES`
> **Routes**: `/quotes` (list), `/quotes/new`, `/quotes/:id`, `/quotes/:id/edit`
> **API Base**: `/api/quotes`
> **Total Tests**: 42

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### QTE-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/quotes`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/quotes`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Presupuestos" visible. `GET /api/quotes` returns 200.

#### QTE-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### QTE-003 — List displays quotes
- **Severity**: HIGH
- **Expected**: Quotes table loaded. Columns: Número, Cliente, Status, Subtotal, Vencimiento, Fecha.

#### QTE-004 — Status badges
- **Severity**: HIGH
- **Expected**: DRAFT = Borrador, CONVERTED_TO_ORDER = Convertido a Pedido, CONVERTED_TO_INVOICE = Convertido a Factura, CANCELLED = Cancelado.

#### QTE-005 — Filter by status
- **Severity**: MEDIUM
- **Steps**:
  1. Filter by "Borrador"
- **Expected**: API `?status=DRAFT` → 200.

#### QTE-006 — Filter by date range
- **Severity**: MEDIUM
- **Steps**:
  1. Set dateFrom/dateTo
- **Expected**: API filtered.

#### QTE-007 — Filter by customer
- **Severity**: MEDIUM
- **Steps**:
  1. Select customer
- **Expected**: API `?customerId=...` → 200.

#### QTE-008 — Sort columns
- **Severity**: LOW
- **Steps**:
  1. Click headers
- **Expected**: Sort works.

#### QTE-009 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### QTE-010 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/quotes/new`
- **Expected**: Title "Nuevo Presupuesto". Customer picker, product picker, items table, notes, expiry date.

#### QTE-011 — Create quote with customer and products
- **Severity**: CRITICAL
- **Steps**:
  1. Select customer via CustomerPickerDialog
  2. Add product (HERR-001 Taladro, qty 2) via ProductPickerDialog
  3. Allocate to warehouse
  4. Set unit price
  5. Submit
- **Expected**: `POST /api/quotes` → 201 Created. Number `PRE-2026-NNNN`. Redirected to detail.

#### QTE-012 — Quote number format
- **Severity**: MEDIUM
- **Expected**: Format: `PRE-{year}-{sequence:04d}`.

#### QTE-013 — Subtotal auto-calculated
- **Severity**: HIGH
- **Expected**: Subtotal = sum(lineTotal).

#### QTE-014 — Expiry date field works
- **Severity**: MEDIUM
- **Steps**:
  1. Set expiry date to 30 days from now
- **Expected**: Expiry date saved.

#### QTE-015 — Cannot create without customer
- **Severity**: HIGH
- **Expected**: Submit disabled.

#### QTE-016 — Cannot create without products
- **Severity**: HIGH
- **Expected**: Submit disabled.

#### QTE-017 — Cancel create returns to list
- **Severity**: LOW
- **Expected**: Cancel returns to `/quotes`.

#### QTE-018 — Quote does NOT reserve stock
- **Severity**: MEDIUM
- **Expected**: Creating a quote does not change stock quantities. Stock is only affected on convert-to-order/invoice.

---

### DETAILS

#### QTE-019 — View quote details
- **Severity**: HIGH
- **URL**: `/quotes/{id}`
- **Expected**: Shows number, customer, status, expiry, notes, subtotal, lines table, dates. `GET /api/quotes/{id}` → 200.

#### QTE-020 — Details shows warehouse stock
- **Severity**: MEDIUM
- **Expected**: Each line shows warehouse stock availability.

#### QTE-021 — Action buttons based on status
- **Severity**: HIGH
- **Expected**: DRAFT: Edit, Convert to Order, Convert to Invoice, Cancel. CONVERTED: Read-only. CANCELLED: Read-only.

---

### STATUS TRANSITIONS

#### QTE-022 — Convert DRAFT quote to Order
- **Severity**: CRITICAL
- **Steps**:
  1. Create DRAFT quote
  2. Click "Convertir a Pedido"
  3. Confirm conversion dialog
- **Expected**: `POST /api/quotes/{id}/convert-to-order` → 201. Order created in CONFIRMED status. Quote status = CONVERTED_TO_ORDER. Stock deducted.

#### QTE-023 — Convert DRAFT quote to Invoice
- **Severity**: CRITICAL
- **Steps**:
  1. Create DRAFT quote
  2. Click "Convertir a Factura"
  3. Select payment type (CASH/CREDIT)
  4. Select payment method
  5. Confirm
- **Expected**: `POST /api/quotes/{id}/convert-to-invoice` → 201. Invoice created. Quote converted.

#### QTE-024 — Insufficient stock blocks conversion
- **Severity**: HIGH
- **Steps**:
  1. Create quote with more qty than available stock
  2. Try to convert
- **Expected**: Dialog shows stock warning. Conversion blocked.

#### QTE-025 — Cancel DRAFT quote
- **Severity**: HIGH
- **Steps**:
  1. Cancel quote with reason
- **Expected**: `PUT /api/quotes/{id}/cancel` → 200. Status = CANCELLED. No stock effect (quotes don't reserve).

#### QTE-026 — Cancel requires reason
- **Severity**: MEDIUM
- **Expected**: Reason required.

#### QTE-027 — Cannot convert already converted/cancelled quote
- **Severity**: HIGH
- **Expected**: Convert buttons hidden for non-DRAFT.

---

### EDIT (DRAFT)

#### QTE-028 — Edit quote lines and notes
- **Severity**: HIGH
- **Steps**:
  1. Edit DRAFT quote: change qty, add lines, update notes
  2. Submit
- **Expected**: `PUT /api/quotes/{id}` → 200. Updated. Subtotal recalculated.

#### QTE-029 — Edit expiry date
- **Severity**: LOW
- **Steps**:
  1. Change expiry date
- **Expected**: Updated.

#### QTE-030 — Cannot edit non-DRAFT
- **Severity**: HIGH
- **Expected**: Edit disabled for converted/cancelled.

---

### DELETE

#### QTE-031 — Delete DRAFT quote
- **Severity**: HIGH
- **Steps**:
  1. Delete DRAFT quote
- **Expected**: `DELETE /api/quotes/{id}` → 204.

#### QTE-032 — Cannot delete non-DRAFT
- **Severity**: HIGH
- **Expected**: Delete disabled.

---

### PRODUCT & CUSTOMER PICKERS

#### QTE-033 — Product picker opens and filters
- **Severity**: MEDIUM
- **Steps**:
  1. Click "Agregar Producto"
- **Expected**: Dialog opens. Search works. Category filter works. Customer-specific price shown.

#### QTE-034 — Customer picker opens
- **Severity**: MEDIUM
- **Steps**:
  1. Click customer selector
- **Expected**: Customer picker dialog with search and type filter.

#### QTE-035 — Warehouse picker for quote
- **Severity**: MEDIUM
- **Steps**:
  1. Set customer
  2. Add product and allocate
- **Expected**: Warehouse list filtered by customer's warehouse access.

---

### PDF REPORTS

#### QTE-036 — Download single quote PDF
- **Severity**: MEDIUM
- **URL**: `/quotes/{id}`
- **Steps**:
  1. Click PDF button
- **Expected**: `GET /api/reports/quotes/{id}/pdf` → 200.

#### QTE-037 — Download quotes report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button on list
  2. Select filters and mode
- **Expected**: `GET /api/reports/quotes/pdf` → 200.

---

### PERMISSIONS & ERROR HANDLING

#### QTE-038 — 404 for non-existent quote
- **Severity**: MEDIUM
- **URL**: `/quotes/00000000-0000-0000-0000-000000000000`
- **Expected**: `GET` → 404.

#### QTE-039 — 401 handling
- **Severity**: MEDIUM
- **Steps**:
  1. Clear token
- **Expected**: Redirected to login.

#### QTE-040 — OPERATOR can manage quotes
- **Severity**: HIGH
- **Prerequisites**: operator@parsun.com
- **Expected**: Can create, edit, convert DRAFT quotes. Same permissions as ADMIN for quotes.

---

### MOBILE / RESPONSIVE

#### QTE-041 — Mobile list view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **Expected**: Cards layout.

#### QTE-042 — Mobile form view
- **Severity**: MEDIUM
- **URL**: `/quotes/new`
- **Expected**: Form stacks. Dialogs accessible.
