export const PENDING_TABS_STORAGE_KEY = 'parsun_pending_tabs';

export const PENDING_TABS_CONFIG = {
  DEBOUNCE_TIME: 1000,
  MAX_TABS: 20,
} as const;

export const MODULE_LABELS: Record<string, string> = {
  customers: 'Clientes',
  users: 'Usuarios',
  products: 'Productos',
  orders: 'Pedidos',
  invoices: 'Facturas',
  warehouses: 'Almacenes',
  merchants: 'Vendedores',
  differentials: 'Diferenciales',
  categories: 'Categorías',
} as const;
