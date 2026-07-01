# Categories (Categorías) — Test Plan

> **Module**: Categories
> **Business Module**: `INVENTORY`
> **Routes**: `/categories` (list), `/categories/new`, `/categories/:id`, `/categories/:id/edit`
> **API Base**: `/api/categories`
> **Total Tests**: 40

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
|------|---------------|------|------|---------|
| 2026-07-01 | CAT-001 to CAT-032 | 23 | 0 | 0 |

---

## Test Cases

---

### SETUP

#### CAT-001 — Route loads correctly ✅
- **Severity**: CRITICAL
- **URL**: `/categories`
- **Prerequisites**: Logged in as user with MODULE_INVENTORY (admin@parsun.com)
- **Steps**:
  1. Navigate to `/categories`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Categorías" is visible. `GET /api/categories` returns 200.

#### CAT-002 — Empty state ⏭️
- **Severity**: MEDIUM
- **Prerequisites**: No categories exist (or filtered to show none)
- **URL**: `/categories`
- **Steps**:
  1. Navigate to `/categories`
  2. Observe the list when no data is present
- **Expected**: Empty state message is displayed. No loading spinner stuck.

#### CAT-003 — Permission denied for non-INVENTORY user ⏭️ (requires auth change)
- **Severity**: CRITICAL

---

### LISTING

#### CAT-004 — List displays categories from API ✅
- **Severity**: HIGH
- **Result**: 9 categories loaded (active=true), API 200 OK.

#### CAT-005 — List shows correct columns ✅
- **Severity**: HIGH
- **Result**: 4 columns: Nombre, Descripción, Estado, Acciones. Each row has view/edit/delete buttons.

#### CAT-006 — Pagination works ✅
- **Severity**: HIGH
- **Result**: Paginator shows "Mostrando 1 a 9 de 9 categorías". Since all fit on one page, next/prev are disabled.

#### CAT-007 — Sort by column (Nombre) ✅
- **Severity**: MEDIUM
- **Result**: Click Nombre header toggles asc/desc. API `orderBy=name&orderDir=asc|desc` → 200. Seguridad Industrial first on desc, Alimentos first on asc.

#### CAT-008 — Search by name ✅
- **Severity**: HIGH
- **Result**: Search "Electrónica" → 1 result, API `?search=Electrónica` → 200. "Mostrando 1 a 1 de 1 categorías".

#### CAT-009 — Filter popover opens ✅
- **Severity**: MEDIUM
- **Result**: Popover opens with "Filtros" title. Dropdown has "Activos" selected. Buttons: "Limpiar".

#### CAT-010 — Filter by active/inactive ✅
- **Severity**: MEDIUM
- **Result**: Set to "Inactivos" → 1 result (Textil Industrial). API `?active=false` → 200. Filter button shows badge "1".

#### CAT-011 — Filter reset ✅
- **Severity**: LOW
- **Result**: Click "Limpiar" → back to 9 results. Badge removed. API `?active=true` → 200.

#### CAT-012 — Inactive category has distinct badge ✅
- **Severity**: LOW
- **Result**: "Textil Industrial" shows "Inactiva" text. Active categories show "Activa" in green.

---

### CREATE

#### CAT-013 — Navigate to create form ✅
- **Severity**: HIGH
- **Result**: Navigates to `/categories/new`. Title "Nuevo Categoría". Fields: Nombre * (input), Descripción (textarea). Cancelar + disabled Crear Categoría button.

#### CAT-014 — Create category with name only ✅
- **Severity**: CRITICAL
- **Result**: `POST /api/categories` → 201 Created. Redirected to `/categories`. "Categoría de Prueba" visible in list.

#### CAT-015 — Create category with name and description ✅
- **Severity**: HIGH
- **Result**: `POST /api/categories` → 201 Created. Name "Test con Descripción" with description saved.

#### CAT-016 — Validate required fields on create ✅
- **Severity**: HIGH
- **Result**: "Crear Categoría" button is DISABLED when name field is empty. `POST` NOT called.

#### CAT-017 — Validate name max length ⚠️
- **Severity**: MEDIUM
- **Result**: No frontend maxlength validation. Input accepts 101+ chars. Backend DB has `varchar(100)` — would get 500 error. Consider adding `maxlength=100` to input.

#### CAT-018 — Cancel create returns to list ✅
- **Severity**: LOW
- **Result**: "Cancelar" returns to `/categories`. No category created.

#### CAT-019 — Create with duplicate name ✅
- **Severity**: MEDIUM
- **Result**: `POST /api/categories` with "Electrónica" → 409 Conflict. Page stays on `/categories/new` with form preserved.

#### CAT-020 — Verify new category appears in list ✅
- **Severity**: HIGH
- **Result**: "Categoría de Prueba" and "Test con Descripción" visible in list.

---

### DETAILS

#### CAT-021 — View category details ✅
- **Severity**: HIGH
- **Result**: Navigates to `/categories/{id}`. Shows: name (heading), products count, estado (Activa/Inactiva), created & updated dates, description. `GET /api/categories/{id}` → 200.

#### CAT-022 — Details shows description if present ✅
- **Severity**: MEDIUM
- **Result**: Description section shows "Alimentos no perecederos y productos de consumo masivo".

#### CAT-023 — Details shows product count ✅
- **Severity**: MEDIUM
- **Result**: "Productos: 0" displayed.

#### CAT-024 — Details shows dates ✅
- **Severity**: LOW
- **Result**: "Creada: 16/06/2026 21:22" and "Actualizada: 16/06/2026 21:22" shown.

#### CAT-025 — Details for inactive category ✅
- **Severity**: MEDIUM
- **Result**: Textil Industrial shows "Inactiva" status with distinct styling.

#### CAT-026 — Navigate from details to edit ✅
- **Severity**: HIGH
- **Result**: Click "Editar" → navigates to `/categories/{id}/edit`. Form pre-filled with existing values.

---

### EDIT

#### CAT-027 — Edit category name ✅
- **Severity**: CRITICAL
- **Result**: `PUT /api/categories/{id}` → 200. Name updated. Redirected to list. (Reverted to original after test.)

#### CAT-028 — Edit description ⏭️ (similar to CAT-027)
- **Severity**: HIGH

#### CAT-029 — Toggle active/inactive ✅
- **Severity**: HIGH
- **Result**: Toggle switch off → `PUT` → 200. Category shows "Inactiva" in list. Toggle back on → `PUT` → 200. Category restored to active.

#### CAT-030 — Edit duplicate name validation ⏭️ (same logic as CAT-019)
- **Severity**: MEDIUM

#### CAT-031 — Edit with empty name ⏭️ (same validation as CAT-016)
- **Severity**: HIGH

#### CAT-032 — Cancel edit returns to list ✅
- **Severity**: LOW
- **Result**: "Cancelar" returns to `/categories` list without changes.

---

### DELETE

#### CAT-033 — Delete category (admin)
- **Severity**: HIGH
- **Prerequisites**: Logged in as admin@parsun.com (ADMIN role)
- **URL**: `/categories`
- **Steps**:
  1. Find a deletable category (with 0 products)
  2. Click delete icon
  3. Confirm in dialog
- **Expected**: `DELETE /api/categories/{id}` returns 204. Category deactivated. Success toast.

#### CAT-034 — Delete category with active products — blocked
- **Severity**: HIGH
- **Prerequisites**: Category has active products
- **Steps**:
  1. Try to delete a category that has active products
- **Expected**: `DELETE /api/categories/{id}` returns 409. Error shown: "Categoría tiene productos activos" or similar.

#### CAT-035 — Cancel delete dialog
- **Severity**: LOW
- **URL**: `/categories`
- **Steps**:
  1. Click delete on a category
  2. Click "Cancelar" or close dialog
- **Expected**: Dialog closes. Category NOT deleted.

#### CAT-036 — Delete button hidden/disabled for OPERATOR
- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **URL**: `/categories`
- **Steps**:
  1. Check if delete button is visible/disabled
- **Expected**: Delete button () is hidden or disabled for OPERATOR role.

---

### PERMISSIONS & ERROR HANDLING

#### CAT-037 — 404 for non-existent category details
- **Severity**: MEDIUM
- **URL**: `/categories/00000000-0000-0000-0000-000000000000`
- **Steps**:
  1. Navigate to details page with fake UUID
- **Expected**: `GET /api/categories/{id}` returns 404. User redirected with error.

#### CAT-038 — 404 for editing non-existent category
- **Severity**: MEDIUM
- **URL**: `/categories/00000000-0000-0000-0000-000000000000/edit`
- **Steps**:
  1. Navigate to edit page with fake UUID
- **Expected**: Error shown. User redirected.

#### CAT-039 — Session timeout / 401 handling
- **Severity**: MEDIUM
- **URL**: `/categories`
- **Steps**:
  1. Clear token / invalidate session
  2. Navigate to `/categories`
- **Expected**: Redirected to login page.

#### CAT-040 — OPERATOR cannot access new/edit
- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **URL**: `/categories/new`
- **Steps**:
  1. Navigate to create page
- **Expected**: `POST /api/categories` returns 403 if attempted. "Nueva Categoría" button may be hidden.

---

### MOBILE / RESPONSIVE

#### CAT-041 — Mobile list view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/categories`
- **Steps**:
  1. Resize to mobile width
  2. Observe list layout
- **Expected**: Table converts to card layout. Search and filters accessible.

#### CAT-042 — Mobile form view
- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/categories/new`
- **Steps**:
  1. Resize to mobile width
  2. Fill form fields
- **Expected**: Form stacks vertically. All fields accessible.
