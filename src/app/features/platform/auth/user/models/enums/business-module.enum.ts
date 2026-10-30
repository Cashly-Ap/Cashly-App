export enum BusinessModule {
  COMPANY = 'COMPANY',
  USERS = 'USERS',
  ROLES = 'ROLES',
  DEPARTMENTS = 'DEPARTMENTS',
  CATALOG = 'CATALOG',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  FINANCE = 'FINANCES',
  PURCHASES = 'PURCHASES',
  DOCUMENT_ADMIN = 'DOCUMENT_ADMIN',
  DASHBOARD = 'DASHBOARD',
}

export const BUSINESS_MODULE_LABELS: Record<BusinessModule, string> = {
  [BusinessModule.COMPANY]: 'platform.auth.company',
  [BusinessModule.ROLES]: 'platform.auth.roles',
  [BusinessModule.DEPARTMENTS]: 'platform.auth.departments',
  [BusinessModule.CATALOG]: 'platform.auth.catalog',
  [BusinessModule.USERS]: 'platform.auth.userManagement',
  [BusinessModule.INVENTORY]: 'platform.auth.inventory',
  [BusinessModule.SALES]: 'platform.auth.salesManagement',
  [BusinessModule.FINANCE]: 'platform.auth.finance',
  [BusinessModule.PURCHASES]: 'platform.auth.purchases',
  [BusinessModule.DOCUMENT_ADMIN]: 'platform.auth.reports',
  [BusinessModule.DASHBOARD]: 'platform.auth.dashboard',
};
