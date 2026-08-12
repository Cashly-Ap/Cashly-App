# Price Types (Tipos de Precio) — Test Plan

> **Module**: Price Types
> **Business Module**: `INVENTORY`
> **Routes**: `/price-types` (list), `/price-types/new`, `/price-types/:id`, `/price-types/:id/edit`
> **API Base**: `/api/price-types`
> **Total Tests**: 28

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### PRT-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/price-types`
- **Prerequisites**: Logged in as user with MODULE_INVENTORY (admin@parsun.com)
- **Steps**:
  1. Navigate to `/price-types`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Tipos de Precio" is visible. `GET /api/price-types` returns 200.

#### PRT-002 — Permission denied for non-INVENTORY user

- **Severity**: CRITICAL
- **Prerequisites**: Logged in as user without MODULE_INVENTORY
- **URL**: `/price-types`
- **Steps**:
  1. Navigate to `/price-types`
- **Expected**: 403 error or redirect to unauthorized page.

---

### LISTING

#### PRT-003 — List displays price types from API

- **Severity**: HIGH
- **Steps**:
  1. Navigate to `/price-types`
- **Expected**: Price types loaded from `GET /api/price-types`. At least 3 types visible (Base, Mayor, Especial).

#### PRT-004 — List shows correct columns

- **Severity**: HIGH
- **Expected**: Columns: Nombre, Descripción, Estado, Acciones (view/edit/delete buttons).

#### PRT-005 — Sort by Nombre

- **Severity**: MEDIUM
- **Steps**:
  1. Click Nombre column header
- **Expected**: Toggles asc/desc. API `orderBy=name&orderDir=asc|desc` → 200.

#### PRT-006 — Active/inactive status visible

- **Severity**: LOW
- **Expected**: Active types show "Activo" in green. Inactive types show "Inactivo" badge.

---

### CREATE

#### PRT-007 — Navigate to create form

- **Severity**: HIGH
- **URL**: `/price-types/new`
- **Expected**: Title "Nuevo Tipo de Precio". Fields: Nombre \* (input), Descripción (textarea). Cancelar + disabled Crear button.

#### PRT-008 — Create price type with name only

- **Severity**: CRITICAL
- **Steps**:
  1. Fill name: "Precio Test Automatizado"
  2. Submit
- **Expected**: `POST /api/price-types` → 201. Redirected to list. New type visible.

#### PRT-009 — Create price type with name and description

- **Severity**: HIGH
- **Steps**:
  1. Fill name: "Precio Test Descripción"
  2. Fill description: "Testing con descripción"
  3. Submit
- **Expected**: `POST /api/price-types` → 201. Data saved correctly.

#### PRT-010 — Validate required name on create

- **Severity**: HIGH
- **Expected**: "Crear" button is DISABLED when name is empty. POST not called.

#### PRT-011 — Validate duplicate name

- **Severity**: MEDIUM
- **Steps**:
  1. Try to create with existing name "Base"
- **Expected**: `POST` → 409 Conflict. Error toast shown. Form preserved.

#### PRT-012 — Cancel create returns to list

- **Severity**: LOW
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/price-types`. No new type created.

---

### DETAILS

#### PRT-013 — View price type details

- **Severity**: HIGH
- **URL**: `/price-types/{id}`
- **Expected**: Shows: name (heading), estado (Activo/Inactivo), description, created & updated dates. `GET /api/price-types/{id}` → 200.

#### PRT-014 — Details shows description if present

- **Severity**: MEDIUM
- **Expected**: Description section visible.

#### PRT-015 — Details for inactive type

- **Severity**: MEDIUM
- **Steps**:
  1. Navigate to an inactive price type detail
- **Expected**: "Inactivo" status displayed.

#### PRT-016 — Navigate from details to edit

- **Severity**: HIGH
- **Steps**:
  1. Click "Editar"
- **Expected**: Navigates to `/price-types/{id}/edit`. Form pre-filled.

---

### EDIT

#### PRT-017 — Edit price type name

- **Severity**: CRITICAL
- **Steps**:
  1. Change name to "Precio Editado Test"
  2. Submit
- **Expected**: `PUT /api/price-types/{id}` → 200. Name updated. Redirected to list.

#### PRT-018 — Toggle active/inactive

- **Severity**: HIGH
- **Steps**:
  1. Toggle active switch off
  2. Submit
- **Expected**: `PUT` → 200. Type shows "Inactivo" in list. 3. Toggle back on
- **Expected**: Restored to active.

#### PRT-019 — Edit duplicate name validation

- **Severity**: MEDIUM
- **Steps**:
  1. Change name to another existing name
- **Expected**: `PUT` → 409 Conflict. Error shown.

#### PRT-020 — Cancel edit returns to list

- **Severity**: LOW
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/price-types` without changes.

---

### DELETE

#### PRT-021 — Delete unused price type

- **Severity**: HIGH
- **Prerequisites**: Type has 0 products assigned
- **Steps**:
  1. Click delete icon
  2. Confirm dialog
- **Expected**: `DELETE /api/price-types/{id}` → 204. Type removed from list.

#### PRT-022 — Delete price type in use — blocked

- **Severity**: HIGH
- **Prerequisites**: Type assigned to products (e.g., "Base")
- **Steps**:
  1. Try to delete "Base" type
- **Expected**: `DELETE` → 409 Conflict. Error: "Tipo de precio está en uso por productos" or similar.

#### PRT-023 — Cancel delete dialog

- **Severity**: LOW
- **Steps**:
  1. Click delete
  2. Click "Cancelar"
- **Expected**: Dialog closes. Type NOT deleted.

#### PRT-024 — Delete button hidden for OPERATOR

- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **Expected**: Delete button hidden or disabled.

---

### PERMISSIONS & ERROR HANDLING

#### PRT-025 — 404 for non-existent price type details

- **Severity**: MEDIUM
- **URL**: `/price-types/00000000-0000-0000-0000-000000000000`
- **Expected**: `GET` → 404. Error shown.

#### PRT-026 — 404 for editing non-existent type

- **Severity**: MEDIUM
- **URL**: `/price-types/00000000-0000-0000-0000-000000000000/edit`
- **Expected**: Error shown, redirect.

#### PRT-027 — Session timeout / 401 handling

- **Severity**: MEDIUM
- **URL**: `/price-types`
- **Steps**:
  1. Clear token
  2. Navigate to `/price-types`
- **Expected**: Redirected to login.

#### PRT-028 — OPERATOR cannot create/edit

- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **URL**: `/price-types/new`
- **Expected**: Create button hidden or 403 if attempting POST.
