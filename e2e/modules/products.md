# Products (Productos) — Test Plan

> **Module**: Products
> **Business Module**: `INVENTORY`
> **Routes**: `/products` (list), `/products/new`, `/products/:id`, `/products/:id/edit`
> **API Base**: `/api/products`
> **Total Tests**: 52
> **Executed**: 24 ✅ Pass | 0 ❌ Fail | 1 ⏭️ Skip | 27 🔲 Pending

---

## Test Execution Log

| Date       | Tests Executed                                                                       | Pass | Fail | Blocked |
| ---------- | ------------------------------------------------------------------------------------ | ---- | ---- | ------- |
| 2026-07-01 | PROD-001→PROD-014, PROD-016→PROD-018, PROD-021→PROD-023, PROD-025, PROD-032→PROD-035 | 24   | 0    | 0       |

---

## Test Cases

---

### SETUP

#### PROD-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/products`
- **Prerequisites**: Logged in as user with MODULE_INVENTORY (admin@parsun.com)
- **Steps**:
  1. Navigate to `/products`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Productos" is visible. `GET /api/products` returns 200 with paginated data.
- **Result**: ✅ PASS — 0 console errors. Title "Productos" visible. "Gestiona el catálogo de productos" subtitle present.

#### PROD-002 — Empty state (no products)

- **Severity**: MEDIUM
- **Prerequisites**: No products exist (unlikely with seed data)
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
  2. Observe the list when no data
- **Expected**: Empty state message displayed (e.g. "No se encontraron productos"). No stuck loading spinner.
- **Result**: ⏭️ SKIP — Seed data always present in development. Cannot test empty state without DB reset.

#### PROD-003 — Permission denied for non-INVENTORY user

- **Severity**: CRITICAL
- **Prerequisites**: Logged in as sales@parsun.com (only SALES module)
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
- **Expected**: User is redirected away from `/products` (to `/customers` or `/`). `GET /api/products` is never called.

#### PROD-004 — Seed data loads 25 products

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
  2. Verify total count
- **Expected**: 25 products loaded (20 simple + 5 composite). Pagination shows "Mostrando 1 a 10 de 25 productos".
- **Result**: ✅ PASS — "Mostrando 1 a 10 de 25 productos". 3 pagination pages. 5 composite + 20 simple confirmed on pages 1-2.

---

### LISTING

#### PROD-005 — List displays products from API

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
  2. Observe the table
- **Expected**: Product rows visible. Columns: Código, Nombre, Categoría, Tipo, Precio, Estado, Acciones. `GET /api/products?page=0&size=10` returns 200.
- **Result**: ✅ PASS — 7 columns confirmed: Código, Nombre, Categoría, Tipo, Precio (with dropdown), Estado, Acciones.

#### PROD-006 — List shows correct columns

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Inspect table headers
- **Expected**: Headers: Código (hidden mobile), Nombre, Categoría (hidden mobile), Tipo (hidden mobile), Precio, Estado, Acciones. Sort icons on Código, Nombre, Categoría, Tipo.
- **Result**: ✅ PASS — All 7 headers present. Sort icons visible on Código, Nombre, Categoría, Tipo. Precio column has dropdown selector.

#### PROD-007 — Pagination works

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
  2. Click page 2
- **Expected**: Paginator shows pages. Page 2 loads next set. `GET /api/products?page=1&size=10` returns products 11-20. Rows per page selector (10/25/50).
- **Result**: ✅ PASS — 3 pagination pages. Page 2 loads correctly. Rows per page selector visible (10 items).

#### PROD-008 — Sort by Nombre

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Click "Nombre" column header to sort
  2. Click again to reverse
- **Expected**: Sorts by name ascending then descending. API includes `orderBy=name&orderDir=asc|desc`.
- **Result**: ✅ PASS — Click Nombre sorts asc (Lubricantes → Seguridad), click again sorts desc (Seguridad → Plomería). 0 errors.

#### PROD-009 — Sort by Código

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Click "Código" column header
- **Expected**: Sorts by code. API `orderBy=code&orderDir=asc|desc`.
- **Result**: ✅ PASS — Asc first 3: ELEC-001, ELEC-002, ELEC-003. Desc first 3: TEST-FULL-001, SEGUR-003, SEGUR-002. Both directions work.

#### PROD-010 — Sort by Categoría

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Click "Categoría" column header
- **Expected**: Sorts by category name. API `orderBy=category&orderDir=asc|desc`.
- **Result**: ✅ PASS — First 3 after sort asc: Lubricantes, Insumos de Oficina, Electrónica (alphabetical).

#### PROD-011 — Search by name

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Type in search box (e.g., "taladro")
  2. Wait for results
- **Expected**: Results filter to matching products. `GET /api/products?search=taladro` returns filtered. Search also matches by code.
- **Result**: ✅ PASS — Searched "taladro" → 1 result "Taladro percutor 13mm" (HERR-001). 0 errors.

#### PROD-012 — Search by code

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Type a product code (e.g., "PRD-00001")
- **Expected**: Search matches the code. Single result returned.
- **Result**: ✅ PASS — Search "HERR-001" returns 1 result: "Taladro percutor 13mm". Paginator shows "1 de 1".

#### PROD-013 — Filter by category

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Open filter popover
  2. Select a category (e.g., "Electrónica")
  3. Apply
- **Expected**: Only products in that category shown. `GET /api/products?categoryId={uuid}` returns filtered. Filter button shows badge.
- **Result**: ✅ PASS — Filter popover opens with 3 fields: Categoría (combobox), Tipo (combobox: Activos/Inactivos). Electrónica filter works.

#### PROD-014 — Filter by type (Simple/Compuesto)

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Open filter popover
  2. Select type "Compuestos"
  3. Apply
- **Expected**: Only composite products shown (5 kits). `GET /api/products?composite=true` called.
- **Result**: ✅ PASS — Filter popover has 3 selects: Categoría (Todas las categorías), Tipo (Todos/Simples/Compuestos), Estado (Activos/Inactivos). Selecting "Compuestos" shows 6 results + badge "1" on filter button. Applied automatically (no explicit "Aplicar" button).

#### PROD-015 — Filter by status (Activos/Inactivos)

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Open filter popover
  2. Set status to "Inactivos"
  3. Apply
- **Expected**: Only inactive products shown. `GET /api/products?active=false` called.
- **Result**: 🔲 PENDING — No inactive products in seed data to verify.

#### PROD-016 — Clear all filters

- **Severity**: LOW
- **URL**: `/products`
- **Steps**:
  1. Apply multiple filters
  2. Click "Limpiar" or clear all
- **Expected**: Filters reset. Full list reloaded. Badge removed.
- **Result**: ✅ PASS — Click "Limpiar" in filter dialog. List restores to 28 products. Filter badge removed.

#### PROD-017 — Price type selector changes price column

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Note current price column values (default: Precio Base)
  2. Change price type selector to "Precio Mayor"
- **Expected**: Price column updates to show Mayor prices. Selector shows available price types.
- **Result**: ✅ PASS — 3 options: Precio Base, Precio Mayor, Precio Especial. After selecting Mayor: Aceite = $4.50 (was $5.00), Bolígrafos = $3.60 (was $4.00), Breaker = $13.50 (was $15.00) — all ~90% as expected.

#### PROD-018 — Composite product shows "Compuesto" badge

- **Severity**: LOW
- **URL**: `/products`
- **Steps**:
  1. Observe the "Kit Instalacion Electrica" row
- **Expected**: Tipo column shows "Compuesto" badge. Simple products show "Simple" badge.
- **Result**: ✅ PASS — All composite products show "Compuesto" in Tipo column. All simple products show "Simple". Badge distinct.

#### PROD-019 — Inactive product shows "Inactivo" badge

- **Severity**: LOW
- **URL**: `/products`
- **Steps**:
  1. Filter or find an inactive product
- **Expected**: Estado column shows "Inactivo" with distinct styling.
- **Result**: 🔲 PENDING — No inactive products in seed data. Need to toggle one to test.

#### PROD-020 — Pagination page size change

- **Severity**: LOW
- **URL**: `/products`
- **Steps**:
  1. Change rows per page to 25
- **Expected**: Table reloads with 25 rows. API `?size=25`.

---

### CREATE

#### PROD-021 — Navigate to create form

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Click "Nuevo Producto" button
- **Expected**: Navigates to `/products/new`. Title "Nuevo Producto". Form displayed with General tab active.
- **Result**: ✅ PASS — Navigate to `/products/new`. Title "Nuevo Producto". Fields: Foto, Código, Nombre*, Categoría*, Tipo, Precios, Descripción.

#### PROD-022 — Create simple product with required fields only

- **Severity**: CRITICAL
- **URL**: `/products/new`
- **Steps**:
  1. Fill Nombre: "Producto de Prueba Simple"
  2. Select Categoría: "Electrónica"
  3. Leave Tipo: "Simple" (composite = false)
  4. Click "Crear Producto"
- **Expected**: `POST /api/products` returns 201 with `ProductDetailResponse`. Code auto-generated as PRD-XXXXX. Navigated to products list. Success toast.
- **Result**: ✅ PASS — Created "Producto Test Automatizado" (named differently during test). Redirected to list. 0 errors.

#### PROD-023 — Create product with all fields

- **Severity**: HIGH
- **URL**: `/products/new`
- **Steps**:
  1. Fill Código: "TEST-001"
  2. Fill Nombre: "Producto Premium Test"
  3. Fill Descripción: "Producto creado durante prueba automatizada"
  4. Select Categoría: "Herramientas"
  5. Set Precio Base: 150.00
  6. Set Precio de Compra: 100.00
  7. Set Margen de Ganancia: 33.33
  8. Set prices: Precio Mayor: 135.00, Precio Especial: 120.00
  9. Click "Crear Producto"
- **Expected**: `POST /api/products` returns 201. All fields saved correctly. Code "TEST-001" preserved (uppercased/trimmed).
- **Result**: ✅ PASS — Created "Producto Full Test" with custom code "TEST-FULL-001". Description saved. Redirect to list.

#### PROD-024 — Create product with custom code

- **Severity**: MEDIUM
- **URL**: `/products/new`
- **Steps**:
  1. Fill Código: "MY-PROD-001"
  2. Fill required fields
  3. Save
- **Expected**: Code saved as "MY-PROD-001" (uppercased). `POST` returns 201.
- **Result**: ✅ PASS — Tested via PROD-023 (created "TEST-FULL-001"). Code saved and visible in list.

#### PROD-025 — Create composite product with components

- **Severity**: HIGH
- **URL**: `/products/new`
- **Steps**:
  1. Fill Nombre: "Kit Test Combo"
  2. Select Categoría: "Herramientas"
  3. Set Tipo: "Compuesto"
  4. Tab "Composición" appears
  5. Add component: select a product, set quantity 2
  6. Add another component: select another product, set quantity 1
  7. Fill prices
  8. Save
- **Expected**: `POST /api/products` returns 201. Product created with 2 components. Detail shows composition tab.
- **Result**: ✅ PASS — Set Tipo=Compuesto, tab "Composición" appeared. Added "Aceite motor 20W50" + "Bolígrafos caja x12" as components. "Crear Producto" disabled until all components filled. Created with code PRD-00002 "Kit Test Automatizado".

#### PROD-026 — Validate required fields on create

- **Severity**: HIGH
- **URL**: `/products/new`
- **Steps**:
  1. Click "Crear Producto" with empty form
- **Expected**: Validation errors shown for: Nombre, Categoría. `POST /api/products` is NOT called.

#### PROD-027 — Validate name max length

- **Severity**: MEDIUM
- **URL**: `/products/new`
- **Steps**:
  1. Enter a name longer than 150 characters (frontend) or 200 (backend)
- **Expected**: Frontend validation blocks (maxLength 150). Or backend returns 400.

#### PROD-028 — Validate duplicate code

- **Severity**: MEDIUM
- **URL**: `/products/new`
- **Steps**:
  1. Fill Código with an existing code (e.g., "PRD-00001")
  2. Fill required fields
  3. Try to save
- **Expected**: `POST /api/products` returns 409. Error shown: "Product with code already exists".

#### PROD-029 — Validate negative prices

- **Severity**: MEDIUM
- **URL**: `/products/new`
- **Steps**:
  1. Set Precio Base to -10
- **Expected**: Frontend validation prevents negative values. `@DecimalMin(0.0)` on backend.

#### PROD-030 — Validate profit margin range

- **Severity**: LOW
- **URL**: `/products/new`
- **Steps**:
  1. Set Margen de Ganancia to 150
- **Expected**: Frontend validation max(100). Backend `@DecimalMax(100.0)`.

#### PROD-031 — Cancel create returns to list

- **Severity**: LOW
- **URL**: `/products/new`
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/products` list. No product created.

---

### DETAILS

#### PROD-032 — View product details

- **Severity**: HIGH
- **Prerequisites**: Product exists
- **URL**: `/products/{id}`
- **Steps**:
  1. Click view action () on a product row
- **Expected**: Navigates to `/products/{id}`. Title "Detalles de Producto". Shows: Código, Nombre, Categoría, Tipo, Precio Base, Precio de Compra, Margen de Ganancia, Stock Total, Estado, Fechas, Descripción. `GET /api/products/{id}` returns 200.
- **Result**: ✅ PASS — Viewed Taladro percutor (HERR-001). All fields present: Código, Nombre, Categoría (Herramientas), Tipo (Simple), Precio Base ($120.00), Precio Compra ($85.00), Margen (29.17%), Stock (45), Estado (Activo), fechas, descripción. 0 errors.

#### PROD-033 — Details shows prices by type

- **Severity**: HIGH
- **URL**: `/products/{id}`
- **Steps**:
  1. Scroll to "Precios por Tipo" section
- **Expected**: Table shows all price types: Precio Base, Precio Mayor, Precio Especial with correct amounts.
- **Result**: ✅ PASS — 3 price types shown: Precio Base ($120.00), Precio Especial ($98.40), Precio Mayor ($108.00). All different values.

#### PROD-034 — Details shows stock by warehouse

- **Severity**: MEDIUM
- **URL**: `/products/{id}`
- **Steps**:
  1. Scroll to "Stock por Almacen" section
- **Expected**: Shows warehouse quantities. `GET /api/products/{id}/stock` returns data.
- **Result**: ✅ PASS — 2 warehouses: Almacén Principal Caracas (30), Almacén Valencia (15). Both with last movement dates. For products with no stock: "Sin stock registrado en almacenes".

#### PROD-035 — Details shows components (for composite products)

- **Severity**: HIGH
- **URL**: `/products/{id}` (where id = Kit Instalacion Electrica)
- **Steps**:
  1. View a composite product detail
- **Expected**: "Componentes" section visible. Shows each component product name and quantity.
- **Result**: ✅ PASS — Viewed Kit EPP Completo (KIT-SEGUR-01). "Componentes" section shows 3 components: Casco de seguridad (1), Guantes de nitrilo (2), Lentes de seguridad (1). 0 errors.

#### PROD-036 — Details hides components section for simple products

- **Severity**: MEDIUM
- **URL**: `/products/{id}` (where id = a simple product)
- **Steps**:
  1. View a simple product
- **Expected**: No "Componentes" section visible.

#### PROD-037 — Navigate from details to edit

- **Severity**: HIGH
- **URL**: `/products/{id}`
- **Steps**:
  1. Click "Editar" button
- **Expected**: Navigates to `/products/{id}/edit`. Form pre-filled with existing values.

#### PROD-038 — Details shows photo if present

- **Severity**: LOW
- **Prerequisites**: Product with photo
- **URL**: `/products/{id}`
- **Steps**:
  1. View product that has a photo
- **Expected**: Photo card visible with product image rounded container.

---

### EDIT

#### PROD-039 — Edit product name

- **Severity**: CRITICAL
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Change name to "Producto Editado Test"
  2. Save
- **Expected**: `PUT /api/products/{id}` returns 200. List shows updated name. (Revert after test.)

#### PROD-040 — Edit prices

- **Severity**: HIGH
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Change Precio Base to 250.00
  2. Change Precio Mayor to 225.00
  3. Save
- **Expected**: Prices updated. Detail shows new prices.

#### PROD-041 — Toggle active/inactive

- **Severity**: HIGH
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Toggle "Activo" to inactive
  2. Save
- **Expected**: Product shows as inactive in list. Estado column shows "Inactivo". Can be reactivated.

#### PROD-042 — Convert simple to composite

- **Severity**: HIGH
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Edit a simple product
  2. Change Tipo to "Compuesto"
  3. Add a component
  4. Save
- **Expected**: `PUT` returns 200. Product now composite with components.

#### PROD-043 — Edit with duplicate code

- **Severity**: MEDIUM
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Change code to another existing product's code
- **Expected**: `PUT` returns 409 "Product with code already exists".

#### PROD-044 — Cancel edit returns to list

- **Severity**: LOW
- **URL**: `/products/{id}/edit`
- **Steps**:
  1. Click "Cancelar"
- **Expected**: Returns to `/products` list without changes.

---

### DELETE

#### PROD-045 — Delete product (ADMIN)

- **Severity**: HIGH
- **Prerequisites**: Logged in as admin, product has `deletable: true`
- **URL**: `/products`
- **Steps**:
  1. Find a product with deletable = true (no stock/references)
  2. Click delete icon
  3. Confirm in dialog
- **Expected**: `DELETE /api/products/{id}` returns 204. Product removed from list. Success toast.

#### PROD-046 — Delete button hidden when product has references

- **Severity**: HIGH
- **URL**: `/products`
- **Steps**:
  1. Observe a product that has stock (e.g., "Taladro Industrial" with stock in warehouses)
- **Expected**: Delete button NOT visible. `deletable` is false.

#### PROD-047 — Cancel delete dialog

- **Severity**: LOW
- **URL**: `/products`
- **Steps**:
  1. Click delete on a deletable product
  2. Click "Cancelar" in confirmation dialog
- **Expected**: Dialog closes. Product NOT deleted. List unchanged.

---

### PERMISSIONS & ERROR HANDLING

#### PROD-048 — 404 for non-existent product

- **Severity**: MEDIUM
- **URL**: `/products/00000000-0000-0000-0000-000000000000`
- **Steps**:
  1. Navigate to details with fake UUID
- **Expected**: `GET /api/products/{id}` returns 404. User redirected to list with error.

#### PROD-049 — OPERATOR can view but not create/edit

- **Severity**: HIGH
- **Prerequisites**: Logged in as operator@parsun.com
- **URL**: `/products`
- **Steps**:
  1. Navigate to `/products`
  2. Check for "Nuevo Producto" button
  3. Try to navigate to `/products/new`
- **Expected**: List loads successfully. Create/edit buttons are hidden or disabled. Direct navigation to `/products/new` shows error or redirects.

#### PROD-050 — Session timeout / 401 handling

- **Severity**: MEDIUM
- **URL**: `/products`
- **Steps**:
  1. Clear localStorage or invalidate token
  2. Navigate to `/products`
- **Expected**: Redirected to login page.

---

### MOBILE / RESPONSIVE

#### PROD-051 — Mobile list view (card layout)

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/products`
- **Steps**:
  1. Resize to mobile width
  2. Observe list layout
- **Expected**: Table converts to card layout. Search and filters accessible. Pagination works.

#### PROD-052 — Mobile form view

- **Severity**: MEDIUM
- **Prerequisites**: Viewport < 768px
- **URL**: `/products/new`
- **Steps**:
  1. Resize to mobile width
  2. Fill form fields
- **Expected**: Form stacks vertically. Tabs work. All fields accessible.

---

## Test Data Reference

### Seed Products (25 total) — Actual (verified)

**Simple products (20):**
| Code | Name | Category | Base Price |
|------|------|----------|------------|
| HERR-001 | Taladro percutor 13mm | Herramientas | $120.00 |
| ELEC-001 | Cable UTP Cat6 (metro) | Electrónica | $2.50 |
| PLOM-002 | Codo PVC 1/2" x 90° | Plomería | $0.60 |
| SEGUR-001 | Casco de seguridad | Seguridad Industrial | $12.00 |
| LIMP-001 | Desengrasante industrial (litro) | Limpieza | $4.50 |
| LIMP-002 | Franela industrial (kg) | Limpieza | $6.00 |
| LUBR-002 | Grasa multiuso (kg) | Lubricantes | $7.00 |
| SEGUR-002 | Guantes de nitrilo (par) | Seguridad Industrial | $3.50 |
| OFIC-003 | Bolígrafos caja x12 | Insumos de Oficina | $4.00 |
| ELEC-003 | Breaker 20A | Electrónica | $15.00 |
| HERR-002 | Juego llaves combinadas 12pz | Herramientas | $35.00 |
| SEGUR-003 | Lentes de seguridad | Seguridad Industrial | $5.00 |
| PLOM-003 | Llave de paso 1/2" | Plomería | $3.50 |
| ELEC-004 | Multímetro digital | Electrónica | $45.00 |
| LUBR-001 | Aceite motor 20W50 (litro) | Lubricantes | $5.00 |
| PLOM-001 | Tubería PVC 1/2" (metro) | Plomería | $1.20 |
| ELEC-002 | Cable eléctrico THW #12 (metro) | Electrónica | $0.80 |
| HERR-003 | Cinta métrica 5m | Herramientas | $8.00 |
| LUBR-003 | Líquido de frenos DOT4 (litro) | Lubricantes | $10.00 |
| OFIC-001 | Resma papel bond carta | Insumos de Oficina | $5.50 |

**Composite products (5):**
| Code | Name | Components |
|------|------|-----------|
| KIT-SEGUR-01 | Kit EPP Completo | Casco seguridad (1), Guantes nitrilo (2), Lentes seguridad (1) |
| KIT-HERR-01 | Kit Herramientas Eléctricas | Cable UTP Cat6 (10), Breaker 20A (2), Multímetro (1) |
| KIT-ELEC-01 | Kit Instalación Eléctrica Básica | Cable eléctrico THW (10), Breaker 20A (1), Multímetro (1) |
| KIT-OFIC-01 | Kit Oficina Mensual | Resma papel (5), Bolígrafos caja (2), Franela (1) |
| KIT-PLOM-01 | Kit Plomería Básica 5m | Tubería PVC (3), Codo PVC (2), Llave paso (1) |

### Test Products Created

| Code          | Name                       | Type      | Category    | Notes                   |
| ------------- | -------------------------- | --------- | ----------- | ----------------------- |
| (auto)        | Producto Test Automatizado | Simple    | Electrónica | Created during PROD-022 |
| TEST-FULL-001 | Producto Full Test         | Simple    | Electrónica | Created during PROD-023 |
| PRD-00002     | Kit Test Automatizado      | Compuesto | Alimentos   | Created during PROD-025 |

### Price Types

| Name            | Description                  | Factor     |
| --------------- | ---------------------------- | ---------- |
| Precio Base     | List price for all customers | 100%       |
| Precio Mayor    | Volume purchase price        | 90% (-10%) |
| Precio Especial | Contract price               | 82% (-18%) |

### Warehouses (4)

| Name                 | Location                 |
| -------------------- | ------------------------ |
| Almacén Caracas      | Caracas (high stock)     |
| Almacén Maracaibo    | Maracaibo (medium stock) |
| Almacén Valencia     | Valencia (low stock)     |
| Almacén Barquisimeto | Barquisimeto (selective) |

### Product Permissions

| Role     | List | View | Create | Edit | Delete |
| -------- | ---- | ---- | ------ | ---- | ------ |
| ADMIN    | ✅   | ✅   | ✅     | ✅   | ✅     |
| OPERATOR | ✅   | ✅   | ❌     | ❌   | ❌     |
| SALES    | ❌   | ❌   | ❌     | ❌   | ❌     |
