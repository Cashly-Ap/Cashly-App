import { BusinessModule } from '../../user/models/enums/business-module.enum';
export function moduleForUrl(url: string): BusinessModule | null {
  if (url.startsWith('/platform/users')) return BusinessModule.USERS;
  if (url.startsWith('/platform/roles')) return BusinessModule.ROLES;
  if (url.startsWith('/platform/departments')) return BusinessModule.DEPARTMENTS;
  if (url.startsWith('/catalog')) return BusinessModule.CATALOG;
  if (url.startsWith('/inventory')) return BusinessModule.INVENTORY;
  if (/^\/partners\/customers\/[^/]+\/balance/.test(url)) return BusinessModule.FINANCE;
  if (url.startsWith('/analytics/reports/inventory')) return BusinessModule.INVENTORY;
  if (url.startsWith('/sales') || url.startsWith('/partners/customers'))
    return BusinessModule.SALES;
  if (url.startsWith('/procurement') || url.startsWith('/partners/suppliers'))
    return BusinessModule.PURCHASES;
  if (url.startsWith('/finance')) return BusinessModule.FINANCE;
  if (url.startsWith('/analytics/reports')) return BusinessModule.DOCUMENT_ADMIN;
  if (url.startsWith('/analytics/dashboard')) return BusinessModule.DASHBOARD;
  return null;
}
