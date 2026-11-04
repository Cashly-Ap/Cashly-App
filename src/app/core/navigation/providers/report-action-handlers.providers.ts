import { Provider } from '@angular/core';
import { REPORT_ACTION_HANDLERS } from '@shared/services/report-action-handlers.token';

export const REPORT_ACTION_HANDLER_PROVIDERS: Provider[] = [
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'catalog',
      inputs: { reportKey: 'catalog' },
      load: () =>
        import('@features/catalog/products/reporting/components/catalog-report-action/catalog-report-action.component').then(
          (module) => module.CatalogReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'commercialCatalog',
      inputs: { reportKey: 'commercialCatalog' },
      load: () =>
        import('@features/catalog/products/reporting/components/catalog-report-action/catalog-report-action.component').then(
          (module) => module.CatalogReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'stock',
      inputs: { reportKey: 'stock' },
      load: () =>
        import('@features/inventory/warehouses/reporting/components/warehouse-report-action/warehouse-report-action.component').then(
          (module) => module.WarehouseReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'movements',
      inputs: { reportKey: 'movements' },
      load: () =>
        import('@features/inventory/warehouses/reporting/components/warehouse-report-action/warehouse-report-action.component').then(
          (module) => module.WarehouseReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'orders',
      load: () =>
        import('@features/sales/orders/reporting/components/order-report-action/order-report-action.component').then(
          (module) => module.OrderReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'quotes',
      load: () =>
        import('@features/sales/quotes/reporting/components/quote-report-action/quote-report-action.component').then(
          (module) => module.QuoteReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'purchases',
      load: () =>
        import('@features/procurement/purchases/reporting/components/purchase-report-action/purchase-report-action.component').then(
          (module) => module.PurchaseReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'invoices',
      load: () =>
        import('@features/finance/billing/invoices/reporting/components/invoice-report-action/invoice-report-action.component').then(
          (module) => module.InvoiceReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'accountsReceivable',
      load: () =>
        import('@features/finance/treasury/receivables/reporting/components/receivable-report-action/receivable-report-action.component').then(
          (module) => module.ReceivableReportActionComponent,
        ),
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'cashRegister',
      load: () =>
        import('@features/finance/treasury/cash-register/reporting/components/cash-register-report-action/cash-register-report-action.component').then(
          (module) => module.CashRegisterReportActionComponent,
        ),
    },
  },
];
