# Debit Notes (Notas de Débito) — Test Plan

> **Module**: Debit Notes
> **Business Module**: `SALES`
> **Routes**: `/debit-notes` (list), `/debit-notes/new`, `/debit-notes/:id`
> **API Base**: `/api/debit-notes`
> **Total Tests**: 20

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### DN-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/debit-notes`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/debit-notes`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Notas de Débito" visible. `GET /api/debit-notes` returns 200.

#### DN-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### DN-003 — List displays debit notes
- **Severity**: HIGH
- **Expected**: Table loaded. Columns: Folio, Factura, Cliente, Motivo, Subtotal, Fecha, Status.

#### DN-004 — Status badges
- **Severity**: HIGH
- **Expected**: ACTIVE = Activa, APPLIED = Aplicada, VOIDED = Anulada.

#### DN-005 — Filter by status
- **Severity**: MEDIUM
- **Expected**: API `?status=ACTIVE` → 200.

#### DN-006 — Filter by date range
- **Severity**: MEDIUM
- **Expected**: API filtered.

#### DN-007 — Pagination works
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### DN-008 — Navigate to create form
- **Severity**: HIGH
- **URL**: `/debit-notes/new`
- **Expected**: Title "Nueva Nota de Débito". Invoice selector, items, amounts.

#### DN-009 — Create debit note for additional charges
- **Severity**: CRITICAL
- **Steps**:
  1. Select invoice
  2. Enter additional charge amount
  3. Select reason (INTEREST, ADDITIONAL_CHARGE, ADJUSTMENT, OTHER)
  4. Submit
- **Expected**: `POST /api/debit-notes` → 201. Folio `ND-{year}-{seq}`.

#### DN-010 — ND folio format
- **Severity**: MEDIUM
- **Expected**: Format: `ND-{year}-{sequence:04d}`.

#### DN-011 — Create with description and notes
- **Severity**: MEDIUM
- **Steps**:
  1. Enter detailed description of charge
- **Expected**: Description saved.

#### DN-012 — Cancel create
- **Severity**: LOW
- **Expected**: Returns to list.

---

### DETAILS

#### DN-013 — View debit note details
- **Severity**: HIGH
- **URL**: `/debit-notes/{id}`
- **Expected**: Shows folio, invoice ref, customer, reason, amounts, description. `GET /api/debit-notes/{id}` → 200.

---

### STATUS TRANSITIONS

#### DN-014 — Apply debit note to invoice
- **Severity**: CRITICAL
- **Steps**:
  1. View ACTIVE debit note
  2. Click "Aplicar"
  3. Confirm
- **Expected**: `PUT /api/debit-notes/{id}/apply` → 200. Status = APPLIED. Invoice balance increased.

#### DN-015 — Void debit note
- **Severity**: HIGH
- **Steps**:
  1. Click "Anular"
  2. Enter reason
- **Expected**: `PUT /api/debit-notes/{id}/void` → 200. Status = VOIDED.

#### DN-016 — Cannot void APPLIED debit note
- **Severity**: HIGH
- **Expected**: Void disabled for APPLIED.

#### DN-017 — Void requires reason
- **Severity**: MEDIUM
- **Expected**: Reason prompt.

---

### FINANCIAL EFFECTS

#### DN-018 — Applied debit note increases customer balance
- **Severity**: HIGH
- **Steps**:
  1. Apply debit note
- **Expected**: Customer's outstanding balance increased.

---

### REPORTS & PERMISSIONS

#### DN-019 — Download debit notes report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button
  2. Select filters and mode
- **Expected**: `GET /api/reports/debit-notes/pdf` → 200.

#### DN-020 — 401 / 404 handling
- **Severity**: MEDIUM
- **Expected**: Standard error pages.
