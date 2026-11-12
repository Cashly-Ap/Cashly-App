import { Provider } from '@angular/core';
import { LOOKUP_DEFINITIONS } from '@shared/services/lookup-definition.token';
import { QUOTE_LOOKUP } from '@features/sales/quotes/navigation/quote.lookup';
import { ORDER_LOOKUP } from '@features/sales/orders/navigation/order.lookup';
import { PURCHASE_LOOKUP } from '@features/procurement/purchases/navigation/purchase.lookup';
import { INVOICE_LOOKUP } from '@features/finance/billing/invoices/navigation/invoice.lookup';
import { RETURN_LOOKUP } from '@features/finance/billing/returns/navigation/return.lookup';
import { CREDIT_NOTE_LOOKUP } from '@features/finance/billing/credit-notes/navigation/credit-note.lookup';
import { DEBIT_NOTE_LOOKUP } from '@features/finance/billing/debit-notes/navigation/debit-note.lookup';
import { RECEIVABLE_LOOKUP } from '@features/finance/treasury/receivables/navigation/receivable.lookup';
import { PAYABLE_LOOKUP } from '@features/finance/treasury/payables/navigation/payable.lookup';
import { PAYMENT_METHOD_LOOKUP } from '@features/finance/treasury/payment-methods/navigation/payment-method.lookup';
import { EXPENSE_LOOKUP } from '@features/finance/treasury/expenses/navigation/expense.lookup';
import { PRODUCT_LOOKUP } from '@features/catalog/products/navigation/product.lookup';
import { CATEGORY_LOOKUP } from '@features/catalog/categories/navigation/category.lookup';
import { PRICE_TYPE_LOOKUP } from '@features/catalog/price-types/navigation/price-type.lookup';
import { WAREHOUSE_LOOKUP } from '@features/inventory/warehouses/navigation/warehouse.lookup';
import { CUSTOMER_LOOKUP } from '@features/partners/customers/navigation/customer.lookup';
import { SUPPLIER_LOOKUP } from '@features/partners/suppliers/navigation/supplier.lookup';
import { USER_LOOKUP } from '@features/platform/auth/user/navigation/user.lookup';
import { ROLE_LOOKUP } from '@features/platform/auth/role/navigation/role.lookup';
import { DEPARTMENT_LOOKUP } from '@features/platform/auth/department/navigation/department.lookup';

const DEFINITIONS = [
  QUOTE_LOOKUP,
  ORDER_LOOKUP,
  PURCHASE_LOOKUP,
  INVOICE_LOOKUP,
  RETURN_LOOKUP,
  CREDIT_NOTE_LOOKUP,
  DEBIT_NOTE_LOOKUP,
  RECEIVABLE_LOOKUP,
  PAYABLE_LOOKUP,
  PAYMENT_METHOD_LOOKUP,
  EXPENSE_LOOKUP,
  PRODUCT_LOOKUP,
  CATEGORY_LOOKUP,
  PRICE_TYPE_LOOKUP,
  WAREHOUSE_LOOKUP,
  CUSTOMER_LOOKUP,
  SUPPLIER_LOOKUP,
  USER_LOOKUP,
  ROLE_LOOKUP,
  DEPARTMENT_LOOKUP,
];

export const LOOKUP_DEFINITION_PROVIDERS: Provider[] = DEFINITIONS.map((definition) => ({
  provide: LOOKUP_DEFINITIONS,
  multi: true,
  useValue: definition,
}));
