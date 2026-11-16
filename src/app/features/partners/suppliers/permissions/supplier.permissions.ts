export enum SupplierPermission {
  VIEW_LIST = 'CONTACTS_SUPPLIERS_VIEW_LIST',
  VIEW_DETAIL = 'CONTACTS_SUPPLIERS_VIEW_DETAIL',
  EDIT = 'CONTACTS_SUPPLIERS_EDIT',
  DELETE = 'CONTACTS_SUPPLIERS_DELETE',
  CREATE = 'CONTACTS_SUPPLIERS_CREATE',
}

export const SUPPLIER_PERMISSIONS = [
  { code: SupplierPermission.VIEW_LIST, labelKey: 'partners.suppliers.permissions.viewList' },
  { code: SupplierPermission.VIEW_DETAIL, labelKey: 'partners.suppliers.permissions.viewDetail' },
  { code: SupplierPermission.EDIT, labelKey: 'partners.suppliers.permissions.edit' },
  { code: SupplierPermission.DELETE, labelKey: 'partners.suppliers.permissions.delete' },
  { code: SupplierPermission.CREATE, labelKey: 'partners.suppliers.permissions.create' },
] as const;
