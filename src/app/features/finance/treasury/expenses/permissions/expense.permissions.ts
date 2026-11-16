export enum ExpensePermission {
  VIEW_LIST = 'FINANCE_TREASURY_EXPENSES_VIEW_LIST',
  CREATE = 'FINANCE_TREASURY_EXPENSES_CREATE',
  DELETE = 'FINANCE_TREASURY_EXPENSES_DELETE',
  CANCEL = 'FINANCE_TREASURY_EXPENSES_CANCEL',
}

export const EXPENSE_PERMISSIONS = [
  {
    code: ExpensePermission.VIEW_LIST,
    labelKey: 'finance.treasury.expenses.permissions.viewList',
  },
  {
    code: ExpensePermission.CREATE,
    labelKey: 'finance.treasury.expenses.permissions.create',
  },
  {
    code: ExpensePermission.DELETE,
    labelKey: 'finance.treasury.expenses.permissions.delete',
  },
  {
    code: ExpensePermission.CANCEL,
    labelKey: 'finance.treasury.expenses.permissions.cancel',
  },
] as const;
