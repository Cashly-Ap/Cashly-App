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
  [BusinessModule.COMPANY]: 'Empresa',
  [BusinessModule.ROLES]: 'Roles',
  [BusinessModule.DEPARTMENTS]: 'Departamentos',
  [BusinessModule.CATALOG]: 'Catálogo',
  [BusinessModule.USERS]: 'Gestión de Usuarios',
  [BusinessModule.INVENTORY]: 'Inventario',
  [BusinessModule.SALES]: 'Gestión Comercial',
  [BusinessModule.FINANCE]: 'Finanzas',
  [BusinessModule.PURCHASES]: 'Compras',
  [BusinessModule.DOCUMENT_ADMIN]: 'Reportes',
  [BusinessModule.DASHBOARD]: 'Dashboard',
};
