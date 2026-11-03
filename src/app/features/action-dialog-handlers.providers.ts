import { Provider } from '@angular/core';
import { provideConfirmHandler as orderConfirm } from '@features/sales/orders/actions/confirm.provider';
import { provideConfirmHandler as purchaseConfirm } from '@features/procurement/purchases/actions/confirm.provider';
import { provideConvertToOrderHandler as quoteConvertToOrder } from '@features/sales/quotes/actions/convert-to-order.provider';
import { provideConvertToInvoiceHandler as quoteConvertToInvoice } from '@features/sales/quotes/actions/convert-to-invoice.provider';
import { provideConvertToInvoiceHandler as orderConvertToInvoice } from '@features/sales/orders/actions/convert-to-invoice.provider';

export const ACTION_DIALOG_HANDLER_PROVIDERS: Provider[] = [
  orderConfirm(),
  purchaseConfirm(),
  quoteConvertToOrder(),
  quoteConvertToInvoice(),
  orderConvertToInvoice(),
];
