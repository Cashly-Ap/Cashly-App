# Reporting

## Overview

Reporting is distributed across the features that own the underlying data. Each owner exposes its own PDF modal/components and API service under a `reporting/` folder. Reports open from the main menu as dialogs; there are no per-report routes.

**Module Type**: `Read-only`

---

## Report Ownership

| Report                  | Owner feature                              | Menu action                 |
| ----------------------- | ------------------------------------------ | --------------------------- |
| Quotes PDF              | `sales/quotes/reporting`                   | Reporte de Presupuestos PDF |
| Orders PDF              | `sales/orders/reporting`                   | Reporte de Pedidos PDF      |
| Purchases PDF           | `procurement/purchases/reporting`          | Reporte de Compras PDF      |
| Products PDF            | `catalog/products/reporting`               | Reporte de Productos PDF    |
| Commercial catalog PDF  | `catalog/products/reporting`               | Catálogo Comercial PDF      |
| Stock report            | `inventory/warehouses/reporting`           | Stock                       |
| Movements report        | `inventory/warehouses/reporting`           | Movimientos                 |
| Invoices PDF            | `finance/billing/invoices/reporting`       | Reporte de Facturas PDF     |
| Cash-register reports   | `finance/treasury/cash-register/reporting` | Reportes de Caja            |
| Accounts receivable PDF | `finance/treasury/receivables/reporting`   | Cuentas por Cobrar PDF      |
| Payment reports         | `finance/treasury/payments/reporting`      | —                           |

`analytics/reporting/routing` is a reserved composition layer; it currently contains no routes. Reports are launched through menu callbacks defined in `src/app/core/layouts/config/menu.config.ts`.

---

## Structure

```
src/app/features/<area>/<feature>/reporting/
├── components/               # Report action and PDF modal components
├── models/                   # Filter and payload interfaces
└── services/
    ├── api/                  # PDF (and Excel, where available) API services
    └── application/          # Report orchestration (where needed)
```

---

## Rules

- Every report is PDF-only unless the owner also exposes an Excel endpoint (stock and movements).
- Report actions are guarded by the owning module permission and an explicit report action code such as `REPORT_QUOTES`, `REPORT_ORDERS`, or `REPORT_STOCK`.
- The API returns `application/pdf` (or spreadsheet content); the browser download is triggered from a blob URL.
- Filters that scope data (customer, date range, warehouse) are sent to the API; the API remains the source of truth for authorization and totals.

---

## Related Documentation

- [Modules index](./README.md)
- [Architecture](../ARCHITECTURE.md)
