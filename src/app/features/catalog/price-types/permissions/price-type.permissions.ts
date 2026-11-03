export enum PriceTypePermission {
  VIEW_LIST = 'CATALOG_PRICES_VIEW_LIST',
  VIEW_DETAIL = 'CATALOG_PRICES_VIEW_DETAIL',
  EDIT = 'CATALOG_PRICES_EDIT',
  DELETE = 'CATALOG_PRICES_DELETE',
  CREATE = 'CATALOG_PRICES_CREATE',
}

export const PRICE_TYPE_PERMISSIONS = [
  { code: PriceTypePermission.VIEW_LIST, labelKey: 'catalog.priceTypes.permissions.viewList' },
  { code: PriceTypePermission.VIEW_DETAIL, labelKey: 'catalog.priceTypes.permissions.viewDetail' },
  { code: PriceTypePermission.EDIT, labelKey: 'catalog.priceTypes.permissions.edit' },
  { code: PriceTypePermission.DELETE, labelKey: 'catalog.priceTypes.permissions.delete' },
  { code: PriceTypePermission.CREATE, labelKey: 'catalog.priceTypes.permissions.create' },
] as const;
