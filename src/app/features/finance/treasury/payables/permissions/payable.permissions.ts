export enum PayablePermission {
  VIEW_LIST = 'FINANCE_TREASURY_PAYABLES_VIEW_LIST',
  VIEW_DEBT = 'FINANCE_TREASURY_PAYABLES_VIEW_DEBT',
  REPORT_PDF = 'FINANCE_TREASURY_PAYABLES_REPORT_PDF',
  PAY_ALL = 'FINANCE_TREASURY_PAYABLES_PAY_ALL',
  PARTIAL_PAYMENT = 'FINANCE_TREASURY_PAYABLES_PARTIAL_PAYMENT',
  PAY_DIRECT = 'FINANCE_TREASURY_PAYABLES_PAY_DIRECT',
  PAY_WITH_VALIDATION = 'FINANCE_TREASURY_PAYABLES_PAY_WITH_VALIDATION',
  REFUND = 'FINANCE_TREASURY_PAYABLES_REFUND',
  ADVANCE = 'FINANCE_TREASURY_PAYABLES_ADVANCE',
  APPROVE_PAYMENT = 'FINANCE_TREASURY_PAYABLES_APPROVE_PAYMENT',
  REJECT_PAYMENT = 'FINANCE_TREASURY_PAYABLES_REJECT_PAYMENT',
  EDIT = 'FINANCE_TREASURY_PAYABLES_EDIT',
  DELETE = 'FINANCE_TREASURY_PAYABLES_DELETE',
}

export const PAYABLE_PERMISSIONS = [
  {
    code: PayablePermission.VIEW_LIST,
    labelKey: 'finance.treasury.payables.permissions.viewList',
  },
  {
    code: PayablePermission.VIEW_DEBT,
    labelKey: 'finance.treasury.payables.permissions.viewDebt',
  },
  {
    code: PayablePermission.REPORT_PDF,
    labelKey: 'finance.treasury.payables.permissions.reportPdf',
  },
  {
    code: PayablePermission.PAY_ALL,
    labelKey: 'finance.treasury.payables.permissions.payAll',
  },
  {
    code: PayablePermission.PARTIAL_PAYMENT,
    labelKey: 'finance.treasury.payables.permissions.partialPayment',
  },
  {
    code: PayablePermission.PAY_DIRECT,
    labelKey: 'finance.treasury.payables.permissions.payDirect',
  },
  {
    code: PayablePermission.PAY_WITH_VALIDATION,
    labelKey: 'finance.treasury.payables.permissions.payWithValidation',
  },
  {
    code: PayablePermission.REFUND,
    labelKey: 'finance.treasury.payables.permissions.refund',
  },
  {
    code: PayablePermission.ADVANCE,
    labelKey: 'finance.treasury.payables.permissions.advance',
  },
  {
    code: PayablePermission.APPROVE_PAYMENT,
    labelKey: 'finance.treasury.payables.permissions.approvePayment',
  },
  {
    code: PayablePermission.REJECT_PAYMENT,
    labelKey: 'finance.treasury.payables.permissions.rejectPayment',
  },
  {
    code: PayablePermission.EDIT,
    labelKey: 'finance.treasury.payables.permissions.edit',
  },
  {
    code: PayablePermission.DELETE,
    labelKey: 'finance.treasury.payables.permissions.delete',
  },
] as const;
