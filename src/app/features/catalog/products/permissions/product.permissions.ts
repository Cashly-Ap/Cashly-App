export enum ProductPermission {
  VIEW_LIST = 'CATALOG_PRODUCTS_VIEW_LIST',
  VIEW_DETAIL = 'CATALOG_PRODUCTS_VIEW_DETAIL',
  EDIT = 'CATALOG_PRODUCTS_EDIT',
  DELETE = 'CATALOG_PRODUCTS_DELETE',
  CREATE = 'CATALOG_PRODUCTS_CREATE',
  COMMERCIAL_CATALOG_PDF = 'CATALOG_PRODUCTS_COMMERCIAL_CATALOG_PDF',
}

export const PRODUCT_PERMISSIONS = [
  { code: ProductPermission.VIEW_LIST, labelKey: 'catalog.products.permissions.viewList' },
  { code: ProductPermission.VIEW_DETAIL, labelKey: 'catalog.products.permissions.viewDetail' },
  { code: ProductPermission.EDIT, labelKey: 'catalog.products.permissions.edit' },
  { code: ProductPermission.DELETE, labelKey: 'catalog.products.permissions.delete' },
  { code: ProductPermission.CREATE, labelKey: 'catalog.products.permissions.create' },
  {
    code: ProductPermission.COMMERCIAL_CATALOG_PDF,
    labelKey: 'catalog.products.permissions.commercialCatalogPdf',
  },
] as const;
