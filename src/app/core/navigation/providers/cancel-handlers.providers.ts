import { Provider } from '@angular/core';
import { provideCancelHandler as quotes } from '@features/sales/quotes/actions/cancel.provider';
import { provideCancelHandler as orders } from '@features/sales/orders/actions/cancel.provider';
import { provideCancelHandler as purchases } from '@features/procurement/purchases/actions/cancel.provider';
import { provideCancelHandler as invoices } from '@features/finance/billing/invoices/actions/cancel.provider';

export const CANCEL_HANDLER_PROVIDERS: Provider[] = [
  quotes(),
  orders(),
  purchases(),
  invoices(),
];
