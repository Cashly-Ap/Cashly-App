export enum CategoryPermission {
  VIEW_LIST = 'CATALOG_CATEGORIES_VIEW_LIST',
  VIEW_DETAIL = 'CATALOG_CATEGORIES_VIEW_DETAIL',
  EDIT = 'CATALOG_CATEGORIES_EDIT',
  DELETE = 'CATALOG_CATEGORIES_DELETE',
  CREATE = 'CATALOG_CATEGORIES_CREATE',
}

export const CATEGORY_PERMISSIONS = [
  { code: CategoryPermission.VIEW_LIST, labelKey: 'catalog.categories.permissions.viewList' },
  { code: CategoryPermission.VIEW_DETAIL, labelKey: 'catalog.categories.permissions.viewDetail' },
  { code: CategoryPermission.EDIT, labelKey: 'catalog.categories.permissions.edit' },
  { code: CategoryPermission.DELETE, labelKey: 'catalog.categories.permissions.delete' },
  { code: CategoryPermission.CREATE, labelKey: 'catalog.categories.permissions.create' },
] as const;
