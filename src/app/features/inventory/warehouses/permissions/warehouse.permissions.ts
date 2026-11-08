export enum WarehousePermission {
  VIEW_LIST = 'INVENTORY_WAREHOUSES_VIEW_LIST',
  VIEW_DETAIL = 'INVENTORY_WAREHOUSES_VIEW_DETAIL',
  EDIT = 'INVENTORY_WAREHOUSES_EDIT',
  DELETE = 'INVENTORY_WAREHOUSES_DELETE',
  CREATE = 'INVENTORY_WAREHOUSES_CREATE',
  VIEW_STOCK = 'INVENTORY_WAREHOUSES_VIEW_STOCK',
  MOVEMENT_HISTORY = 'INVENTORY_WAREHOUSES_MOVEMENT_HISTORY',
  RECORD_ENTRY = 'INVENTORY_WAREHOUSES_RECORD_ENTRY',
  RECORD_EXIT = 'INVENTORY_WAREHOUSES_RECORD_EXIT',
  REPORT_STOCK = 'INVENTORY_WAREHOUSES_REPORT_STOCK',
  REPORT_MOVEMENTS = 'INVENTORY_WAREHOUSES_REPORT_MOVEMENTS',
}

export const WAREHOUSE_PERMISSIONS = [
  { code: WarehousePermission.VIEW_LIST, labelKey: 'inventory.warehouses.permissions.viewList' },
  {
    code: WarehousePermission.VIEW_DETAIL,
    labelKey: 'inventory.warehouses.permissions.viewDetail',
  },
  { code: WarehousePermission.EDIT, labelKey: 'inventory.warehouses.permissions.edit' },
  { code: WarehousePermission.DELETE, labelKey: 'inventory.warehouses.permissions.delete' },
  { code: WarehousePermission.CREATE, labelKey: 'inventory.warehouses.permissions.create' },
  { code: WarehousePermission.VIEW_STOCK, labelKey: 'inventory.warehouses.permissions.viewStock' },
  {
    code: WarehousePermission.MOVEMENT_HISTORY,
    labelKey: 'inventory.warehouses.permissions.movementHistory',
  },
  {
    code: WarehousePermission.RECORD_ENTRY,
    labelKey: 'inventory.warehouses.permissions.recordEntry',
  },
  {
    code: WarehousePermission.RECORD_EXIT,
    labelKey: 'inventory.warehouses.permissions.recordExit',
  },
  {
    code: WarehousePermission.REPORT_STOCK,
    labelKey: 'inventory.warehouses.permissions.reportStock',
  },
  {
    code: WarehousePermission.REPORT_MOVEMENTS,
    labelKey: 'inventory.warehouses.permissions.reportMovements',
  },
] as const;
