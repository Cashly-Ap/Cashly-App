# Reports (Reportes) — Test Plan

> **Module**: Reports
> **Business Module**: `SALES`
> **Routes**: `/reports` (list), `/reports/:type`
> **API Base**: `/api/reports`
> **Total Tests**: 30

---

## Test Execution Log

| Date | Tests Executed | Pass | Fail | Blocked |
| ---- | -------------- | ---- | ---- | ------- |

---

## Test Cases

---

### SETUP

#### REP-001 — Route loads correctly

- **Severity**: CRITICAL
- **URL**: `/reports`
- **Prerequisites**: Logged in with MODULE_SALES (admin@cashly.com)
- **Steps**:
  1. Navigate to `/reports`
  2. Wait for page to load
  3. Check for console errors
- **Expected**: Page loads without errors. Title "Reportes" visible. Report categories listed.

#### REP-002 — Permission denied for non-SALES user

- **Severity**: CRITICAL
- **Prerequisites**: User without MODULE_SALES
- **Expected**: 403 or redirect.

---

### REPORT LISTING

#### REP-003 — Report categories displayed

- **Severity**: HIGH
- **Expected**: Categories: Ventas, Financieros, Inventario, Clientes, Proveedores.

#### REP-004 — Reports per category

- **Severity**: HIGH
- **Expected**: Sales: Invoices, Quotes, Payments. Financial: Credit Notes, Debit Notes, Receivables, Cash Register. Inventory: Stock, Movements. Customers: List, Aging. Suppliers: List, Purchases.

#### REP-005 — Click report opens filter page

- **Severity**: HIGH
- **Steps**:
  1. Click "Facturas" report
- **Expected**: Navigated to `/reports/invoices`. Filter form visible.

---

### REPORT FILTERS

#### REP-006 — Date range filter

- **Severity**: HIGH
- **Steps**:
  1. Set dateFrom and dateTo
  2. Click "Generar"
- **Expected**: `GET /api/reports/invoices/pdf?dateFrom=...&dateTo=...` → 200.

#### REP-007 — Date range validation

- **Severity**: MEDIUM
- **Steps**:
  1. Set dateFrom > dateTo
- **Expected**: Validation error. Cannot generate.

#### REP-008 — Status filter

- **Severity**: MEDIUM
- **Steps**:
  1. Set status filter
- **Expected**: API `?status=PAID` → 200.

#### REP-009 — Customer filter

- **Severity**: MEDIUM
- **Steps**:
  1. Select customer
- **Expected**: API filtered.

#### REP-010 — Report mode selection

- **Severity**: MEDIUM
- **Steps**:
  1. Select "Detallado" vs "Resumido"
- **Expected**: PDF content changes accordingly.

#### REP-011 — Reset filters

- **Severity**: LOW
- **Steps**:
  1. Click "Limpiar Filtros"
- **Expected**: All fields reset to defaults.

---

### PDF GENERATION

#### REP-012 — Generate invoice report PDF

- **Severity**: HIGH
- **Steps**:
  1. Configure filters
  2. Click "Generar PDF"
- **Expected**: PDF downloaded. Content matches filters. Headers: company logo, title, date range. Table with invoice data. Totals at bottom.

#### REP-013 — Generate quotes report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/quotes/pdf` → 200.

#### REP-014 — Generate payments report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/payments/pdf` → 200.

#### REP-015 — Generate credit notes report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/credit-notes/pdf` → 200.

#### REP-016 — Generate debit notes report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/debit-notes/pdf` → 200.

#### REP-017 — Generate receivables aging report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/receivables/aging/pdf` → 200.

#### REP-018 — Generate cash register report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/cash-register/pdf` → 200.

#### REP-019 — Generate purchases report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/purchases/pdf` → 200.

#### REP-020 — Generate returns report PDF

- **Severity**: HIGH
- **Expected**: `GET /api/reports/returns/pdf` → 200.

---

### PDF QUALITY

#### REP-021 — PDF includes company info

- **Severity**: MEDIUM
- **Expected**: Logo, company name, RFC, address.

#### REP-022 — PDF includes generation date/time

- **Severity**: LOW
- **Expected**: "Generado el: {date}" footer.

#### REP-023 — PDF includes totals and summaries

- **Severity**: MEDIUM
- **Expected**: Subtotal, tax, total. Summary section.

#### REP-024 — PDF includes filters applied

- **Severity**: LOW
- **Expected**: "Período: {dateFrom} - {dateTo}" header.

---

### SINGLE DOCUMENT PDF

#### REP-025 — Single invoice PDF

- **Severity**: HIGH
- **URL**: `/invoices/{id}`
- **Steps**:
  1. Click PDF button
- **Expected**: `GET /api/reports/invoices/{id}/pdf` → 200. Single invoice layout.

#### REP-026 — Invoice PDF shows line items

- **Severity**: MEDIUM
- **Expected**: Table with product code, description, qty, price, total.

---

### DASHBOARD

#### REP-027 — Dashboard loads (if exists)

- **Severity**: MEDIUM
- **URL**: `/reports/dashboard`
- **Expected**: KPI cards: today sales, month sales, pending invoices, overdue.

#### REP-028 — Dashboard charts

- **Severity**: LOW
- **Expected**: Sales trend chart, aging chart.

---

### PERMISSIONS & ERRORS

#### REP-029 — 401 handling

- **Severity**: MEDIUM
- **Expected**: Clear token -> redirect login.

#### REP-030 — Report generation without filters

- **Severity**: MEDIUM
- **Steps**:
  1. Click "Generar" without filters
- **Expected**: Defaults to current month or all. PDF generated.
