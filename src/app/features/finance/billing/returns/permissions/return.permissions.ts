export enum ReturnPermission {
  VIEW_LIST = 'FINANCE_BILLING_RETURNS_VIEW_LIST',
  VIEW_DETAIL = 'FINANCE_BILLING_RETURNS_VIEW_DETAIL',
  DELETE = 'FINANCE_BILLING_RETURNS_DELETE',
  CREATE = 'FINANCE_BILLING_RETURNS_CREATE',
}

export const RETURN_PERMISSIONS = [
  { code: ReturnPermission.VIEW_LIST, labelKey: 'finance.billing.returns.permissions.viewList' },
  {
    code: ReturnPermission.VIEW_DETAIL,
    labelKey: 'finance.billing.returns.permissions.viewDetail',
  },
  { code: ReturnPermission.DELETE, labelKey: 'finance.billing.returns.permissions.delete' },
  { code: ReturnPermission.CREATE, labelKey: 'finance.billing.returns.permissions.create' },
] as const;
