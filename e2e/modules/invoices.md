# Invoices (Facturas) — Test Plan

> **Module**: Invoices
> **Business Module**: `SALES`
> **Routes**: `/invoices` (list), `/invoices/new`, `/invoices/:id`, `/invoices/:id/edit`
> **API Base**: `/api/invoices`
> **Total Tests**: 48

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### INV-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/invoices`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/invoices`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Facturas" visible. `GET /api/invoices` returns 200.

#### INV-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### INV-003 — List displays invoices
- **Severity**: HIGH
- **Expected**: Invoices loaded. Columns: Número, Cliente, Estado, Tipo Pago, Subtotal, Fecha.

#### INV-004 — Status badges display correctly
- **Severity**: HIGH
- **Expected**: DRAFT = Borrador, PAID = Pagada, PENDING_PAYMENT = Pendiente, PARTIALLY_PAID = Parcial, CANCELLED = Cancelada, FULLY_RETURNED = Totalmente Devuelta.

#### INV-005 — Filter by status
- **Severity**: MEDIUM
- **Steps**:
  1. Filter by "Pagada"
- **Expected**: API `?status=PAID` → 200. Only paid invoices shown.

#### INV-006 — Filter by date range
- **Severity**: MEDIUM
- **Steps**:
  1. Set fromDate and toDate
- **Expected**: API filtered. Invoices in range only.

#### INV-007 — Filter by customer
- **Severity**: MEDIUM
- **Steps**:
  1. Select customer filter
- **Expected**: API `?customerId=...` → 200.

#### INV-008 — Sort by columns
- **Severity**: LOW
- **Steps**:
  1. Click Fecha, Subtotal headers
- **Expected**: Sort toggles asc/desc.

#### INV-009 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### INV-010 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/invoices/new`
- **Expected**: Title "Nueva Factura". Customer picker, product picker, payment type selector (Contado/Crédito).

#### INV-011 — Create CASH invoice with products
- **Severity**: CRITICAL
- **Steps**:
  1. Select customer
  2. Add product (HERR-001 Taladro, qty 1)
  3. Allocate to warehouse
  4. Payment type: Contado
  5. Select payment method
  6. Submit
- **Expected**: `POST /api/invoices` → 201 Created. Invoice number `INV-2026-NNNNN`. Status = PAID (auto-confirmed for CASH).

#### INV-012 — Create CREDIT invoice
- **Severity**: CRITICAL
- **Steps**:
  1. Select customer, add products
  2. Payment type: Crédito
  3. Submit
- **Expected**: `POST` → 201. Status = PENDING_PAYMENT.

#### INV-013 — Invoice number format correct
- **Severity**: MEDIUM
- **Expected**: Format: `INV-{year}-{sequence:05d}`.

#### INV-014 — Subtotal auto-calculated
- **Severity**: HIGH
- **Expected**: Subtotal = sum(lineTotal) for all lines.

#### INV-015 — Cannot create without customer
- **Severity**: HIGH
- **Expected**: Submit disabled.

#### INV-016 — Cannot create without products
- **Severity**: HIGH
- **Expected**: Submit disabled.

#### INV-017 — Cancel create returns to list
- **Severity**: LOW
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/invoices`.

#### INV-018 — Create from Order (convert flow)
- **Severity**: CRITICAL
- **Steps**:
  1. From a CONFIRMED order, click "Facturar"
  2. Fill payment details
- **Expected**: Invoice created. Order marked INVOICED.

---

### DETAILS

#### INV-019 — View invoice details
- **Severity**: HIGH
- **URL**: `/invoices/{id}`
- **Expected**: Shows invoice number, customer, status, payment type, subtotal, lines with product/quantity/price/warehouse allocations, dates, notes. `GET /api/invoices/{id}` → 200.

#### INV-020 — Details shows payment status info
- **Severity**: HIGH
- **Expected**: Paid amount, credit applied, debit applied shown for PENDING_PAYMENT/PARTIALLY_PAID invoices.

#### INV-021 — Details shows returns if any
- **Severity**: MEDIUM
- **Expected**: Returns section visible with return details if returns exist.

#### INV-022 — Action buttons based on status
- **Severity**: HIGH
- **Expected**: DRAFT: Edit, Confirm, Cancel, Delete. PAID: Cancel (returns stock). PENDING_PAYMENT: Cancel (returns stock). CANCELLED: Read-only. Duplicate button for ADMIN always visible.

---

### STATUS TRANSITIONS

#### INV-023 — Confirm CASH invoice (DRAFT → PAID)
- **Severity**: CRITICAL
- **Steps**:
  1. Create DRAFT invoice (CASH)
  2. Click "Confirmar" with payment method
- **Expected**: `PUT /api/invoices/{id}/confirm` → 200. Status = PAID. Stock deducted.

#### INV-024 — Confirm CREDIT invoice (DRAFT → PENDING_PAYMENT)
- **Severity**: CRITICAL
- **Steps**:
  1. Create DRAFT invoice (CREDIT)
  2. Click "Confirmar"
- **Expected**: Status = PENDING_PAYMENT.

#### INV-025 — Cancel DRAFT invoice
- **Severity**: HIGH
- **Steps**:
  1. Cancel DRAFT invoice with reason
- **Expected**: `PUT /api/invoices/{id}/cancel` → 200. Status = CANCELLED. Stock released.

#### INV-026 — Cancel PAID invoice (stock returned)
- **Severity**: HIGH
- **Steps**:
  1. Cancel PAID invoice with reason
- **Expected**: Status = CANCELLED. Stock returned to warehouse. `CANCEL_ENTRY` movement logged.

#### INV-027 — Cancel requires reason
- **Severity**: MEDIUM
- **Expected**: Reason required (1-500 chars).

#### INV-028 — Cannot cancel CANCELLED or FULLY_RETURNED
- **Severity**: HIGH
- **Expected**: Cancel button hidden or 409 error.

#### INV-029 — Duplicate invoice
- **Severity**: HIGH
- **Prerequisites**: ADMIN role
- **Steps**:
  1. Click "Duplicar"
  2. Optionally change customer
- **Expected**: `POST /api/invoices/{id}/duplicate` → 201. New invoice created.

#### INV-030 — OPERATOR cannot duplicate
- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **Expected**: Duplicate button hidden.

---

### EDIT (DRAFT)

#### INV-031 — Edit invoice lines (DRAFT only)
- **Severity**: HIGH
- **Steps**:
  1. Edit a DRAFT invoice: change qty, add/remove lines
- **Expected**: `PUT /api/invoices/{id}` → 200. Lines updated. Subtotal recalculated.

#### INV-032 — Edit payment type
- **Severity**: HIGH
- **Steps**:
  1. Change from CASH to CREDIT
- **Expected**: Updated.

#### INV-033 — Cannot edit non-DRAFT
- **Severity**: HIGH
- **Expected**: Edit button hidden for PAID/PENDING_PAYMENT/CANCELLED.

---

### DELETE

#### INV-034 — Delete DRAFT invoice
- **Severity**: HIGH
- **Steps**:
  1. Click delete on DRAFT invoice
  2. Confirm
- **Expected**: `DELETE /api/invoices/{id}` → 204. Removed.

#### INV-035 — Cannot delete non-DRAFT
- **Severity**: HIGH
- **Expected**: Delete disabled.

#### INV-036 — Cancel delete dialog
- **Severity**: LOW
- **Steps**:
  1. Click delete, Cancelar
- **Expected**: NOT deleted.

---

### CREDIT LIMIT & BALANCE

#### INV-037 — Credit limit validation blocks confirm
- **Severity**: HIGH
- **Steps**:
  1. Create CREDIT invoice exceeding customer's credit limit
  2. Try to confirm
- **Expected**: Warning shown. Password required to override.

#### INV-038 — Use customer balance on CASH invoice
- **Severity**: HIGH
- **Steps**:
  1. Create CASH invoice
  2. Toggle "Usar saldo"
  3. Enter balance amount
- **Expected**: Balance consumed. Remaining amount requires payment method.

---

### PDF REPORTS

#### INV-039 — Download single invoice PDF
- **Severity**: MEDIUM
- **Steps**:
  1. View invoice detail
  2. Click PDF button
- **Expected**: `GET /api/reports/invoices/{id}/pdf` → 200. PDF downloaded.

#### INV-040 — Download invoices report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button
  2. Select filters (date range, status)
  3. Select mode (Simple/Detallado)
  4. Generate
- **Expected**: `GET /api/reports/invoices/pdf` → 200. PDF downloaded.

---

### PERMISSIONS & ERROR HANDLING

#### INV-041 — 404 for non-existent invoice
- **Severity**: MEDIUM
- **URL**: `/invoices/00000000-0000-0000-0000-000000000000`
- **Expected**: `GET` → 404. Error shown.

#### INV-042 — 401 handling
- **Severity**: MEDIUM
- **Steps**:
  1. Clear token
  2. Navigate to `/invoices`
- **Expected**: Redirected to login.

#### INV-043 — OPERATOR can create invoices
- **Severity**: HIGH
- **Prerequisites**: operator@parsun.com
- **Expected**: Can create and manage own invoices. Cannot duplicate.

#### INV-044 — Insufficient stock during confirm — blocked
- **Severity**: HIGH
- **Steps**:
  1. Create invoice with more qty than available
  2. Try to confirm
- **Expected**: Validation error.

#### INV-045 — Invalid status transition returns 409
- **Severity**: MEDIUM
- **Expected**: Confirm CANCELLED → 409.

---

### MOBILE / RESPONSIVE

#### INV-046 — Mobile list view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **Expected**: Cards layout. Filters accessible.

#### INV-047 — Mobile form view
- **Severity**: MEDIUM
- **URL**: `/invoices/new`
- **Expected**: Form stacks. Dialogs usable.

#### INV-048 — Mobile detail view
- **Severity**: MEDIUM
- **URL**: `/invoices/{id}`
- **Expected**: Detail sections stack. Action buttons accessible.
