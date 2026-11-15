export enum ReturnPermission {
  VIEW_LIST = 'SALES_INVOICES_RETURNS_VIEW_LIST',
  VIEW_DETAIL = 'SALES_INVOICES_RETURNS_VIEW_DETAIL',
  DELETE = 'SALES_INVOICES_RETURNS_DELETE',
  CREATE = 'SALES_INVOICES_RETURNS_CREATE',
}

export const RETURN_PERMISSIONS = [
  {
    code: ReturnPermission.VIEW_LIST,
    labelKey: 'platform.auth.permissions.sales_invoices_returns.view_list',
  },
  {
    code: ReturnPermission.VIEW_DETAIL,
    labelKey: 'platform.auth.permissions.sales_invoices_returns.view_detail',
  },
  {
    code: ReturnPermission.DELETE,
    labelKey: 'platform.auth.permissions.sales_invoices_returns.delete',
  },
  {
    code: ReturnPermission.CREATE,
    labelKey: 'platform.auth.permissions.sales_invoices_returns.create',
  },
] as const;
