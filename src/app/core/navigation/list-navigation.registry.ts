import { ListNavigationDefinition } from '@core/layouts/config/list-navigation.types';
import { QUOTE_LIST_NAVIGATION } from '@features/sales/quotes/navigation/quote.list-navigation';
import { ORDER_LIST_NAVIGATION } from '@features/sales/orders/navigation/order.list-navigation';
import { PURCHASE_LIST_NAVIGATION } from '@features/procurement/purchases/navigation/purchase.list-navigation';
import { PRODUCT_LIST_NAVIGATION } from '@features/catalog/products/navigation/product.list-navigation';
import { CATEGORY_LIST_NAVIGATION } from '@features/catalog/categories/navigation/category.list-navigation';
import { PRICE_TYPE_LIST_NAVIGATION } from '@features/catalog/price-types/navigation/price-type.list-navigation';
import { WAREHOUSE_LIST_NAVIGATION } from '@features/inventory/warehouses/navigation/warehouse.list-navigation';
import { INVOICE_LIST_NAVIGATION } from '@features/finance/billing/invoices/navigation/invoice.list-navigation';
import { RETURN_LIST_NAVIGATION } from '@features/finance/billing/returns/navigation/return.list-navigation';
import { CREDIT_NOTE_LIST_NAVIGATION } from '@features/finance/billing/credit-notes/navigation/credit-note.list-navigation';
import { DEBIT_NOTE_LIST_NAVIGATION } from '@features/finance/billing/debit-notes/navigation/debit-note.list-navigation';
import { PAYMENT_METHOD_LIST_NAVIGATION } from '@features/finance/treasury/payment-methods/navigation/payment-method.list-navigation';
import { RECEIVABLE_LIST_NAVIGATION } from '@features/finance/treasury/receivables/navigation/receivable.list-navigation';
import { PAYABLE_LIST_NAVIGATION } from '@features/finance/treasury/payables/navigation/payable.list-navigation';
import { EXPENSE_LIST_NAVIGATION } from '@features/finance/treasury/expenses/navigation/expense.list-navigation';
import { CASH_REGISTER_LIST_NAVIGATION } from '@features/finance/treasury/cash-register/navigation/cash-register.list-navigation';
import { CUSTOMER_LIST_NAVIGATION } from '@features/partners/customers/navigation/customer.list-navigation';
import { SUPPLIER_LIST_NAVIGATION } from '@features/partners/suppliers/navigation/supplier.list-navigation';
import { USER_LIST_NAVIGATION } from '@features/platform/auth/user/navigation/user.list-navigation';
import { ROLE_LIST_NAVIGATION } from '@features/platform/auth/role/navigation/role.list-navigation';
import { DEPARTMENT_LIST_NAVIGATION } from '@features/platform/auth/department/navigation/department.list-navigation';

export const LIST_NAVIGATION_DEFINITIONS: ListNavigationDefinition[] = [
  QUOTE_LIST_NAVIGATION,
  ORDER_LIST_NAVIGATION,
  PURCHASE_LIST_NAVIGATION,
  PRODUCT_LIST_NAVIGATION,
  CATEGORY_LIST_NAVIGATION,
  PRICE_TYPE_LIST_NAVIGATION,
  WAREHOUSE_LIST_NAVIGATION,
  INVOICE_LIST_NAVIGATION,
  RETURN_LIST_NAVIGATION,
  CREDIT_NOTE_LIST_NAVIGATION,
  DEBIT_NOTE_LIST_NAVIGATION,
  PAYMENT_METHOD_LIST_NAVIGATION,
  RECEIVABLE_LIST_NAVIGATION,
  PAYABLE_LIST_NAVIGATION,
  EXPENSE_LIST_NAVIGATION,
  CASH_REGISTER_LIST_NAVIGATION,
  CUSTOMER_LIST_NAVIGATION,
  SUPPLIER_LIST_NAVIGATION,
  USER_LIST_NAVIGATION,
  ROLE_LIST_NAVIGATION,
  DEPARTMENT_LIST_NAVIGATION,
];
