export enum ReceivablePermission {
  VIEW_LIST = 'FINANCE_TREASURY_RECEIVABLES_VIEW_LIST',
  VIEW_DEBT = 'FINANCE_TREASURY_RECEIVABLES_VIEW_DEBT',
  REPORT_PDF = 'FINANCE_TREASURY_RECEIVABLES_REPORT_PDF',
  PAY_ALL = 'FINANCE_TREASURY_RECEIVABLES_PAY_ALL',
  PARTIAL_PAYMENT = 'FINANCE_TREASURY_RECEIVABLES_PARTIAL_PAYMENT',
  REFUND = 'FINANCE_TREASURY_RECEIVABLES_REFUND',
  ADVANCE = 'FINANCE_TREASURY_RECEIVABLES_ADVANCE',
  APPROVE_PAYMENT = 'FINANCE_TREASURY_RECEIVABLES_APPROVE_PAYMENT',
  REJECT_PAYMENT = 'FINANCE_TREASURY_RECEIVABLES_REJECT_PAYMENT',
}

export const RECEIVABLE_PERMISSIONS = [
  { code: ReceivablePermission.VIEW_LIST, labelKey: 'finance.treasury.receivables.permissions.viewList' },
  { code: ReceivablePermission.VIEW_DEBT, labelKey: 'finance.treasury.receivables.permissions.viewDebt' },
  { code: ReceivablePermission.REPORT_PDF, labelKey: 'finance.treasury.receivables.permissions.reportPdf' },
  { code: ReceivablePermission.PAY_ALL, labelKey: 'finance.treasury.receivables.permissions.payAll' },
  { code: ReceivablePermission.PARTIAL_PAYMENT, labelKey: 'finance.treasury.receivables.permissions.partialPayment' },
  { code: ReceivablePermission.REFUND, labelKey: 'finance.treasury.receivables.permissions.refund' },
  { code: ReceivablePermission.ADVANCE, labelKey: 'finance.treasury.receivables.permissions.advance' },
  { code: ReceivablePermission.APPROVE_PAYMENT, labelKey: 'finance.treasury.receivables.permissions.approvePayment' },
  { code: ReceivablePermission.REJECT_PAYMENT, labelKey: 'finance.treasury.receivables.permissions.rejectPayment' },
] as const;
