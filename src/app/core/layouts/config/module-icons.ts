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
  [BusinessModule.FINANCE_RECEIVABLES]: 'pi pi-money-bill',
  [BusinessModule.FINANCE_PAYABLES]: 'pi pi-wallet',
  [BusinessModule.FINANCE_PAYMENT_METHODS]: 'pi pi-credit-card',
  [BusinessModule.PURCHASES]: 'pi pi-shopping-cart',
  [BusinessModule.CONTACTS_SUPPLIERS]: 'pi pi-truck',
  [BusinessModule.DASHBOARD]: 'pi pi-chart-line',
};

export function moduleIconForUrl(url: string): string | null {
  const module = moduleForUrl(url);
  return module ? MODULE_ICONS[module] : null;
}
