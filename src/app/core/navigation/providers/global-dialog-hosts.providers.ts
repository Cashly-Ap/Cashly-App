import { Provider } from '@angular/core';
import { GLOBAL_DIALOG_HOSTS } from '@shared/services/global-dialog-hosts.token';

export const GLOBAL_DIALOG_HOST_PROVIDERS: Provider[] = [
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'receivables',
      load: () =>
        import(
          '@features/finance/treasury/receivables/components/receivables-action-dialog-host/receivables-action-dialog-host.component'
        ).then((module) => module.ReceivablesActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'pending-payments',
      load: () =>
        import(
          '@features/finance/treasury/receivables/components/pending-payment-action-dialog-host/pending-payment-action-dialog-host.component'
        ).then((module) => module.PendingPaymentActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'payables',
      load: () =>
        import(
          '@features/finance/treasury/payables/components/payables-action-dialog-host/payables-action-dialog-host.component'
        ).then((module) => module.PayablesActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'pending-supplier-payments',
      load: () =>
        import(
          '@features/finance/treasury/payables/components/pending-supplier-payment-action-dialog-host/pending-supplier-payment-action-dialog-host.component'
        ).then((module) => module.PendingSupplierPaymentActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'invoices',
      load: () =>
        import(
          '@features/finance/billing/invoices/components/invoice-action-dialog-host/invoice-action-dialog-host.component'
        ).then((module) => module.InvoiceActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'warehouses',
      load: () =>
        import(
          '@features/inventory/warehouses/components/warehouse-action-dialog-host/warehouse-action-dialog-host.component'
        ).then((module) => module.WarehouseActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'cash-register',
      load: () =>
        import(
          '@features/finance/treasury/cash-register/components/cash-register-action-dialog-host/cash-register-action-dialog-host.component'
        ).then((module) => module.CashRegisterActionDialogHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'supplier-picker',
      load: () =>
        import(
          '@features/procurement/purchases/components/supplier-picker-dialog/supplier-picker-action-host.component'
        ).then((module) => module.SupplierPickerActionHostComponent),
    },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: {
      key: 'customer-picker',
      load: () =>
        import(
          '@features/sales/orders/components/customer-picker-dialog/customer-picker-action-host.component'
        ).then((module) => module.CustomerPickerActionHostComponent),
    },
  },
];
