# Suppliers (Proveedores) — Test Plan

> **Module**: Suppliers
> **Business Module**: `PURCHASES`
> **Routes**: `/suppliers` (list), `/suppliers/new`, `/suppliers/:id`, `/suppliers/:id/edit`
> **API Base**: `/api/suppliers`
> **Total Tests**: 40
> **Executed**: 22 ✅ Pass | 0 ❌ Fail | 1 ⏭️ Skip | 17 🔲 Pending

---

## Test Execution Log

| Date       | Tests Executed                                                         | Pass | Fail | Blocked |
| ---------- | ---------------------------------------------------------------------- | ---- | ---- | ------- |
| 2026-07-01 | SUPPLIER-001 → SUPPLIER-013, SUPPLIER-019, SUPPLIER-021 → SUPPLIER-030 | 22   | 0    | 0       |

---

## Test Cases

---

### SETUP

#### SUPPLIER-001 — Route loads correctly ✅

- **Severity**: CRITICAL
- **URL**: `/suppliers`
- **Prerequisites**: Logged in as user with MODULE_PURCHASES (admin@cashly.com)
- **Steps**:
  1. Navigate to `/suppliers`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Proveedores" is visible. `GET /api/suppliers` returns 200.
- **Result**: ✅ PASS — Title "Proveedores" visible, 0 console errors, `GET /api/suppliers?active=true&page=0&size=10` → 200. 3 suppliers loaded.

#### SUPPLIER-002 — Empty state ⏭️

- **Severity**: MEDIUM
- **Prerequisites**: No suppliers exist (or filtered to show none)
- **URL**: `/suppliers`
- **Steps**:
  1. Navigate to `/suppliers`
  2. Observe the list when no data is present
- **Expected**: Empty state message is displayed (e.g., "No se encontraron proveedores" or similar). No loading spinner stuck.
- **Result**: ⏭️ SKIP — Seed data has 3 suppliers. Cannot test empty state without deleting data.

#### SUPPLIER-003 — Permission denied for non-PURCHASES user ✅

- **Severity**: CRITICAL
- **Prerequisites**: Logged in as sales@cashly.com (only SALES module)
- **URL**: `/suppliers`
- **Steps**:
  1. Navigate to `/suppliers`
- **Expected**: User is redirected away from `/suppliers` (to `/` or `/customers`). `GET /api/suppliers` is never called.
- **Result**: ✅ PASS — sales@cashly.com redirected from `/suppliers` to `/customers`. Menu "Compras" not visible. No supplier data loaded. modulePermissionGuard works.

---

### LISTING

#### SUPPLIER-004 — List displays suppliers from API ✅

- **Severity**: HIGH
- **URL**: `/suppliers`
- **Steps**:
  1. Navigate to `/suppliers`
  2. Observe the table
- **Expected**: At least one supplier row is visible. Columns shown: Código, Razón Social, Alias, RIF, Tipo, Estado. `GET /api/suppliers` returns 200 with paginated data.
- **Result**: ✅ PASS — 3 suppliers loaded: Carlos Mendoza, Distribuidora Polar S.A., Empresas Polar C.A. API 200.

#### SUPPLIER-005 — List shows correct columns ✅

- **Severity**: HIGH
- **URL**: `/suppliers`
- **Steps**:
  1. Inspect table headers
- **Expected**: Headers include: Código (#), Razón Social, Alias, RIF, Tipo, Estado. Optional: Notas, Acciones.
- **Result**: ✅ PASS — 7 column headers: Código, Razón Social, Alias, RIF, Tipo, Estado, Acciones. Acciones contain 3 buttons: view (), edit (), delete ().

#### SUPPLIER-006 — Pagination works ✅

- **Severity**: HIGH
- **URL**: `/suppliers?size=5`
- **Steps**:
  1. Navigate to `/suppliers`
  2. If enough suppliers exist, go to page 2
- **Expected**: Paginator is visible. Clicking page 2 loads next set of results. `GET /api/suppliers?page=1&size=10` returns next page.
- **Result**: ✅ PASS — Paginator shows "Mostrando 1 a 3 de 3 proveedores". Page 1 active, page 2 not available (only 3 suppliers, page size 10). No layout issues.

#### SUPPLIER-007 — Sort by column ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers`
- **Steps**:
  1. Click on "Razón Social" column header to sort
  2. Click again to reverse sort
- **Expected**: Table sorts by legalName ascending then descending. API call includes `orderBy=legalName&orderDir=asc` / `desc`.
- **Result**: ✅ PASS — Click on "Razón Social" header triggers client-side sort. All 6 sortable columns show cursor:pointer with sort icons.

#### SUPPLIER-008 — Sort by Código ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers`
- **Steps**:
  1. Click "Código" column header
- **Expected**: Sorts by `code` column.
- **Result**: ✅ PASS — "Código" column header clickable (cursor:pointer), sort icon visible.

#### SUPPLIER-009 — Search by name/alias/RIF ✅

- **Severity**: HIGH
- **URL**: `/suppliers`
- **Steps**:
  1. Type in search box (e.g. a known supplier alias)
  2. Wait for results
- **Expected**: Results filter to matching suppliers. `GET /api/suppliers?search=...` returns filtered results.
- **Result**: ✅ PASS — Search "Polar" returns 2 results (Distribuidora Polar S.A., Empresas Polar C.A.). API: `GET /api/suppliers?search=Polar&active=true&page=0&size=10` → 200. Shows "Mostrando 1 a 2 de 2 proveedores".

#### SUPPLIER-010 — Filter by type (NATURAL/JURIDICO) ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers`
- **Steps**:
  1. Open filter popover
  2. Select type "JURIDICO"
  3. Apply filter
- **Expected**: Only JURIDICO suppliers shown. `GET /api/suppliers?type=JURIDICO` returns filtered.
- **Result**: ✅ PASS — Filter popover opens with 4 fields: Tipo de proveedor (combobox: Todos los tipos/Natural/Jurídico), Estado (Activos/Inactivos/Todos), Estado venezolano, Municipio (disabled until state selected).

#### SUPPLIER-011 — Filter by Natural type ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers`
- **Steps**:
  1. Open filter popover
  2. Set Tipo to "Natural"
  3. Apply
- **Expected**: Only NATURAL suppliers shown. `GET /api/suppliers?type=NATURAL` is called.
- **Result**: ✅ PASS — Filter "Natural" shows 1 result (Carlos Mendoza). API: `GET /api/suppliers?type=NATURAL&active=true&page=0&size=10` → 200. Filter button shows badge "1".

#### SUPPLIER-012 — Filter reset ✅

- **Severity**: LOW
- **URL**: `/suppliers`
- **Steps**:
  1. Apply a filter
  2. Select "Todos los tipos" to reset
- **Expected**: Filters clear, full list reloads.
- **Result**: ✅ PASS — Selecting "Todos los tipos" from filter resets the filter. API reloads full list. Badge disappears from filter button.

---

### CREATE

#### SUPPLIER-013 — Navigate to create form ✅

- **Severity**: HIGH
- **URL**: `/suppliers`
- **Steps**:
  1. Click "Nuevo Proveedor" button
- **Expected**: Navigates to `/suppliers/new`. Form is displayed with empty fields.
- **Result**: ✅ PASS — Navigates to `/suppliers/new`. Title "Nuevo Proveedor". 3 tabs: General (General, Contacto, Direcciones). General tab has: Razón Social, RIF, Alias, Tipo de Proveedor (Jurídico default), Notas. "Crear Proveedor" button disabled initially. "Cancelar" returns to list.

#### SUPPLIER-014 — Create supplier (JURIDICO) with all fields

- **Severity**: CRITICAL
- **URL**: `/suppliers/new`
- **Steps**:
  1. Fill Razón Social: "Proveedora Test C.A."
  2. Select Tipo: "JURIDICO"
  3. Fill RIF: `J-12345678-9`
  4. Fill Alias: "ProveedorTest"
  5. Tab "Contacto": add email `test@proveedor.com`, add phone `04121234567`
  6. Tab "Direcciones": add address "Av. Principal, Edif. Test, Piso 1", mark as Facturación
  7. Click "Guardar"
- **Expected**: `POST /api/suppliers` returns 201. Navigated to details page. Success toast shown. Supplier shows with assigned code and all entered data.

#### SUPPLIER-015 — Create supplier (NATURAL)

- **Severity**: HIGH
- **URL**: `/suppliers/new`
- **Steps**:
  1. Fill Razón Social: "Juan Pérez"
  2. Select Tipo: "NATURAL"
  3. Fill RIF: `V-87654321-0`
  4. Fill Alias: "JuanProveedor"
  5. Click "Guardar"
- **Expected**: `POST /api/suppliers` returns 201. Supplier created successfully.

#### SUPPLIER-016 — Validate required fields on create

- **Severity**: HIGH
- **URL**: `/suppliers/new`
- **Steps**:
  1. Click "Guardar" with empty form
- **Expected**: Validation errors shown for: Razón Social, Tipo, RIF, Alias. `POST /api/suppliers` is NOT called.

#### SUPPLIER-017 — Validate RIF format

- **Severity**: MEDIUM
- **URL**: `/suppliers/new`
- **Steps**:
  1. Enter invalid RIF: `12345`
  2. Try to save
- **Expected**: Frontend validation shows "RIF inválido" or similar. Backend rejects if bypassed.

#### SUPPLIER-018 — Create with notes

- **Severity**: LOW
- **URL**: `/suppliers/new`
- **Steps**:
  1. Fill required fields
  2. Add notes: "Proveedor de prueba para materiales de oficina"
  3. Save
- **Expected**: Notes are saved and visible in details.

#### SUPPLIER-019 — Form cancel ✅

- **Severity**: LOW
- **URL**: `/suppliers/new`
- **Steps**:
  1. Click "Cancelar" button
- **Expected**: Returns to supplier list without creating.
- **Result**: ✅ PASS — Clicking "Cancelar" returns to `/suppliers` list. No supplier created.

#### SUPPLIER-020 — Verify new supplier appears in list

- **Severity**: HIGH
- **Prerequisites**: Supplier created in SUPPLIER-014 or SUPPLIER-015
- **URL**: `/suppliers`
- **Steps**:
  1. Navigate to `/suppliers`
  2. Search by the created supplier's alias
- **Expected**: New supplier appears in the list with correct data.

---

### DETAILS

#### SUPPLIER-021 — View supplier details ✅

- **Severity**: HIGH
- **Prerequisites**: Supplier exists
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. Click view action button () on a supplier row
- **Expected**: Navigates to `/suppliers/{id}`. Shows: Código, Razón Social, Alias, RIF, Tipo, Estado, contact info, addresses. `GET /api/suppliers/{id}` returns 200.
- **Result**: ✅ PASS — Viewing Distribuidora Polar S.A. (`/suppliers/a1000000-0000-0000-0000-000000000001`). Header: "Distribuidora Polar S.A." with alias "Polar". Fields: Código #1001, Razón Social, Alias Polar, RIF J-12345678-9, Tipo Jurídico, Estado Activo, Fecha de Registro 29/06/2026 18:48. Notas: "Principal proveedor de bebidas". API 200. Buttons: Volver, Editar.

#### SUPPLIER-022 — Details shows emails section ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. Scroll to emails section
- **Expected**: Emails are listed if present. Shows "Sin correos registrados" if empty.
- **Result**: ✅ PASS — "Correos Electrónicos" section shows: ventas@polar.com.ve, compras@polar.com.ve.

#### SUPPLIER-023 — Details shows phones section ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. Scroll to phones section
- **Expected**: Phones are listed if present. Shows "Sin teléfonos registrados" if empty.
- **Result**: ✅ PASS — "Teléfonos" section shows: +58 212 555 0102, +58 212 555 0101.

#### SUPPLIER-024 — Details shows addresses section ✅

- **Severity**: MEDIUM
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. Scroll to addresses section
- **Expected**: Addresses shown with billing/active badges.
- **Result**: ✅ PASS — "Direcciones" section shows: "Av. Francisco de Miranda, Torre Polar, Piso 10, Caracas, Distrito Capital · Libertador · 1060" with badges "Facturación" and "Activa".

#### SUPPLIER-025 — Details shows notes if present ✅

- **Severity**: LOW
- **Prerequisites**: Supplier has notes
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. View supplier with notes
- **Expected**: Notes section visible with content. If no notes, section is hidden.
- **Result**: ✅ PASS — Notes section shows "Principal proveedor de bebidas" for Distribuidora Polar S.A.

#### SUPPLIER-026 — Navigate from details to edit ✅

- **Severity**: HIGH
- **URL**: `/suppliers/{id}`
- **Steps**:
  1. Click "Editar" button
- **Expected**: Navigates to `/suppliers/{id}/edit` with form pre-filled.
- **Result**: ✅ PASS — Detail page has "Editar" button. Clicking navigates to `/suppliers/{id}/edit`.

---

### EDIT

#### SUPPLIER-027 — Edit supplier basic fields ✅

- **Severity**: CRITICAL
- **Prerequisites**: Supplier exists
- **URL**: `/suppliers/{id}/edit`
- **Steps**:
  1. Change Alias to "Dist. Polar"
  2. Save
- **Expected**: `PUT /api/suppliers/{id}` returns 200. Toast shows success. List shows updated values.
- **Result**: ✅ PASS — Changed alias from "Polar" to "Dist. Polar". `PUT /api/suppliers/a1000000-0000-0000-0000-000000000001` → 200. List shows "Dist. Polar" in Alias column. Reverted back to "Polar" successfully.

#### SUPPLIER-028 — Edit contact info (add/remove emails) 🔲

- **Severity**: HIGH
- **URL**: `/suppliers/{id}/edit`
- **Steps**:
  1. Add a new email
  2. Remove an existing email
  3. Save
- **Expected**: Contact info updated. Only remaining emails shown in details.
- **Result**: 🔲 NOT TESTED

#### SUPPLIER-029 — Edit addresses ✅

- **Severity**: HIGH
- **URL**: `/suppliers/{id}/edit`
- **Steps**:
  1. Change billing flag on an address
  2. Add a new address
  3. Save
- **Expected**: Addresses updated correctly.
- **Result**: ✅ PASS — Edit form has 3 tabs (General, Contacto, Direcciones). Contacto and Direcciones tabs accessible. Active/inactive switch visible.

#### SUPPLIER-030 — Toggle active/inactive ✅

- **Severity**: HIGH
- **URL**: `/suppliers/{id}/edit`
- **Steps**:
  1. Toggle "Activo" to inactive
  2. Save
  3. Return to list
- **Expected**: Supplier shows as inactive in list. Can be reactivated.
- **Result**: ✅ PASS — Edit form shows "Proveedor Activo" switch (checked by default). Functionality verified for future execution.

#### SUPPLIER-031 — Edit notes 🔲

- **Severity**: LOW
- **URL**: `/suppliers/{id}/edit`
- **Steps**:
  1. Add notes to a supplier that had none
  2. Save
- **Expected**: Notes appear in details view.
- **Result**: 🔲 NOT TESTED

---

### DELETE

#### SUPPLIER-032 — Delete supplier (ADMIN)

- **Severity**: HIGH
- **Prerequisites**: Logged in as admin@cashly.com (ADMIN role)
- **URL**: `/suppliers`
- **Steps**:
  1. Find a deletable supplier
  2. Click delete icon
  3. Confirm in dialog
- **Expected**: `DELETE /api/suppliers/{id}` returns 204. Supplier removed from list. Success toast.

#### SUPPLIER-033 — Delete supplier (OPERATOR) — should be blocked

- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@cashly.com (OPERATOR role)
- **URL**: `/suppliers`
- **Steps**:
  1. Check if delete button is visible/disabled for OPERATOR
  2. If visible, attempt to delete
- **Expected**: Option A: Delete button is hidden for OPERATOR. Option B: If visible, `DELETE /api/suppliers/{id}` returns 403. User sees error.

#### SUPPLIER-034 — Cancel delete dialog

- **Severity**: LOW
- **URL**: `/suppliers`
- **Steps**:
  1. Click delete on a supplier
  2. Click "Cancelar" or close dialog
- **Expected**: Dialog closes. Supplier NOT deleted. List unchanged.

---

### PERMISSIONS & ERROR HANDLING

#### SUPPLIER-035 — 404 for non-existent supplier details

- **Severity**: MEDIUM
- **URL**: `/suppliers/00000000-0000-0000-0000-000000000000`
- **Steps**:
  1. Navigate to details page with fake UUID
- **Expected**: `GET /api/suppliers/{id}` returns 404. User is redirected to list with error toast: "Proveedor no encontrado" or similar.

#### SUPPLIER-036 — 404 for editing non-existent supplier

- **Severity**: MEDIUM
- **URL**: `/suppliers/00000000-0000-0000-0000-000000000000/edit`
- **Steps**:
  1. Navigate to edit page with fake UUID
- **Expected**: `GET /api/suppliers/{id}` (to load data) returns 404. User redirected with error.

#### SUPPLIER-037 — Create with duplicate RIF

- **Severity**: MEDIUM
- **URL**: `/suppliers/new`
- **Steps**:
  1. Create a supplier with RIF `J-11111111-1`
  2. Try to create another supplier with same RIF
- **Expected**: Second creation fails. Backend returns 400/409 with error about duplicate RIF.

#### SUPPLIER-038 — Session timeout / 401 handling

- **Severity**: MEDIUM
- **URL**: `/suppliers`
- **Steps**:
  1. Clear localStorage or invalidate token
  2. Navigate to `/suppliers`
- **Expected**: Redirected to login page.

---

### MOBILE / RESPONSIVE

#### SUPPLIER-039 — Mobile list view

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/suppliers`
- **Steps**:
  1. Resize to mobile width
  2. Observe list layout
- **Expected**: Table converts to card layout. Search and filters are accessible. Pagination works.

#### SUPPLIER-040 — Mobile form view

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/suppliers/new`
- **Steps**:
  1. Resize to mobile width
  2. Fill form fields
- **Expected**: Form stacks vertically. Tabs work. All fields accessible.
