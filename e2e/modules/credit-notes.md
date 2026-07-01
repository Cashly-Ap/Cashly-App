# Credit Notes (Notas de Crédito) — Test Plan

> **Module**: Credit Notes
> **Business Module**: `SALES`
> **Routes**: `/credit-notes` (list), `/credit-notes/new`, `/credit-notes/:id`
> **API Base**: `/api/credit-notes`
> **Total Tests**: 24

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### CN-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/credit-notes`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/credit-notes`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Notas de Crédito" visible. `GET /api/credit-notes` returns 200.

#### CN-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### CN-003 — List displays credit notes
- **Severity**: HIGH
- **Expected**: Table loaded. Columns: Folio, Factura, Cliente, Motivo, Subtotal, Fecha, Status.

#### CN-004 — Status badges
- **Severity**: HIGH
- **Expected**: ACTIVE = Activa, APPLIED = Aplicada, VOIDED = Anulada.

#### CN-005 — Filter by status
- **Severity**: MEDIUM
- **Expected**: API `?status=ACTIVE` → 200.

#### CN-006 — Filter by date range
- **Severity**: MEDIUM
- **Expected**: API filtered.

#### CN-007 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### CN-008 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/credit-notes/new`
- **Expected**: Title "Nueva Nota de Crédito". Invoice selector, reason selector, items, amounts.

#### CN-009 — Create credit note from return
- **Severity**: CRITICAL
- **Steps**:
  1. Select invoice (FAC-2026-0001)
  2. Invoice lines load
  3. Select items and amounts
  4. Select reason (RETURN, DISCOUNT, ADJUSTMENT, OTHER)
  5. Submit
- **Expected**: `POST /api/credit-notes` → 201. Folio `NC-{year}-{seq}`.

#### CN-010 — NC folio format
- **Severity**: MEDIUM
- **Expected**: Format: `NC-{year}-{sequence:04d}`.

#### CN-011 — Credit note amount cannot exceed invoice total
- **Severity**: HIGH
- **Expected**: Validation error.

#### CN-012 — Create credit note without return (direct discount)
- **Severity**: HIGH
- **Steps**:
  1. Select invoice
  2. Apply discount amount
  3. Submit
- **Expected**: Credit note created with reason DISCOUNT. No return/stock effect.

#### CN-013 — Cancel create
- **Severity**: LOW
- **Expected**: Returns to list.

---

### DETAILS

#### CN-014 — View credit note details
- **Severity**: HIGH
- **URL**: `/credit-notes/{id}`
- **Expected**: Shows folio, invoice ref, customer, reason, amounts, status. `GET /api/credit-notes/{id}` → 200.

---

### STATUS TRANSITIONS

#### CN-015 — Apply credit note to invoice
- **Severity**: CRITICAL
- **Steps**:
  1. View ACTIVE credit note
  2. Click "Aplicar"
  3. Confirm
- **Expected**: `PUT /api/credit-notes/{id}/apply` → 200. Status = APPLIED. Invoice balance reduced.

#### CN-016 — Void credit note
- **Severity**: HIGH
- **Steps**:
  1. Click "Anular"
  2. Enter reason
- **Expected**: `PUT /api/credit-notes/{id}/void` → 200. Status = VOIDED.

#### CN-017 — Cannot void APPLIED credit note
- **Severity**: HIGH
- **Expected**: Void disabled for APPLIED status.

#### CN-018 — Void requires reason
- **Severity**: MEDIUM
- **Expected**: Reason prompt.

---

### FINANCIAL EFFECTS

#### CN-019 — Applied credit note reduces customer balance
- **Severity**: HIGH
- **Steps**:
  1. Apply credit note
- **Expected**: Customer's outstanding balance reduced.

#### CN-020 — Full invoice cancellation via credit note
- **Severity**: HIGH
- **Steps**:
  1. Create credit note for full invoice amount
  2. Apply
- **Expected**: Invoice status updated.

---

### REPORTS

#### CN-021 — Download credit notes report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button on list
  2. Select filters and mode
- **Expected**: `GET /api/reports/credit-notes/pdf` → 200.

---

### PERMISSIONS & ERRORS

#### CN-022 — 404 for non-existent credit note
- **Severity**: MEDIUM
- **Expected**: `GET` → 404.

#### CN-023 — 401 handling
- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.

#### CN-024 — Only ADMIN/SUPERVISOR can void credit notes
- **Severity**: HIGH
- **Prerequisites**: operator@parsun.com
- **Expected**: OPERATOR cannot void credit notes.
