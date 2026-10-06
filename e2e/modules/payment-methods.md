# Payment Methods (Métodos de Pago) — Test Plan

> **Module**: Payment Methods
> **Business Module**: `SALES`
> **Routes**: `/payment-methods` (list), `/payment-methods/new`, `/payment-methods/:id/edit`
> **API Base**: `/api/payment-methods`
> **Total Tests**: 18

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### PM-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/payment-methods`
- **Prerequisites**: Logged in with MODULE_SALES (admin@cashly.com)
- **Steps**:
  1. Navigate to `/payment-methods`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Métodos de Pago" visible. `GET /api/payment-methods` returns 200.

#### PM-002 — Permission denied for non-SALES user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### LISTING

#### PM-003 — List displays payment methods

- **Severity**: HIGH
- **Expected**: Table loaded. Columns: Nombre, Tipo, Requiere Referencia, Activo.

#### PM-004 — Status badges

- **Severity**: HIGH
- **Expected**: Active = badge verde. Inactive = badge rojo.

#### PM-005 — Type indicators

- **Severity**: MEDIUM
- **Expected**: Types: CASH (Efectivo), TRANSFER (Transferencia), CHECK (Cheque), CARD (Tarjeta).

---

### CREATE

#### PM-006 — Navigate to create form

- **Severity**: HIGH
- **URL**: `/payment-methods/new`
- **Expected**: Title "Nuevo Método de Pago". Fields: Nombre, Tipo, Requiere Referencia, Activo.

#### PM-007 — Create cash payment method

- **Severity**: CRITICAL
- **Steps**:
  1. Enter name "Efectivo"
  2. Select type CASH
  3. Requiere Referencia = false
  4. Activo = true
  5. Submit
- **Expected**: `POST /api/payment-methods` → 201. Created. Redirected to list.

#### PM-008 — Create transfer method with reference

- **Severity**: HIGH
- **Steps**:
  1. Enter name "Transferencia Bancaria"
  2. Select type TRANSFER
  3. Requiere Referencia = true
  4. Submit
- **Expected**: `POST /api/payment-methods` → 201. Reference field becomes required on payment forms.

#### PM-009 — Create card method

- **Severity**: HIGH
- **Steps**:
  1. Create "Tarjeta Débito/Crédito" with type CARD
- **Expected**: Created successfully.

---

### EDIT

#### PM-010 — Edit payment method name

- **Severity**: HIGH
- **Steps**:
  1. Edit "Efectivo" -> "Efectivo (MXN)"
- **Expected**: `PUT /api/payment-methods/{id}` → 200. Updated.

#### PM-011 — Deactivate payment method

- **Severity**: HIGH
- **Steps**:
  1. Deactivate method
- **Expected**: Activo = false. Method hidden from payment forms.

#### PM-012 — Cannot deactivate method used in payments

- **Severity**: MEDIUM
- **Steps**:
  1. Try to deactivate a method with existing payments
- **Expected**: Warning dialog. Option to deactivate or cancel.

---

### DELETE

#### PM-013 — Delete unused payment method

- **Severity**: MEDIUM
- **Steps**:
  1. Delete method with no payments
- **Expected**: `DELETE /api/payment-methods/{id}` → 204.

#### PM-014 — Cannot delete method with payments

- **Severity**: MEDIUM
- **Expected**: Delete disabled. Message about existing references.

---

### INTEGRATION WITH INVOICES

#### PM-015 — Payment method appears on invoice form

- **Severity**: HIGH
- **Expected**: Invoice form shows active payment methods in dropdown.

#### PM-016 — Payment method requires reference when configured

- **Severity**: HIGH
- **Steps**:
  1. Select TRANSFER method with requiresReference = true
- **Expected**: Reference number field mandatory.

---

### PERMISSIONS

#### PM-017 — Only ADMIN can manage payment methods

- **Severity**: HIGH
- **Prerequisites**: operator@cashly.com
- **Expected**: Cannot access payment methods CRUD.

#### PM-018 — 401 handling

- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.
