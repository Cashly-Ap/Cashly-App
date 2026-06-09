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
  [BusinessModule.USERS]: 'Gestión de Usuarios y Roles',
  [BusinessModule.INVENTORY]: 'Gestión de Inventario (Inventario 360°)',
  [BusinessModule.SALES]: 'Gestión Comercial (Ventas)',
  [BusinessModule.FINANCE]: 'Finanzas y Cuentas por Cobrar',
  [BusinessModule.PURCHASES]: 'Módulo de Compras',
  [BusinessModule.CUSTOMER_PORTAL]: 'Portal Web de Clientes',
  [BusinessModule.DOCUMENT_ADMIN]: 'Administrador Documental Global',
};
