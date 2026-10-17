import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

interface Destination {
  path: string;
  modules: BusinessModule[];
  superAdmin?: boolean;
}

const destinations: Destination[] = [
  { path: '/analytics/dashboard', modules: [BusinessModule.DASHBOARD] },
  { path: '/partners/customers', modules: [BusinessModule.SALES] },
  { path: '/sales/quotes', modules: [BusinessModule.SALES] },
  { path: '/catalog/products', modules: [BusinessModule.INVENTORY] },
  { path: '/inventory/warehouses', modules: [BusinessModule.INVENTORY] },
  { path: '/procurement/purchases', modules: [BusinessModule.PURCHASES] },
  { path: '/partners/suppliers', modules: [BusinessModule.PURCHASES] },
  { path: '/finance/billing/invoices', modules: [BusinessModule.SALES] },
  { path: '/finance/billing/credit-notes', modules: [BusinessModule.FINANCE] },
  { path: '/finance/treasury/cash-register', modules: [BusinessModule.FINANCE] },
  {
    path: '/analytics/reports/inventory',
    modules: [BusinessModule.DOCUMENT_ADMIN, BusinessModule.INVENTORY],
  },
  { path: '/platform/users', modules: [BusinessModule.USERS], superAdmin: true },
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
