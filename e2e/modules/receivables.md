# Receivables (Cuentas por Cobrar) — Test Plan

> **Module**: Receivables
> **Business Module**: `SALES`
> **Routes**: `/receivables` (list), `/receivables/:id`
> **API Base**: `/api/receivables`
> **Total Tests**: 24

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|

---

## Test Cases

---

### SETUP

#### REC-001 — Route loads correctly
- **Severity**: CRITICAL
- **URL**: `/receivables`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/receivables`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Cuentas por Cobrar" visible. `GET /api/receivables` returns 200.

#### REC-002 — Permission denied for non-SALES user
- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### REC-003 — List displays receivables
- **Severity**: HIGH
- **Expected**: Table loaded. Columns: Cliente, Factura, Total, Pagado, Saldo, Vencimiento, Días Vencidos, Status.

#### REC-004 — Aging badges
- **Severity**: HIGH
- **Expected**: PENDING (green badge), OVERDUE (red badge with days), PAID (grey badge).

#### REC-005 — Highlight overdue items
- **Severity**: HIGH
- **Expected**: Overdue rows highlighted in red. Days overdue shown.

#### REC-006 — Filter by status
- **Severity**: MEDIUM
- **Expected**: API `?status=PENDING` → 200.

#### REC-007 — Filter by customer
- **Severity**: MEDIUM
- **Expected**: API `?customerId=...` → 200.

#### REC-008 — Sort by days overdue
- **Severity**: MEDIUM
- **Expected**: Sort by overdue days.

#### REC-009 — Pagination
- **Severity**: LOW
- **Expected**: Paginator correct.

---

### DETAILS

#### REC-010 — View receivable details
- **Severity**: HIGH
- **URL**: `/receivables/{id}`
- **Expected**: Shows customer info, invoice details, payment history, balance breakdown, aging. `GET /api/receivables/{id}` → 200.

#### REC-011 — Payment history on receivable
- **Severity**: HIGH
- **Expected**: List of payments applied to this invoice.

#### REC-012 — Balance breakdown
- **Severity**: HIGH
- **Expected**: Shows total, payments, credits, debits, current balance.

---

### AGING ANALYSIS

#### REC-013 — Aging buckets
- **Severity**: MEDIUM
- **Expected**: Dashboard/widget showing buckets: 0-30 days, 31-60 days, 61-90 days, 90+ days.

#### REC-014 — Aging totals
- **Severity**: MEDIUM
- **Expected**: Each bucket shows total amount and count.

---

### PAYMENT REGISTRATION

#### REC-015 — Register payment from receivable
- **Severity**: HIGH
- **Steps**:
  1. View receivable detail
  2. Click "Registrar Pago"
  3. Select payment method
  4. Enter amount
  5. Submit
- **Expected**: `POST /api/invoices/{id}/payments` → 201. Balance updated.

#### REC-016 — Partial payment updates aging
- **Severity**: MEDIUM
- **Expected**: After partial payment, balance reduced. If still pending, remains in aging.

#### REC-017 — Full payment removes from aging
- **Severity**: MEDIUM
- **Expected**: After full payment, invoice removed from active aging.

---

### DASHBOARD / WIDGETS

#### REC-018 — Total outstanding balance
- **Severity**: MEDIUM
- **Expected**: Dashboard shows total outstanding.

#### REC-019 — Overdue total
- **Severity**: MEDIUM
- **Expected**: Dashboard shows total overdue amount.

#### REC-020 — Customer receivable summary
- **Severity**: LOW
- **Expected**: Customer detail shows their total outstanding.

---

### REPORTS

#### REC-021 — Download receivables report PDF
- **Severity**: MEDIUM
- **Steps**:
  1. Click report button
  2. Select filters, mode, aging bucket
- **Expected**: `GET /api/reports/receivables/pdf` → 200.

#### REC-022 — Download aging report
- **Severity**: MEDIUM
- **Steps**:
  1. Click aging report
- **Expected**: `GET /api/reports/receivables/aging/pdf` → 200.

---

### PERMISSIONS & ERRORS

#### REC-023 — 401 / 404 handling
- **Severity**: MEDIUM
- **Expected**: Standard error handling.

#### REC-024 — OPERATOR can view and manage
- **Severity**: HIGH
- **Expected**: OPERATOR can view receivables and register payments.
