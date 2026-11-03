import { Provider } from '@angular/core';
import { REPORT_ACTION_HANDLERS } from '@shared/services/report-action-handlers.token';
import { CatalogReportActionComponent } from '@features/catalog/products/reporting/components/catalog-report-action/catalog-report-action.component';
import { WarehouseReportActionComponent } from '@features/inventory/warehouses/reporting/components/warehouse-report-action/warehouse-report-action.component';
import { OrderReportActionComponent } from '@features/sales/orders/reporting/components/order-report-action/order-report-action.component';
import { QuoteReportActionComponent } from '@features/sales/quotes/reporting/components/quote-report-action/quote-report-action.component';
import { PurchaseReportActionComponent } from '@features/procurement/purchases/reporting/components/purchase-report-action/purchase-report-action.component';
import { InvoiceReportActionComponent } from '@features/finance/billing/invoices/reporting/components/invoice-report-action/invoice-report-action.component';
import { ReceivableReportActionComponent } from '@features/finance/treasury/receivables/reporting/components/receivable-report-action/receivable-report-action.component';
import { CashRegisterReportActionComponent } from '@features/finance/treasury/cash-register/reporting/components/cash-register-report-action/cash-register-report-action.component';

export const REPORT_ACTION_HANDLER_PROVIDERS: Provider[] = [
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'catalog',
      component: CatalogReportActionComponent,
      inputs: { reportKey: 'catalog' },
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'commercialCatalog',
      component: CatalogReportActionComponent,
      inputs: { reportKey: 'commercialCatalog' },
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'stock',
      component: WarehouseReportActionComponent,
      inputs: { reportKey: 'stock' },
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: {
      key: 'movements',
      component: WarehouseReportActionComponent,
      inputs: { reportKey: 'movements' },
    },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'orders', component: OrderReportActionComponent },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'quotes', component: QuoteReportActionComponent },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'purchases', component: PurchaseReportActionComponent },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'invoices', component: InvoiceReportActionComponent },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'accountsReceivable', component: ReceivableReportActionComponent },
  },
  {
    provide: REPORT_ACTION_HANDLERS,
    multi: true,
    useValue: { key: 'cashRegister', component: CashRegisterReportActionComponent },
  },
];
