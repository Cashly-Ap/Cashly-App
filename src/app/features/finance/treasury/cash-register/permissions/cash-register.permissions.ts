export enum CashRegisterPermission {
  VIEW_LIST = 'FINANCE_TREASURY_CASH_REGISTER_VIEW_LIST',
  CASH_HISTORY = 'FINANCE_TREASURY_CASH_REGISTER_CASH_HISTORY',
  REPORT_CASH_REGISTER = 'FINANCE_TREASURY_CASH_REGISTER_REPORT_CASH_REGISTER',
  OPEN = 'FINANCE_TREASURY_CASH_REGISTER_OPEN',
  CLOSE = 'FINANCE_TREASURY_CASH_REGISTER_CLOSE',
}

export const CASH_REGISTER_PERMISSIONS = [
  { code: CashRegisterPermission.VIEW_LIST, labelKey: 'finance.treasury.cashRegister.permissions.viewList' },
  { code: CashRegisterPermission.CASH_HISTORY, labelKey: 'finance.treasury.cashRegister.permissions.cashHistory' },
  { code: CashRegisterPermission.REPORT_CASH_REGISTER, labelKey: 'finance.treasury.cashRegister.permissions.reportCashRegister' },
  { code: CashRegisterPermission.OPEN, labelKey: 'finance.treasury.cashRegister.permissions.open' },
  { code: CashRegisterPermission.CLOSE, labelKey: 'finance.treasury.cashRegister.permissions.close' },
] as const;
