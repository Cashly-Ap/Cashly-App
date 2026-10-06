# Test Sprite Protocol — Cashly

> Master protocol for exploratory integration testing assisted by Gabriel-Orchestrator.
> Version: 1.0

---

## 1. Philosophy

**Test Sprite** is an exploratory testing agent that navigates the application as a real user would, with the ability to inspect the DOM, network calls, application state, and database. It is not a rigid automated test suite — it is a tester that adapts to what it finds.

## 2. Report Format

Each test is documented with this structure:

```
### [TEST-ID] — Test Name
- **Severity**: CRITICAL / HIGH / MEDIUM / LOW
- **Dependencies**: [list of test-ids that must pass first]
- **Prerequisites**: [required state before starting]
- **URL**: [page route]
- **Steps**:
  1. [action]
  2. [action]
- **Expected**: [what should happen]
- **Result**: ✅ PASS / ❌ FAIL / ⚠️ WARNING
- **Evidence**: [screenshot, network log, console log]
- **Root Cause (if FAIL)**: [why it failed]
```

## 3. Testing Cycle per Module

Each module follows this cycle:

```
[Setup] → [Listing] → [CRUD] → [Filters/Search] → [Empty States] → [Errors] → [Teardown]
```

### 3.1 Setup

- Navigate to the module
- Verify the route loads correctly
- Verify no console errors

### 3.2 Listing

- Verify expected columns
- Verify pagination (if applicable)
- Verify data loaded from API (status 200)

### 3.3 CRUD

- Test record creation
- Test record editing
- Test record deletion (if applicable)
- Verify changes persist after reload

### 3.4 Filters/Search

- Test filters for each available field
- Test filter combinations
- Test filter reset

### 3.5 Empty States

- Check what is displayed when there is no data
- Check what is displayed on connection error

### 3.6 Errors

- Submit invalid data
- Test insufficient permissions
- Test timeouts

## 4. Severity Categories

| Severity | Meaning                          | Action                         |
| -------- | -------------------------------- | ------------------------------ |
| CRITICAL | Prevents system usage            | Blocks release                 |
| HIGH     | Core functionality broken        | Requires fix before proceeding |
| MEDIUM   | Secondary functionality affected | Document and plan fix          |
| LOW      | Cosmetic or UX issue             | Document                       |

## 5. Execution Log

Each testing session is recorded in `e2e/reports/{module}-{date}.md` with:

- Start/end date and time
- Results summary (PASS/FAIL/WARNING by severity)
- List of executed tests with individual verdicts
- Evidence screenshots (in `e2e/reports/screenshots/`)
- Total execution time
- Issues found (for creation in GitHub/ClickUp)
- Estimated module coverage

## 6. Report Flow

```
1. Execute test → 2. Capture screenshot + network log
3. Issue verdict → 4. Document in report
5. If FAIL → investigate root cause
6. At module end → executive summary
```

## 7. Conventions

- Screenshots are saved as `{test-id}-{timestamp}.png`
- Relevant network logs are captured with `browser_network_requests`
- Console errors are captured with `browser_console_messages`
- Each test is independent (can fail without blocking others)
- Tests are executed in the order defined in the module plan

## 8. Modules to Test

- [x] Auth (Authentication & Account)
- [ ] Users (User Management)
- [ ] Customers (Clientes)
- [ ] Suppliers (Proveedores)
- [ ] Categories (Categorías)
- [ ] Price Types (Tipos de Precio)
- [ ] Products (Productos)
- [ ] Warehouses (Depósitos)
- [ ] Purchases (Compras)
- [ ] Orders (Pedidos)
- [ ] Quotes (Presupuestos)
- [ ] Invoices (Facturas)
- [ ] Reports (Reportes)
- [ ] Payment Methods (Métodos de Pago)
- [ ] Payments (Pagos)
- [ ] Credit Notes (Notas de Crédito)
- [ ] Debit Notes (Notas de Débito)
- [ ] Returns (Devoluciones)
- [ ] Cash Register (Caja)
- [ ] Receivables (Cuentas por Cobrar)
