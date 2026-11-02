import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

interface Destination {
  path: string;
  modules: BusinessModule[];
  superAdmin?: boolean;
}

const destinations: Destination[] = [
  { path: '/analytics/dashboard', modules: [BusinessModule.DASHBOARD] },
  { path: '/partners/customers', modules: [BusinessModule.CONTACTS_CUSTOMERS] },
  { path: '/sales/quotes', modules: [BusinessModule.SALES_QUOTES] },
  { path: '/catalog/products', modules: [BusinessModule.CATALOG_PRODUCTS] },
  { path: '/inventory/warehouses', modules: [BusinessModule.INVENTORY_WAREHOUSES] },
  { path: '/procurement/purchases', modules: [BusinessModule.PURCHASES] },
  { path: '/partners/suppliers', modules: [BusinessModule.CONTACTS_SUPPLIERS] },
  { path: '/finance/billing/invoices', modules: [BusinessModule.FINANCE_INVOICES] },
  { path: '/finance/billing/credit-notes', modules: [BusinessModule.FINANCE_CREDIT_NOTES] },
  { path: '/finance/treasury/cash-register', modules: [BusinessModule.FINANCE_CASH_REGISTER] },

  { path: '/platform/roles', modules: [BusinessModule.ROLES] },
  { path: '/platform/departments', modules: [BusinessModule.DEPARTMENTS] },
  { path: '/platform/users', modules: [BusinessModule.USERS] },
];

export function authorizedDestination(
  auth: Pick<AuthService, 'hasModulePermission' | 'isSuperAdmin'>,
  area?: string,
): string {
  const permitted = destinations.filter(
    (destination) =>
      destination.modules.every((module) => auth.hasModulePermission(module)) &&
      (!destination.superAdmin || auth.isSuperAdmin()),
  );
  return (
    permitted.find((destination) => area && destination.path.startsWith('/' + area + '/'))?.path ??
    (area === 'platform' ? undefined : permitted[0]?.path) ??
    '/platform/auth/configuration'
  );
}
