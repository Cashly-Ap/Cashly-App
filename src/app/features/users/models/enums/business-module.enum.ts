export enum BusinessModule {
  USERS = 'USERS',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  FINANCE = 'FINANCES',
  PURCHASES = 'PURCHASES',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
  DOCUMENT_ADMIN = 'DOCUMENT_ADMIN',
}

export const BUSINESS_MODULE_LABELS: Record<BusinessModule, string> = {
  [BusinessModule.USERS]: 'Gestión de Usuarios',
  [BusinessModule.INVENTORY]: 'Inventario',
  [BusinessModule.SALES]: 'Gestión Comercial',
  [BusinessModule.FINANCE]: 'Finanzas',
  [BusinessModule.PURCHASES]: 'Compras',
  [BusinessModule.CUSTOMER_PORTAL]: 'Portal Web de Clientes',
  [BusinessModule.DOCUMENT_ADMIN]: 'Reportes',
};
