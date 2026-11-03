import { Provider } from '@angular/core';
import { provideDeleteHandler as products } from '@features/catalog/products/actions/delete.provider';
import { provideDeleteHandler as categories } from '@features/catalog/categories/actions/delete.provider';
import { provideDeleteHandler as priceTypes } from '@features/catalog/price-types/actions/delete.provider';
import { provideDeleteHandler as warehouses } from '@features/inventory/warehouses/actions/delete.provider';
import { provideDeleteHandler as customers } from '@features/partners/customers/actions/delete.provider';
import { provideDeleteHandler as suppliers } from '@features/partners/suppliers/actions/delete.provider';
import { provideDeleteHandler as users } from '@features/platform/auth/user/actions/delete.provider';
import { provideDeleteHandler as roles } from '@features/platform/auth/role/actions/delete.provider';
import { provideDeleteHandler as departments } from '@features/platform/auth/department/actions/delete.provider';
import { provideDeleteHandler as quotes } from '@features/sales/quotes/actions/delete.provider';
import { provideDeleteHandler as orders } from '@features/sales/orders/actions/delete.provider';
import { provideDeleteHandler as purchases } from '@features/procurement/purchases/actions/delete.provider';
import { provideDeleteHandler as invoices } from '@features/finance/billing/invoices/actions/delete.provider';
import { provideDeleteHandler as returns } from '@features/finance/billing/returns/actions/delete.provider';
import { provideDeleteHandler as creditNotes } from '@features/finance/billing/credit-notes/actions/delete.provider';
import { provideDeleteHandler as debitNotes } from '@features/finance/billing/debit-notes/actions/delete.provider';
import { provideDeleteHandler as paymentMethods } from '@features/finance/treasury/payment-methods/actions/delete.provider';

export const DELETE_HANDLER_PROVIDERS: Provider[] = [
  products(),
  categories(),
  priceTypes(),
  warehouses(),
  customers(),
  suppliers(),
  users(),
  roles(),
  departments(),
  quotes(),
  orders(),
  purchases(),
  invoices(),
  returns(),
  creditNotes(),
  debitNotes(),
  paymentMethods(),
];
