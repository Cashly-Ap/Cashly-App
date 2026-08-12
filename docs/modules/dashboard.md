# Dashboard Module

## Overview

The Dashboard module provides a visual overview of key business metrics and recent activity. It displays sales statistics, charts, recent orders, and top products. This module is display-only and does not follow the standard CRUD pattern.

**Module Type**: `Display-only`

---

## Module Structure

```
src/app/features/dashboard/
├── pages/
│   ├── dashboard-page.component.ts
│   └── dashboard-page.component.html
└── index.ts
```

**Note**: This is a simple display-only module. No services, models, or validators needed since it currently uses mock data.

---

## Features

- **Sales Metrics Cards**: Total sales, new customers, products sold, monthly revenue
- **Sales Charts**: Monthly sales trend (line chart)
- **Category Distribution**: Sales by category (doughnut chart)
- **Revenue Analytics**: Weekly revenue (bar chart)
- **Annual Performance**: Monthly performance comparison (bar chart)
- **Recent Orders Table**: Latest orders with status
- **Top Products Table**: Best-selling products

---

## Pages

### Dashboard Page

**Route**: `/dashboard`

**Component**: `DashboardPageComponent`

**Purpose**: Main dashboard view displaying all metrics and charts.

**Features**:

- Sales metrics cards with icons and change indicators
- Interactive charts using PrimeNG Chart component
- Recent orders table with status badges
- Top products table with sales and revenue
- Responsive grid layout
- Dark mode support for charts

---

## Data Models

### Interfaces

#### SalesMetric

**Usage**: Metrics cards at the top of the dashboard

```typescript
interface SalesMetric {
  label: string; // Display label (e.g., "Ventas Totales")
  value: string; // Formatted value (e.g., "$3,628,250")
  change: string; // Change indicator (e.g., "+12.5%")
  icon: string; // PrimeNG icon class (e.g., "pi pi-dollar")
  iconColor: string; // Tailwind color classes
}
```

---

#### RecentOrder

**Usage**: Recent orders table

```typescript
interface RecentOrder {
  id: string; // Order ID (e.g., "#12453")
  customer: string; // Customer name
  product: string; // Product name
  amount: number; // Order total amount
  status: string; // Order status (e.g., "Entregado", "Pendiente")
}
```

---

#### TopProduct

**Usage**: Top products table

```typescript
interface TopProduct {
  name: string; // Product name
  sales: number; // Number of units sold
  revenue: number; // Total revenue from product
}
```

---

## Chart Data Structures

### Line Chart (Monthly Sales)

```typescript
salesData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [
    {
      label: 'Ventas',
      data: number[],
      borderColor: string,
      backgroundColor: string,
      tension: 0.4
    }
  ]
};
```

### Doughnut Chart (Category Sales)

```typescript
categoryData = {
  labels: string[],     // Category names
  datasets: [
    {
      data: number[],   // Sales per category
      backgroundColor: string[]
    }
  ]
};
```

### Bar Chart (Weekly Revenue / Annual Performance)

```typescript
revenueData = {
  labels: string[],     // Time periods
  datasets: [
    {
      label: string,
      data: number[],
      backgroundColor: string
    }
  ]
};
```

---

## Chart Configuration

### Chart Options

```typescript
chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: string, // Theme-aware color
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: string, // Theme-aware color
      },
      grid: {
        color: string, // Theme-aware color
      },
    },
    y: {
      ticks: {
        color: string, // Theme-aware color
      },
      grid: {
        color: string, // Theme-aware color
      },
    },
  },
};
```

---

## UI Components Used

### PrimeNG Components

- `p-chart` - Charts (line, doughnut, bar)
- `p-table` - Recent orders and top products tables
- `p-button` - Action buttons
- `p-tag` - Status badges

### Shared Components

- `app-main-layout` - Main layout wrapper

---

## Status Severity Mapping

```typescript
getSeverity(status: string): string {
  switch (status.toLowerCase()) {
    case 'entregado':
    case 'completed':
      return 'success';
    case 'pendiente':
    case 'pending':
      return 'warning';
    case 'cancelado':
    case 'cancelled':
      return 'danger';
    case 'en proceso':
    case 'processing':
      return 'info';
    default:
      return 'info';
  }
}
```

---

## Styling

### Layout

- **Grid System**: CSS Grid with responsive breakpoints
- **Breakpoints**: `md:grid-cols-2`, `lg:grid-cols-4`
- **Card Design**: Rounded corners with shadow and border
- **Spacing**: Consistent padding and gaps using Tailwind utilities

### Theme Support

- Dark mode with theme-aware chart colors
- Uses PrimeNG surface colors for consistency
- Charts automatically update colors on theme change

---

## Mock Data

### Sales Metrics Mock

```typescript
salesMetrics = [
  {
    label: 'Ventas Totales',
    value: '$3,628,250',
    change: '+12.5%',
    icon: 'pi pi-dollar',
    iconColor: 'text-green-500 bg-green-100',
  },
  {
    label: 'Nuevos Clientes',
    value: '342',
    change: '+8.2%',
    icon: 'pi pi-users',
    iconColor: 'text-blue-500 bg-blue-100',
  },
  // ...more metrics
];
```

### Recent Orders Mock

```typescript
recentOrders = [
  { id: '#12453', customer: 'Juan Pérez', product: 'Laptop HP', amount: 850, status: 'Entregado' },
  {
    id: '#12452',
    customer: 'María García',
    product: 'Mouse Logitech',
    amount: 25,
    status: 'Pendiente',
  },
  {
    id: '#12451',
    customer: 'Carlos López',
    product: 'Teclado Mecánico',
    amount: 120,
    status: 'Entregado',
  },
  {
    id: '#12450',
    customer: 'Ana Martínez',
    product: 'Monitor Samsung',
    amount: 320,
    status: 'En Proceso',
  },
  {
    id: '#12449',
    customer: 'Luis Rodríguez',
    product: 'Webcam HD',
    amount: 75,
    status: 'Entregado',
  },
];
```

### Top Products Mock

```typescript
topProducts = [
  { name: 'Laptop HP ProBook', sales: 145, revenue: 123250 },
  { name: 'Mouse Logitech MX', sales: 320, revenue: 8000 },
  { name: 'Teclado Mecánico RGB', sales: 180, revenue: 21600 },
  { name: 'Monitor Samsung 27"', sales: 95, revenue: 30400 },
  { name: 'Webcam Logitech HD', sales: 210, revenue: 15750 },
];
```

---

## API Endpoints (Future)

When connected to real backend, the dashboard should call:

| HTTP Method | Endpoint                             | Response Interface | Description            |
| ----------- | ------------------------------------ | ------------------ | ---------------------- |
| GET         | /api/dashboard/sales-metrics         | `SalesMetric[]`    | Sales metrics data     |
| GET         | /api/dashboard/recent-orders         | `RecentOrder[]`    | Recent orders list     |
| GET         | /api/dashboard/top-products          | `TopProduct[]`     | Best selling products  |
| GET         | /api/dashboard/sales-trend           | `ChartData`        | Monthly sales trend    |
| GET         | /api/dashboard/category-distribution | `ChartData`        | Sales by category      |
| GET         | /api/dashboard/revenue               | `ChartData`        | Weekly/monthly revenue |

### Query Parameters (Future)

- `startDate` - Start date for metrics
- `endDate` - End date for metrics
- `limit` - Number of items to return (for tables)
- `period` - Time period (daily, weekly, monthly)

---

## Routes Configuration

```typescript
// app.routes.ts
{
  path: 'dashboard',
  loadComponent: () =>
    import('./features/dashboard/pages/dashboard-page.component')
      .then(m => m.DashboardPageComponent),
  title: 'Dashboard',
  canActivate: [authGuard],
}
```

---

## Future Enhancements

When connecting to real backend data, the dashboard should:

1. **Fetch Real-Time Data**: Call API endpoints for actual metrics
2. **Date Range Filtering**: Allow users to select date ranges
3. **Auto-Refresh**: Periodically update metrics (configurable interval)
4. **Drill-Down**: Click metrics to view detailed reports
5. **Export**: Allow exporting charts and tables to PDF/Excel
6. **Customization**: Let users configure visible widgets
7. **Notifications**: Real-time alerts for important events

---

## Testing Considerations

### Visual Testing

- [ ] Chart rendering in light mode
- [ ] Chart rendering in dark mode
- [ ] Responsive layout at different breakpoints

### Component Testing

- [ ] Metrics cards display correctly
- [ ] Tables render data correctly
- [ ] Status badges show correct colors

### Performance Testing

- [ ] Chart rendering performance
- [ ] Large dataset handling
- [ ] Memory usage with multiple charts

---

## Implementation Notes

### Current State

- **No Services Required**: Currently uses mock data
- **No Validators**: Display-only, no forms
- **No Complex Models**: Simple interfaces defined inline
- **Theme Reactive**: Charts update colors based on theme changes
- **Responsive**: Full mobile, tablet, and desktop support

### Performance Considerations

- Consider caching API responses
- Use lazy loading for charts
- Implement virtual scrolling for large tables
- Debounce date range changes

---

## Related Modules

- [Auth Module](./auth.md) - Dashboard requires authentication
- [Customers Module](./customers.md) - Customer metrics source

---

## Notes

### Important Considerations

1. **Mock Data**: Currently using hardcoded mock data for demonstration
2. **Chart Library**: Uses Chart.js via PrimeNG p-chart component
3. **Theme Integration**: Charts must respond to theme changes
4. **Currency Format**: Values should use locale-appropriate formatting
5. **Date Format**: Use Spanish locale for date labels

### Common Patterns

- Use computed signals for derived chart data
- Subscribe to theme changes for chart color updates
- Use trackBy functions for table performance
- Implement loading states for async data

---

**Last Updated**: 2025-12-18

**Module Status**: [ ] Planned | [ ] In Development | [x] Implemented (with mock data)
