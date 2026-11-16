# Dashboard Module

## Overview

The Dashboard is a read-only analytics page that summarizes operational indicators: monthly sales, pending orders, overdue receivables, low-stock products, sales trends, top products/customers, recent activity, and invoice due schedules.

**Module Type**: `Display-only`

---

## Module Structure

```
src/app/features/analytics/dashboard/
├── i18n/                     # Translations
├── pages/                    # Dashboard page
├── permissions/              # Permission constants
└── services/                 # Dashboard API service
```

---

## Routes

| Route                  | Page                     |
| ---------------------- | ------------------------ |
| `/analytics/dashboard` | `DashboardPageComponent` |

Legacy `/dashboard` redirects to `/analytics/dashboard`. The route requires `authGuard` and the `DASHBOARD` business module permission.

---

## Features

- Summary metric cards: monthly sales, pending orders, overdue receivables, low-stock products
- Monthly sales bar/line charts with locale-aware formatting
- Top products and top customers horizontal bar charts
- Invoice due schedule chart
- Recent activity table
- Theme-aware chart palette and responsive layout
- `OnPush` change detection and Signals for page state

---

## Data Models

```typescript
export interface DashboardSummary {
  monthlySales: number;
  pendingOrders: number;
  overdueReceivables: number;
  lowStockProducts: number;
}

export interface MonthlySales {
  month: string;
  total: number;
}

export interface TopItem {
  id: string;
  name: string;
  total: number;
}

export interface RecentActivity {
  type: string;
  id: string;
  number: string;
  customer: string;
  amount: number;
  created_at: string;
}

export interface InvoiceDue {
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  dueDate: string;
  amount: number;
}
```

---

## API Endpoints

Base URL: `/api/dashboard`

| Method | Endpoint                              | Response                         |
| ------ | ------------------------------------- | -------------------------------- |
| GET    | `/api/dashboard/summary`              | `DashboardSummary`               |
| GET    | `/api/dashboard/monthly-sales`        | `MonthlySales[]`                 |
| GET    | `/api/dashboard/top-products`         | `TopItem[]` (`limit`, default 5) |
| GET    | `/api/dashboard/top-customers`        | `TopItem[]` (`limit`, default 5) |
| GET    | `/api/dashboard/recent-activity`      | `RecentActivity[]`               |
| GET    | `/api/dashboard/invoice-due-schedule` | `InvoiceDue[]`                   |

---

## Business Rules

1. The dashboard is read-only; no create, edit, or delete actions.
2. Data is fetched on page initialization from the API (no mock data).
3. Access is guarded by authentication and the `DASHBOARD` business module.
4. Chart colors follow the light/dark theme and user preferences.
5. Monetary values are formatted with the active locale.

---

## Related Modules

- [Invoices](./invoices.md) - Invoice due schedule source
- [Orders](./orders.md) - Pending order indicators
- [Receivables](./receivables.md) - Overdue receivables
- [Warehouses](./warehouses.md) - Low-stock indicators
