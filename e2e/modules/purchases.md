# Purchases (Compras) — Test Plan

> **Module**: Purchases
> **Business Module**: `PURCHASES`
> **Routes**: `/purchases` (list), `/purchases/new`, `/purchases/:id`, `/purchases/:id/edit`
> **API Base**: `/api/purchases`
> **Total Tests**: 46

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### PUR-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/purchases`
- **Prerequisites**: Logged in with MODULE_PURCHASES (admin@cashly.com)
- **Steps**:
  1. Navigate to `/purchases`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Compras" visible. `GET /api/purchases` returns 200.

#### PUR-002 — Permission denied for non-PURCHASES user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_PURCHASES
- **Expected**: 403 or redirect.

---

### LISTING

#### PUR-003 — List displays purchases

- **Severity**: HIGH
- **Expected**: Purchases table loaded. Columns: Folio, Proveedor, Status, Total, Fecha.

#### PUR-004 — Status badges

- **Severity**: HIGH
- **Expected**: PENDING = Pendiente, PARTIALLY_RECEIVED = Parcial, COMPLETED = Completada, CANCELLED = Cancelada.

#### PUR-005 — Filter by status

- **Severity**: MEDIUM
- **Expected**: API `?status=PENDING` → 200.

#### PUR-006 — Filter by supplier

- **Severity**: MEDIUM
- **Expected**: API `?supplierId=...` → 200.

#### PUR-007 — Filter by date range

- **Severity**: MEDIUM
- **Expected**: API filtered.

#### PUR-008 — Sort columns

- **Severity**: LOW
- **Expected**: Sort works.

#### PUR-009 — Pagination works

- **Severity**: LOW
- **Expected**: Paginator correct.

---

### CREATE

#### PUR-010 — Navigate to create form

- **Severity**: HIGH
- **URL**: `/purchases/new`
- **Expected**: Title "Nueva Compra". Supplier picker, product picker, items table, notes.

#### PUR-011 — Create purchase with supplier and products

- **Severity**: CRITICAL
- **Steps**:
  1. Select supplier via SupplierPickerDialog
  2. Add product (HERR-001 Taladro, qty 10) via ProductPickerDialog
  3. Set unit cost
  4. Submit
- **Expected**: `POST /api/purchases` → 201 Created. PO number generated. Status = PENDING. Redirected to detail.

#### PUR-012 — PO number format

- **Severity**: HIGH
- **Expected**: Format: `OC-{year}-{sequence:04d}`.

#### PUR-013 — Total auto-calculated

- **Severity**: HIGH
- **Expected**: Total = sum(lineTotal).

#### PUR-014 — Cannot create without supplier

- **Severity**: HIGH
- **Expected**: Submit disabled.

#### PUR-015 — Cannot create without products

- **Severity**: HIGH
- **Expected**: Submit disabled.

#### PUR-016 — Cancel create returns to list

- **Severity**: LOW
- **Expected**: Cancel returns to `/purchases`.

#### PUR-017 — Expected delivery date field

- **Severity**: MEDIUM
- **Steps**:
  1. Set expected delivery date
- **Expected**: Date saved.

---

### DETAILS

#### PUR-018 — View purchase details

- **Severity**: HIGH
- **URL**: `/purchases/{id}`
- **Expected**: Shows folio, supplier, status, items table, totals, notes, dates. `GET /api/purchases/{id}` → 200.

#### PUR-019 — Receiving status indicator

- **Severity**: HIGH
- **Expected**: Shows received qty vs ordered qty per line.

---

### RECEIVING (RECEPTION)

#### PUR-020 — Navigate to receiving form

- **Severity**: CRITICAL
- **Steps**:
  1. View purchase detail
  2. Click "Recibir" button
- **Expected**: Receiving form opens. Shows lines with ordered qty, received qty, and qty to receive input.

#### PUR-021 — Full receive all items

- **Severity**: CRITICAL
- **Steps**:
  1. Receive all items with full qty
  2. Submit
- **Expected**: `POST /api/purchases/{id}/receive` → 200. Status = COMPLETED. Stock increased for each product.

#### PUR-022 — Partial receive

- **Severity**: HIGH
- **Steps**:
  1. Receive less qty than ordered
- **Expected**: Status = PARTIALLY_RECEIVED. Stock increased for received qty.

#### PUR-023 — Multi-step partial receives

- **Severity**: HIGH
- **Steps**:
  1. Receive partial qty -> PARTIALLY_RECEIVED
  2. Receive remaining qty -> COMPLETED
- **Expected**: After second receive, status = COMPLETED.

#### PUR-024 — Cannot receive more than ordered

- **Severity**: HIGH
- **Expected**: Validation error when qty > ordered.

#### PUR-025 — Receive with different cost

- **Severity**: MEDIUM
- **Steps**:
  1. Receive with actual cost different from PO cost
- **Expected**: Cost variance tracked. Warehouse cost updated.

#### PUR-026 — Cancel receiving

- **Severity**: LOW
- **Steps**:
  1. Cancel receiving
- **Expected**: Returns to detail. No stock changes.

---

### STATUS TRANSITIONS

#### PUR-027 — Cancel PENDING purchase

- **Severity**: HIGH
- **Steps**:
  1. Cancel with reason
- **Expected**: `PUT /api/purchases/{id}/cancel` → 200. Status = CANCELLED.

#### PUR-028 — Cannot cancel received purchase

- **Severity**: HIGH
- **Expected**: Cancel disabled for PARTIALLY_RECEIVED or COMPLETED.

#### PUR-029 — Cancel requires reason

- **Severity**: MEDIUM
- **Expected**: Reason prompt.

---

### EDIT

#### PUR-030 — Edit PENDING purchase

- **Severity**: HIGH
- **Steps**:
  1. Edit lines, qty, notes
- **Expected**: `PUT /api/purchases/{id}` → 200.

#### PUR-031 — Cannot edit after receiving started

- **Severity**: HIGH
- **Expected**: Edit disabled for PARTIALLY_RECEIVED.

---

### DELETE

#### PUR-032 — Delete PENDING purchase

- **Severity**: HIGH
- **Expected**: `DELETE /api/purchases/{id}` → 204.

#### PUR-033 — Cannot delete received purchase

- **Severity**: HIGH
- **Expected**: Delete disabled.

---

### REPORTS & PRINTING

#### PUR-034 — Download single purchase PDF

- **Severity**: MEDIUM
- **Steps**:
  1. Click PDF button on detail
- **Expected**: `GET /api/reports/purchases/{id}/pdf` → 200.

#### PUR-035 — Download purchases report PDF

- **Severity**: MEDIUM
- **Steps**:
  1. Click report button on list
  2. Select filters and mode
- **Expected**: `GET /api/reports/purchases/pdf` → 200.

---

### SUPPLIER & PRODUCT PICKERS

#### PUR-036 — Supplier picker opens and filters

- **Severity**: MEDIUM
- **Expected**: Dialog with search.

#### PUR-037 — Product picker opens

- **Severity**: MEDIUM
- **Expected**: Dialog with search and category filter.

#### PUR-038 — Warehouse picker

- **Severity**: MEDIUM
- **Steps**:
  1. Select product
  2. Allocate to warehouse
- **Expected**: Warehouse picker works. `GET /api/warehouses/assignable` returns warehouses user has access to.

---

### COST PRICE UPDATE

#### PUR-039 — Purchase cost updates product cost

- **Severity**: HIGH
- **Steps**:
  1. Create purchase with cost 150.00
  2. Receive fully
- **Expected**: Product cost price updated to match latest purchase cost (or weighted average).

#### PUR-040 — Cost history tracked

- **Severity**: MEDIUM
- **Expected**: Cost changes logged.

---

### PERMISSIONS & ERRORS

#### PUR-041 — 404 for non-existent purchase

- **Severity**: MEDIUM
- **Expected**: `GET` → 404.

#### PUR-042 — 401 handling

- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.

#### PUR-043 — OPERATOR can manage purchases

- **Severity**: HIGH
- **Prerequisites**: operator@cashly.com
- **Expected**: Full purchase management.

#### PUR-044 — SUPERVISOR can approve purchases

- **Severity**: HIGH
- **Prerequisites**: supervisor@cashly.com
- **Expected**: Can approve PENDING purchases.

---

### MOBILE / RESPONSIVE

#### PUR-045 — Mobile list

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **Expected**: Cards layout.

#### PUR-046 — Mobile receiving form

- **Severity**: MEDIUM
- **Expected**: Form stacks, qty inputs usable.
