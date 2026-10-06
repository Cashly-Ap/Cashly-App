# Cash Register (Caja) — Test Plan

> **Module**: Cash Register
> **Business Module**: `SALES`
> **Routes**: `/cash-register` (list), `/cash-register/:id`, `/cash-register/:id/close`
> **API Base**: `/api/cash-register`
> **Total Tests**: 26

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### CR-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/cash-register`
- **Prerequisites**: Logged in with MODULE_SALES (admin@cashly.com)
- **Steps**:
  1. Navigate to `/cash-register`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Caja" visible. `GET /api/cash-register` returns 200.

#### CR-002 — Permission denied for non-SALES user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### CR-003 — List displays cash register sessions

- **Severity**: HIGH
- **Expected**: Sessions table. Columns: Caja, Usuario, Apertura, Cierre, Inicial, Final, Status.

#### CR-004 — Status badges

- **Severity**: HIGH
- **Expected**: OPEN = Abierta, CLOSED = Cerrada.

#### CR-005 — Filter by status

- **Severity**: MEDIUM
- **Expected**: API `?status=OPEN` → 200.

#### CR-006 — Filter by date range

- **Severity**: MEDIUM
- **Expected**: API filtered.

#### CR-007 — Pagination

- **Severity**: LOW
- **Expected**: Paginator correct.

---

### OPEN SESSION

#### CR-008 — Open new session

- **Severity**: CRITICAL
- **Steps**:
  1. Click "Abrir Caja"
  2. Enter initial balance (e.g., 1000.00)
  3. Confirm
- **Expected**: `POST /api/cash-register/open` → 201. Session created with OPEN status. Timestamp recorded.

#### CR-009 — Cannot open session when already open

- **Severity**: HIGH
- **Expected**: "Abrir Caja" disabled when user has open session.

#### CR-010 — Initial balance field validation

- **Severity**: MEDIUM
- **Expected**: Initial balance must be >= 0.

---

### SESSION DETAILS

#### CR-011 — View session details

- **Severity**: HIGH
- **URL**: `/cash-register/{id}`
- **Expected**: Shows session info, opening balance, all transactions (invoices, payments, expenses) during session, expected closing amount. `GET /api/cash-register/{id}` → 200.

#### CR-012 — Transaction list within session

- **Severity**: HIGH
- **Expected**: List of sales (invoices), payments received, expenses recorded.

#### CR-013 — Expected vs declared closing

- **Severity**: HIGH
- **Expected**: Shows expected total (initial + sales - expenses) and field for declared amount.

---

### CLOSE SESSION

#### CR-014 — Close session with matching amounts

- **Severity**: CRITICAL
- **Steps**:
  1. View open session
  2. Enter declared closing amount (matches expected)
  3. Click "Cerrar Caja"
  4. Confirm
- **Expected**: `POST /api/cash-register/{id}/close` → 200. Status = CLOSED. Difference = 0.

#### CR-015 — Close session with difference

- **Severity**: HIGH
- **Steps**:
  1. Enter declared amount different from expected
- **Expected**: Session closes with difference recorded. Difference amount shown.

#### CR-016 — Close requires declared amount

- **Severity**: MEDIUM
- **Expected**: Amount required.

#### CR-017 — Close session notes

- **Severity**: LOW
- **Steps**:
  1. Add closing notes
- **Expected**: Notes saved.

#### CR-018 — Cannot close already closed session

- **Severity**: HIGH
- **Expected**: Close disabled.

---

### CASH MOVEMENTS

#### CR-019 — Register cash withdrawal (gasto)

- **Severity**: HIGH
- **Steps**:
  1. Click "Retirar Efectivo"
  2. Enter amount, reason
  3. Submit
- **Expected**: `POST /api/cash-register/{id}/withdrawals` → 201. Movement logged. Expected total reduced.

#### CR-020 — Register cash deposit (ingreso)

- **Severity**: HIGH
- **Steps**:
  1. Click "Ingresar Efectivo"
  2. Enter amount, reason
  3. Submit
- **Expected**: `POST /api/cash-register/{id}/deposits` → 201. Movement logged. Expected total increased.

#### CR-021 — Cash movement history

- **Severity**: MEDIUM
- **Expected**: All movements shown in session detail with type, amount, reason, timestamp.

#### CR-022 — Movement reasons

- **Severity**: LOW
- **Expected**: Reasons: EXPENSE (Gasto), PETTY_CASH (Fondo Fijo), TRANSFER (Transferencia), OTHER (Otro).

---

### REPORTS

#### CR-023 — Download cash register report PDF

- **Severity**: MEDIUM
- **Steps**:
  1. Click report button
  2. Select filters and mode
- **Expected**: `GET /api/reports/cash-register/pdf` → 200.

#### CR-024 — Download session closing report

- **Severity**: MEDIUM
- **Steps**:
  1. View closed session
  2. Click closing report
- **Expected**: `GET /api/reports/cash-register/{id}/closing` → 200.

---

### PERMISSIONS & ERRORS

#### CR-025 — 401 / 404 handling

- **Severity**: MEDIUM
- **Expected**: Standard error handling.

#### CR-026 — OPERATOR can manage cash register

- **Severity**: HIGH
- **Expected**: OPERATOR can open, close, and manage movements.
