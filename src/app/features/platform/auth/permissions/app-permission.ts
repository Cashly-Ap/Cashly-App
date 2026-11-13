import { QuotePermission } from '@features/sales/quotes/permissions';
import { OrderPermission } from '@features/sales/orders/permissions';
import { PurchasePermission } from '@features/procurement/purchases/permissions';
import { ProductPermission } from '@features/catalog/products/permissions';
import { CategoryPermission } from '@features/catalog/categories/permissions';
import { PriceTypePermission } from '@features/catalog/price-types/permissions';
import { WarehousePermission } from '@features/inventory/warehouses/permissions';
import { InvoicePermission } from '@features/finance/billing/invoices/permissions';
import { ReturnPermission } from '@features/finance/billing/returns/permissions';
import { CreditNotePermission } from '@features/finance/billing/credit-notes/permissions';
import { DebitNotePermission } from '@features/finance/billing/debit-notes/permissions';
import { CashRegisterPermission } from '@features/finance/treasury/cash-register/permissions';
import { PayablePermission } from '@features/finance/treasury/payables/permissions';
import { ExpensePermission } from '@features/finance/treasury/expenses/permissions';
import { ReceivablePermission } from '@features/finance/treasury/receivables/permissions';
import { PaymentMethodPermission } from '@features/finance/treasury/payment-methods/permissions';
import { CustomerPermission } from '@features/partners/customers/permissions';
import { SupplierPermission } from '@features/partners/suppliers/permissions';
import { DashboardPermission } from '@features/analytics/dashboard/permissions';
import { UserPermission } from '@features/platform/auth/user/permissions';
import { RolePermission } from '@features/platform/auth/role/permissions';
import { DepartmentPermission } from '@features/platform/auth/department/permissions';
import { CompanyPermission } from '@features/platform/company/permissions';
import { AuditPermission } from '@features/platform/audit/permissions';

export type AppPermission =
  | QuotePermission
  | OrderPermission
  | PurchasePermission
  | ProductPermission
  | CategoryPermission
  | PriceTypePermission
  | WarehousePermission
  | InvoicePermission
  | ReturnPermission
  | CreditNotePermission
  | DebitNotePermission
  | CashRegisterPermission
  | ReceivablePermission
  | PayablePermission
  | ExpensePermission
  | PaymentMethodPermission
  | CustomerPermission
  | SupplierPermission
  | DashboardPermission
  | UserPermission
  | RolePermission
  | DepartmentPermission
  | CompanyPermission
  | AuditPermission;
