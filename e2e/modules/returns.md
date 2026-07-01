# Returns (Devoluciones) — Test Plan

> **Module**: Returns
> **Business Module**: `SALES`
> **Routes**: `/returns` (list), `/returns/new`, `/returns/:id`
> **API Base**: `/api/returns`
> **Total Tests**: 28

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### RET-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/returns`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/returns`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Devoluciones" visible. `GET /api/returns` returns 200.

#### RET-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### RET-003 — List displays returns
- **Severity**: HIGH
- **Expected**: Returns table. Columns: Folio, Factura, Cliente, Motivo, Total, Fecha, Status.

#### RET-004 — Status badges
- **Severity**: HIGH
- **Expected**: PENDING = Pendiente, COMPLETED = Completada, REJECTED = Rechazada.

#### RET-005 — Filter by status
- **Severity**: MEDIUM
- **Expected**: API `?status=COMPLETED` → 200.

#### RET-006 — Filter by date range
- **Severity**: MEDIUM
- **Expected**: API filtered.

#### RET-007 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### RET-008 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/returns/new`
- **Expected**: Title "Nueva Devolución". Invoice selector, items table, reason, notes.

#### RET-009 — Create return from invoice
- **Severity**: CRITICAL
- **Steps**:
  1. Select invoice (FAC-2026-0001)
  2. Invoice lines load
  3. Select qty to return (e.g., return 1 of 5)
  4. Select reason (DEFECTIVE, DAMAGED, WRONG_ITEM, etc.)
  5. Select warehouse for returned stock
  6. Submit
- **Expected**: `POST /api/returns` → 201 Created. Folio generated: `DEV-{year}-{seq}`.

#### RET-010 — Return folio format
- **Severity**: MEDIUM
- **Expected**: Format: `DEV-{year}-{sequence:04d}`.

#### RET-011 — Cannot return more than invoiced qty
- **Severity**: HIGH
- **Steps**:
  1. Try to return more than original invoice qty
- **Expected**: Validation error.

#### RET-012 — Cannot return from non-existent invoice
- **Severity**: HIGH
- **Expected**: Invoice not found error.

#### RET-013 — Return reason list
- **Severity**: MEDIUM
- **Expected**: Reasons: DEFECTIVE (Defectuoso), DAMAGED (Dañado), WRONG_ITEM (Producto Incorrecto), CUSTOMER_REQUEST (Solicitud del Cliente), OTHER (Otro).

#### RET-014 — Return notes
- **Severity**: LOW
- **Steps**:
  1. Enter notes
- **Expected**: Notes saved.

---

### DETAILS

#### RET-015 — View return details
- **Severity**: HIGH
- **URL**: `/returns/{id}`
- **Expected**: Shows folio, invoice ref, customer, items returned, reason, status, notes. `GET /api/returns/{id}` → 200.

#### RET-016 — Return status history
- **Severity**: MEDIUM
- **Expected**: Timeline showing created → completed/rejected.

---

### STATUS TRANSITIONS

#### RET-017 — Complete return
- **Severity**: CRITICAL
- **Steps**:
  1. View PENDING return
  2. Click "Completar"
  3. Confirm
- **Expected**: `PUT /api/returns/{id}/complete` → 200. Status = COMPLETED. Stock increased for returned products. Invoice balance adjusted.

#### RET-018 — Reject return
- **Severity**: HIGH
- **Steps**:
  1. Click "Rechazar"
  2. Enter rejection reason
- **Expected**: `PUT /api/returns/{id}/reject` → 200. Status = REJECTED. No stock changes.

#### RET-019 — Reject requires reason
- **Severity**: MEDIUM
- **Expected**: Reason required.

#### RET-020 — Cannot modify completed/rejected return
- **Severity**: HIGH
- **Expected**: Actions disabled.

---

### STOCK EFFECTS

#### RET-021 — Return restores stock
- **Severity**: HIGH
- **Steps**:
  1. Before return: note stock level
  2. Complete return
  3. Check stock
- **Expected**: Stock increased by returned qty. Stock movement logged.

#### RET-022 — Return to specific warehouse
- **Severity**: HIGH
- **Steps**:
  1. Select destination warehouse in return
  2. Complete
- **Expected**: Stock restored to selected warehouse.

---

### INVOICE EFFECTS

#### RET-023 — Return reduces invoice balance
- **Severity**: HIGH
- **Steps**:
  1. Complete return against paid invoice
- **Expected**: Invoice balance reduced. If full return, invoice status adjusted.

#### RET-024 — Full return of paid invoice
- **Severity**: HIGH
- **Steps**:
  1. Return all items from a fully paid invoice
- **Expected**: Invoice status adjusted. Credit note may be generated.

---

### REPORTS

#### RET-025 — Download returns report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button on list
  2. Select filters and mode
- **Expected**: `GET /api/reports/returns/pdf` → 200.

---

### PERMISSIONS & ERRORS

#### RET-026 — 404 for non-existent return
- **Severity**: MEDIUM
- **Expected**: `GET` → 404.

#### RET-027 — 401 handling
- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.

#### RET-028 — OPERATOR can create returns
- **Severity**: HIGH
- **Prerequisites**: operator@parsun.com
- **Expected**: Can create and view returns.
