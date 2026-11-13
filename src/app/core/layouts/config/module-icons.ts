import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const MODULE_ICONS: Record<BusinessModule, string> = {
  [BusinessModule.USERS]: 'pi pi-user',
  [BusinessModule.ROLES]: 'pi pi-shield',
  [BusinessModule.DEPARTMENTS]: 'pi pi-sitemap',
  [BusinessModule.CATALOG_PRODUCTS]: 'pi pi-box',
  [BusinessModule.CATALOG_CATEGORIES]: 'pi pi-tags',
  [BusinessModule.CATALOG_PRICES]: 'pi pi-tag',
  [BusinessModule.INVENTORY_WAREHOUSES]: 'pi pi-warehouse',
  [BusinessModule.SALES_QUOTES]: 'pi pi-file-edit',
  [BusinessModule.SALES_ORDERS]: 'pi pi-shopping-cart',
  [BusinessModule.CONTACTS_CUSTOMERS]: 'pi pi-id-card',
  [BusinessModule.FINANCE_INVOICES]: 'pi pi-file',
  [BusinessModule.FINANCE_RETURNS]: 'pi pi-undo',
  [BusinessModule.FINANCE_CREDIT_NOTES]: 'pi pi-file-plus',
  [BusinessModule.FINANCE_DEBIT_NOTES]: 'pi pi-minus-circle',
  [BusinessModule.FINANCE_CASH_REGISTER]: 'pi pi-calculator',
  [BusinessModule.FINANCE_EXPENSES]: 'pi pi-receipt',
  [BusinessModule.FINANCE_RECEIVABLES]: 'pi pi-money-bill',
  [BusinessModule.FINANCE_PAYABLES]: 'pi pi-wallet',
  [BusinessModule.FINANCE_PAYMENT_METHODS]: 'pi pi-credit-card',
  [BusinessModule.PURCHASES]: 'pi pi-shopping-cart',
  [BusinessModule.CONTACTS_SUPPLIERS]: 'pi pi-truck',
  [BusinessModule.DASHBOARD]: 'pi pi-chart-line',
};

const PLATFORM_ROUTE_ICONS: ReadonlyArray<readonly [string, string]> = [
  ['/platform/company', 'pi pi-building'],
  ['/platform/auth/security', 'pi pi-shield'],
  ['/platform/auth/preferences', 'pi pi-cog'],
  ['/platform/auth/configuration', 'pi pi-user'],
  ['/platform/auth/change-username', 'pi pi-user-edit'],
  ['/platform/auth/change-password', 'pi pi-key'],
  ['/platform/auth/verify-email', 'pi pi-envelope'],
];

export function moduleIconForUrl(url: string): string | null {
  const platformIcon = PLATFORM_ROUTE_ICONS.find(([prefix]) => url.startsWith(prefix));
  if (platformIcon) return platformIcon[1];
  const module = moduleForUrl(url);
  return module ? MODULE_ICONS[module] : null;
}
