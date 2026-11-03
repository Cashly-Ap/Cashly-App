export enum PaymentMethodPermission {
  VIEW_LIST = 'FINANCE_TREASURY_PAYMENT_METHODS_VIEW_LIST',
  VIEW_DETAIL = 'FINANCE_TREASURY_PAYMENT_METHODS_VIEW_DETAIL',
  EDIT = 'FINANCE_TREASURY_PAYMENT_METHODS_EDIT',
  DELETE = 'FINANCE_TREASURY_PAYMENT_METHODS_DELETE',
  CREATE = 'FINANCE_TREASURY_PAYMENT_METHODS_CREATE',
}

export const PAYMENT_METHOD_PERMISSIONS = [
  { code: PaymentMethodPermission.VIEW_LIST, labelKey: 'finance.treasury.paymentMethods.permissions.viewList' },
  { code: PaymentMethodPermission.VIEW_DETAIL, labelKey: 'finance.treasury.paymentMethods.permissions.viewDetail' },
  { code: PaymentMethodPermission.EDIT, labelKey: 'finance.treasury.paymentMethods.permissions.edit' },
  { code: PaymentMethodPermission.DELETE, labelKey: 'finance.treasury.paymentMethods.permissions.delete' },
  { code: PaymentMethodPermission.CREATE, labelKey: 'finance.treasury.paymentMethods.permissions.create' },
] as const;
