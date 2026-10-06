# Warehouses (Almacenes) — Test Plan

> **Module**: Warehouses
> **Business Module**: `INVENTORY`
> **Routes**: `/warehouses` (list), `/warehouses/new`, `/warehouses/:id`, `/warehouses/:id/edit`
> **API Base**: `/api/warehouses`
> **Total Tests**: 38

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### WRH-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/warehouses`
- **Prerequisites**: Logged in with MODULE_INVENTORY (admin@cashly.com)
- **Steps**:
  1. Navigate to `/warehouses`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Almacenes" visible. `GET /api/warehouses` returns 200.

#### WRH-002 — Permission denied for non-INVENTORY user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_INVENTORY
- **Expected**: 403 error or redirect.

---

### LISTING

#### WRH-003 — List displays warehouses

- **Severity**: HIGH
- **Expected**: Warehouses loaded from API. At least Caracas and Valencia visible.

#### WRH-004 — List shows correct columns

- **Severity**: HIGH
- **Expected**: Columns: Código, Nombre, Estado (Activo/Inactivo), Acciones. Each row has view/edit/delete buttons.

#### WRH-005 — Search by name or code

- **Severity**: HIGH
- **Steps**:
  1. Search "Caracas"
- **Expected**: Filters list. API `?search=Caracas` → 200.

#### WRH-006 — Filter by active/inactive

- **Severity**: MEDIUM
- **Steps**:
  1. Filter by "Inactivos"
- **Expected**: Only inactive warehouses shown. Filter badge "1" displayed.

#### WRH-007 — Filter reset

- **Severity**: LOW
- **Steps**:
  1. Click "Limpiar"
- **Expected**: All warehouses restored. Badge removed.

#### WRH-008 — Pagination works

- **Severity**: MEDIUM
- **Expected**: Paginator shows correct counts. Next/prev work.

---

### CREATE

#### WRH-009 — Navigate to create form

- **Severity**: HIGH
- **URL**: `/warehouses/new`
- **Expected**: Title "Nuevo Almacen". Fields: Código _, Nombre _, Dirección, Estado, Municipio, Código Postal. Cancelar + disabled Crear button.

#### WRH-010 — Create warehouse with required fields

- **Severity**: CRITICAL
- **Steps**:
  1. Fill code: "TEST"
  2. Fill name: "Almacén Test Automatizado"
  3. Submit
- **Expected**: `POST /api/warehouses` → 201. Redirected to list. New warehouse visible.

#### WRH-011 — Create warehouse with all fields

- **Severity**: HIGH
- **Steps**:
  1. Fill code: "TEST2", name: "Almacén Full Test", address: "Calle Test 123", state: "Miranda", municipality: "Baruta", postalCode: "1000"
  2. Submit
- **Expected**: `POST` → 201. All fields saved correctly.

#### WRH-012 — Validate required fields on create

- **Severity**: HIGH
- **Expected**: "Crear" disabled when code or name empty. POST not called.

#### WRH-013 — Validate duplicate code

- **Severity**: MEDIUM
- **Steps**:
  1. Create with existing code (e.g., "TEST")
- **Expected**: `POST` → 409 Conflict. Error toast: "Código ya existe" or similar.

#### WRH-014 — Validate code uppercased

- **Severity**: LOW
- **Steps**:
  1. Enter lowercase code "test-code"
- **Expected**: Code saved as "TEST-CODE" (uppercased).

#### WRH-015 — Cancel create returns to list

- **Severity**: LOW
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/warehouses`. No warehouse created.

---

### DETAILS

#### WRH-016 — View warehouse details

- **Severity**: HIGH
- **URL**: `/warehouses/{id}`
- **Expected**: Shows code, name, address, state, municipality, postalCode, status, created & updated dates. `GET /api/warehouses/{id}` → 200.

#### WRH-017 — Details shows stock summary

- **Severity**: MEDIUM
- **Expected**: Stock section visible with product counts or total items.

#### WRH-018 — Navigate to edit from details

- **Severity**: HIGH
- **Steps**:
  1. Click "Editar"
- **Expected**: Navigates to `/warehouses/{id}/edit`. Form pre-filled.

---

### EDIT

#### WRH-019 — Edit warehouse name

- **Severity**: CRITICAL
- **Steps**:
  1. Change name to "Almacén Editado Test"
  2. Submit
- **Expected**: `PUT /api/warehouses/{id}` → 200. Name updated.

#### WRH-020 — Toggle active/inactive

- **Severity**: HIGH
- **Steps**:
  1. Toggle inactive
- **Expected**: Warehouse deactivated. Shows "Inactivo" in list. 2. Toggle back to active
- **Expected**: Restored.

#### WRH-021 — Edit duplicate code

- **Severity**: MEDIUM
- **Steps**:
  1. Change code to existing warehouse's code
- **Expected**: `PUT` → 409 Conflict. Error shown.

#### WRH-022 — Cancel edit returns to list

- **Severity**: LOW
- **Expected**: Returns to list without changes.

---

### DELETE

#### WRH-023 — Delete warehouse

- **Severity**: HIGH
- **Prerequisites**: Warehouse exists with no stock
- **Steps**:
  1. Click delete icon
  2. Confirm dialog
- **Expected**: `DELETE /api/warehouses/{id}` → 204. Warehouse removed.

#### WRH-024 — Delete warehouse with stock — blocked

- **Severity**: HIGH
- **Prerequisites**: Warehouse has stock (e.g., Caracas)
- **Expected**: `DELETE` → 409 Conflict. Error message.

#### WRH-025 — Cancel delete dialog

- **Severity**: LOW
- **Steps**:
  1. Click delete, then Cancelar
- **Expected**: Dialog closes. NOT deleted.

---

### STOCK OPERATIONS

#### WRH-026 — View stock tab in warehouse detail

- **Severity**: HIGH
- **URL**: `/warehouses/{id}`
- **Expected**: Stock tab shows products with quantity, reserved, available columns.

#### WRH-027 — Stock entry

- **Severity**: HIGH
- **Prerequisites**: Warehouse is active
- **Steps**:
  1. Perform stock entry via API or UI
- **Expected**: `POST /api/warehouses/{id}/stock/entry` → 200. Stock quantity increases.

#### WRH-028 — Stock exit

- **Severity**: HIGH
- **Prerequisites**: Sufficient stock in warehouse
- **Steps**:
  1. Perform stock exit
- **Expected**: `POST /api/warehouses/{id}/stock/exit` → 200. Stock decreases.

#### WRH-029 — Stock exit with insufficient stock — blocked

- **Severity**: HIGH
- **Steps**:
  1. Try to exit more than available
- **Expected**: `InsufficientStockException` → 400/409. Error shown.

#### WRH-030 — Stock adjustment

- **Severity**: HIGH
- **Steps**:
  1. Adjust stock to specific quantity
- **Expected**: `POST /api/warehouses/{id}/stock/adjustment` → 200. Stock set to new value.

#### WRH-031 — Stock transfer between warehouses

- **Severity**: HIGH
- **Steps**:
  1. Transfer stock from Caracas to Valencia
- **Expected**: `POST /api/warehouses/{id}/stock/transfer` → 200. Source decreases, destination increases.

#### WRH-032 — View movement history

- **Severity**: MEDIUM
- **URL**: `/warehouses/{id}`
- **Expected**: Movements tab shows history with type, product, quantity, date.

#### WRH-033 — Movement history pagination

- **Severity**: LOW
- **Expected**: Movements paginated correctly.

---

### PERMISSIONS & ERROR HANDLING

#### WRH-034 — 404 for non-existent warehouse

- **Severity**: MEDIUM
- **URL**: `/warehouses/00000000-0000-0000-0000-000000000000`
- **Expected**: `GET` → 404. Error shown.

#### WRH-035 — 401 handling

- **Severity**: MEDIUM
- **Steps**:
  1. Clear token
  2. Navigate to `/warehouses`
- **Expected**: Redirected to login.

#### WRH-036 — OPERATOR cannot create/edit/delete

- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@cashly.com
- **Expected**: Create button hidden. Edit/delete hidden.

#### WRH-037 — OPERATOR can view list and details

- **Severity**: MEDIUM
- **Prerequisites**: Logged in as operator@cashly.com
- **Expected**: Can view list and details. Can see stock tab.

---

### MOBILE / RESPONSIVE

#### WRH-038 — Mobile list view

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **Expected**: Table converts to card layout. Search and filters accessible.
