import { Provider } from '@angular/core';
import { providePdfHandler as quotes } from '@features/sales/quotes/actions/pdf.provider';
import { providePdfHandler as orders } from '@features/sales/orders/actions/pdf.provider';
import { providePdfHandler as purchases } from '@features/procurement/purchases/actions/pdf.provider';
import { providePdfHandler as invoices } from '@features/finance/billing/invoices/actions/pdf.provider';

export const PDF_HANDLER_PROVIDERS: Provider[] = [
  quotes(),
  orders(),
  purchases(),
  invoices(),
];
