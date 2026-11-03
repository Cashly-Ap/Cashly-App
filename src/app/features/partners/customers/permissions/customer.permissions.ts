export enum CustomerPermission {
  VIEW_LIST = 'CONTACTS_CUSTOMERS_VIEW_LIST',
  VIEW_DETAIL = 'CONTACTS_CUSTOMERS_VIEW_DETAIL',
  EDIT = 'CONTACTS_CUSTOMERS_EDIT',
  DELETE = 'CONTACTS_CUSTOMERS_DELETE',
  CREATE = 'CONTACTS_CUSTOMERS_CREATE',
  VIEW_BALANCE = 'CONTACTS_CUSTOMERS_VIEW_BALANCE',
  BALANCE = 'CONTACTS_CUSTOMERS_BALANCE',
}

export const CUSTOMER_PERMISSIONS = [
  { code: CustomerPermission.VIEW_LIST, labelKey: 'partners.customers.permissions.viewList' },
  { code: CustomerPermission.VIEW_DETAIL, labelKey: 'partners.customers.permissions.viewDetail' },
  { code: CustomerPermission.EDIT, labelKey: 'partners.customers.permissions.edit' },
  { code: CustomerPermission.DELETE, labelKey: 'partners.customers.permissions.delete' },
  { code: CustomerPermission.CREATE, labelKey: 'partners.customers.permissions.create' },
  { code: CustomerPermission.VIEW_BALANCE, labelKey: 'partners.customers.permissions.viewBalance' },
  { code: CustomerPermission.BALANCE, labelKey: 'partners.customers.permissions.balance' },
] as const;
