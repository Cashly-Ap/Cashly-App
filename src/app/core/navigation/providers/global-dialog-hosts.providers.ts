import { Provider } from '@angular/core';
import { GLOBAL_DIALOG_HOSTS } from '@shared/services/global-dialog-hosts.token';
import { ReceivablesActionDialogHostComponent } from '@features/finance/treasury/receivables/components/receivables-action-dialog-host/receivables-action-dialog-host.component';
import { PendingPaymentActionDialogHostComponent } from '@features/finance/treasury/receivables/components/pending-payment-action-dialog-host/pending-payment-action-dialog-host.component';
import { InvoiceActionDialogHostComponent } from '@features/finance/billing/invoices/components/invoice-action-dialog-host/invoice-action-dialog-host.component';
import { WarehouseActionDialogHostComponent } from '@features/inventory/warehouses/components/warehouse-action-dialog-host/warehouse-action-dialog-host.component';
import { CashRegisterActionDialogHostComponent } from '@features/finance/treasury/cash-register/components/cash-register-action-dialog-host/cash-register-action-dialog-host.component';
import { CustomerPickerActionHostComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-action-host.component';

export const GLOBAL_DIALOG_HOST_PROVIDERS: Provider[] = [
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'receivables', component: ReceivablesActionDialogHostComponent },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'pending-payments', component: PendingPaymentActionDialogHostComponent },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'invoices', component: InvoiceActionDialogHostComponent },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'warehouses', component: WarehouseActionDialogHostComponent },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'cash-register', component: CashRegisterActionDialogHostComponent },
  },
  {
    provide: GLOBAL_DIALOG_HOSTS,
    multi: true,
    useValue: { key: 'customer-picker', component: CustomerPickerActionHostComponent },
  },
];
