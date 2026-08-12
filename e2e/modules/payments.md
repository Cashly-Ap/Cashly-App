# Payments (Pagos) — Test Plan

> **Module**: Payments
> **Business Module**: `SALES`
> **Routes**: `/payments` (list), `/payments/:id`
> **API Base**: `/api/payments`
> **Total Tests**: 32

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### PAY-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/payments`
- **Prerequisites**: Logged in with MODULE_SALES (admin@parsun.com)
- **Steps**:
  1. Navigate to `/payments`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Pagos" visible. `GET /api/payments` returns 200.

#### PAY-002 — Permission denied for non-SALES user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### PAY-003 — List displays payments

- **Severity**: HIGH
- **Expected**: Payments table loaded. Columns: Folio, Factura, Cliente, Método, Monto, Fecha, Status.

#### PAY-004 — Status badges

- **Severity**: HIGH
- **Expected**: COMPLETED = Completado, VOIDED = Anulado.

#### PAY-005 — Filter by method

- **Severity**: MEDIUM
- **Expected**: API `?method=CASH` → 200.

#### PAY-006 — Filter by date range

- **Severity**: MEDIUM
- **Expected**: API filtered.

#### PAY-007 — Filter by invoice

- **Severity**: MEDIUM
- **Expected**: API `?invoiceId=...` → 200.

#### PAY-008 — Sort columns

- **Severity**: LOW
- **Expected**: Sort works.

#### PAY-009 — Pagination works

- **Severity**: LOW
- **Expected**: Paginator correct.

---

### DETAILS

#### PAY-010 — View payment details

- **Severity**: HIGH
- **URL**: `/payments/{id}`
- **Expected**: Shows folio, invoice ref, customer, method, amount, date, status, notes. `GET /api/payments/{id}` → 200.

#### PAY-011 — Payment folio format

- **Severity**: MEDIUM
- **Expected**: Format: `PAG-{year}-{sequence:04d}`.

---

### CREATE (From Invoice)

Payments are created as part of the invoice workflow:

#### PAY-012 — Full payment on cash invoice

- **Severity**: CRITICAL
- **Steps**:
  1. Create invoice with payment type CASH
  2. Select payment method (Efectivo)
  3. Enter amount equal to total
- **Expected**: Payment created with COMPLETED status. Invoice paid.

#### PAY-013 — Full payment on credit invoice

- **Severity**: CRITICAL
- **Steps**:
  1. Create invoice with payment type CREDIT
- **Expected**: Payment created with PENDING status. Invoice = PENDING.

#### PAY-014 — Register payment for credit invoice

- **Severity**: HIGH
- **Steps**:
  1. View credit invoice
  2. Click "Registrar Pago"
  3. Enter amount, method, reference
  4. Submit
- **Expected**: `POST /api/invoices/{id}/payments` → 201. Payment created.

#### PAY-015 — Partial payment on credit invoice

- **Severity**: HIGH
- **Steps**:
  1. Register payment less than total
- **Expected**: Payment created. Invoice balance reduced. Invoice remains PENDING.

#### PAY-016 — Full payment clears invoice

- **Severity**: HIGH
- **Steps**:
  1. Register payment equal to remaining balance
- **Expected**: Invoice status = PAID.

#### PAY-017 — Overpayment blocked

- **Severity**: HIGH
- **Steps**:
  1. Try to pay more than remaining balance
- **Expected**: Validation error. Amount cannot exceed outstanding balance.

---

### PAYMENT METHODS

#### PAY-018 — Cash payment

- **Severity**: HIGH
- **Expected**: CASH payment = immediately completed.

#### PAY-019 — Transfer payment

- **Severity**: HIGH
- **Steps**:
  1. Select TRANSFER method
  2. Enter bank reference
- **Expected**: Reference saved. Payment pending if requires confirmation.

#### PAY-020 — Check payment

- **Severity**: HIGH
- **Steps**:
  1. Select CHECK method
  2. Enter check number and bank
- **Expected**: Check details saved.

#### PAY-021 — Card payment

- **Severity**: HIGH
- **Steps**:
  1. Select CARD method
  2. Enter last 4 digits, authorization code
- **Expected**: Card details saved.

#### PAY-022 — Mixed payment

- **Severity**: MEDIUM
- **Steps**:
  1. Pay with two methods (e.g., cash + transfer)
- **Expected**: Two payment records. Total = invoice total.

---

### VOID / CANCEL

#### PAY-023 — Void payment

- **Severity**: HIGH
- **Steps**:
  1. Void a completed payment
  2. Provide reason
- **Expected**: `PUT /api/payments/{id}/void` → 200. Status = VOIDED. Invoice balance restored.

#### PAY-024 — Void requires reason

- **Severity**: MEDIUM
- **Expected**: Reason modal.

#### PAY-025 — Cannot void already voided payment

- **Severity**: MEDIUM
- **Expected**: Void button disabled.

#### PAY-026 — Void updates invoice status

- **Severity**: HIGH
- **Steps**:
  1. Pay invoice fully -> PAID
  2. Void payment -> balance restored
- **Expected**: Invoice returns to PENDING or PARTIALLY_PAID.

---

### REPORTS

#### PAY-027 — Download payments report PDF

- **Severity**: MEDIUM
- **Steps**:
  1. Click report button
  2. Select filters and mode
- **Expected**: `GET /api/reports/payments/pdf` → 200.

#### PAY-028 — Download payment receipt

- **Severity**: MEDIUM
- **Steps**:
  1. View payment detail
  2. Click receipt button
- **Expected**: `GET /api/payments/{id}/receipt` → 200.

---

### PERMISSIONS & ERRORS

#### PAY-029 — 404 for non-existent payment

- **Severity**: MEDIUM
- **Expected**: `GET` → 404.

#### PAY-030 — 401 handling

- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.

#### PAY-031 — OPERATOR can view and register payments

- **Severity**: HIGH
- **Expected**: OPERATOR can view payments and register on invoices.

---

### MOBILE

#### PAY-032 — Mobile payments list

- **Severity**: LOW
- **Prerequisites**: Viewport < 768px
- **Expected**: Cards layout.
