import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { CompanyPermission } from '@features/platform/company/permissions';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';

const MODULE_PREFIXES: Record<BusinessModule, string> = {
  [BusinessModule.USERS]: 'USERS',
  [BusinessModule.ROLES]: 'ROLES',
  [BusinessModule.DEPARTMENTS]: 'DEPARTMENTS',
  [BusinessModule.CATALOG_PRODUCTS]: 'CATALOG_PRODUCTS',
  [BusinessModule.CATALOG_CATEGORIES]: 'CATALOG_CATEGORIES',
  [BusinessModule.CATALOG_PRICES]: 'CATALOG_PRICES',
  [BusinessModule.INVENTORY_WAREHOUSES]: 'INVENTORY_WAREHOUSES',
  [BusinessModule.SALES_QUOTES]: 'SALES_QUOTES',
  [BusinessModule.SALES_ORDERS]: 'SALES_ORDERS',
  [BusinessModule.CONTACTS_CUSTOMERS]: 'CONTACTS_CUSTOMERS',
  [BusinessModule.FINANCE_INVOICES]: 'FINANCE_BILLING_INVOICES',
  [BusinessModule.FINANCE_RETURNS]: 'FINANCE_BILLING_RETURNS',
  [BusinessModule.FINANCE_CREDIT_NOTES]: 'FINANCE_BILLING_CREDIT_NOTES',
  [BusinessModule.FINANCE_DEBIT_NOTES]: 'FINANCE_BILLING_DEBIT_NOTES',
  [BusinessModule.FINANCE_CASH_REGISTER]: 'FINANCE_TREASURY_CASH_REGISTER',
  [BusinessModule.FINANCE_RECEIVABLES]: 'FINANCE_TREASURY_RECEIVABLES',
  [BusinessModule.FINANCE_PAYMENT_METHODS]: 'FINANCE_TREASURY_PAYMENT_METHODS',
  [BusinessModule.PURCHASES]: 'PURCHASES',
  [BusinessModule.CONTACTS_SUPPLIERS]: 'CONTACTS_SUPPLIERS',
  [BusinessModule.DASHBOARD]: 'DASHBOARD',
};

const ACTION_SUFFIXES: Partial<Record<PermissionAction, string>> = {
  READ: 'VIEW_LIST',
  DETAILS: 'VIEW_DETAIL',
  CREATE: 'CREATE',
  UPDATE: 'EDIT',
  DELETE: 'DELETE',
  EXPORT: 'DOWNLOAD_PDF',
  CONFIRM: 'CONFIRM',
  CANCEL: 'CANCEL',
  DUPLICATE: 'DUPLICATE',
  INVOICE_DUPLICATE: 'DUPLICATE',
  CUSTOMER_BALANCE: 'VIEW_BALANCE',
  BALANCE: 'BALANCE',
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  CASH_HISTORY: 'CASH_HISTORY',
  REPORT_CASH_REGISTER: 'REPORT_CASH_REGISTER',
  REPORT_QUOTES: 'REPORT_PDF',
  REPORT_ORDERS: 'REPORT_PDF',
  REPORT_PURCHASES: 'REPORT_PDF',
  REPORT_PRODUCTS: 'REPORT_PDF',
  REPORT_COMMERCIAL_CATALOG: 'COMMERCIAL_CATALOG_PDF',
  REPORT_STOCK: 'REPORT_STOCK',
  REPORT_MOVEMENTS: 'REPORT_MOVEMENTS',
  REPORT_INVOICES: 'REPORT_PDF',
  REPORT_RECEIVABLES: 'REPORT_PDF',
  STOCK: 'VIEW_STOCK',
  MOVEMENT_HISTORY: 'MOVEMENT_HISTORY',
  RECORD_ENTRY: 'RECORD_ENTRY',
  RECORD_EXIT: 'RECORD_EXIT',
  PAY_ALL: 'PAY_ALL',
  PARTIAL_PAYMENT: 'PARTIAL_PAYMENT',
  PAY_PARTIAL: 'PARTIAL_PAYMENT',
  REFUND: 'REFUND',
  ADVANCE: 'ADVANCE',
  APPROVE_PAYMENT: 'APPROVE_PAYMENT',
  REJECT_PAYMENT: 'REJECT_PAYMENT',
  PAY_WITH_VALIDATION: 'PAY_WITH_VALIDATION',
  PAY_DIRECT: 'PAY_DIRECT',
  EXECUTE: 'RECORD_ENTRY',
};

const MODULE_CODE_OVERRIDES: Readonly<
  Record<string, Partial<Record<PermissionAction, AppPermission>>>
> = {
  COMPANY: {
    READ: CompanyPermission.VIEW as AppPermission,
    UPDATE: CompanyPermission.EDIT as AppPermission,
  },
};

function modulePrefix(module: BusinessModule): string | undefined {
  return MODULE_PREFIXES[module];
}

export function legacyPermission(
  module: BusinessModule,
  action: PermissionAction,
): AppPermission | undefined {
  if (module === BusinessModule.DASHBOARD) {
    return action === 'READ' ? ('DASHBOARD_VIEW' as AppPermission) : undefined;
  }
  const override = MODULE_CODE_OVERRIDES[module as string]?.[action];
  if (override) return override;
  const suffix = ACTION_SUFFIXES[action];
  const prefix = modulePrefix(module);
  if (!suffix || !prefix) return undefined;
  return `${prefix}_${suffix}` as AppPermission;
}

function normalizeLegacyMatrix(value: Record<string, unknown>): AppPermission[] {
  const result = new Set<AppPermission>();
  for (const [module, actions] of Object.entries(value)) {
    if (!Array.isArray(actions)) continue;
    for (const action of actions) {
      if (typeof action !== 'string') continue;
      const code = legacyPermission(module as BusinessModule, action as PermissionAction);
      if (code) result.add(code);
    }
  }
  return [...result];
}

export function normalizePermissions(value: unknown): AppPermission[] {
  if (Array.isArray(value)) {
    return [...new Set(value.filter((entry): entry is AppPermission => typeof entry === 'string'))];
  }
  if (value && typeof value === 'object') {
    return normalizeLegacyMatrix(value as Record<string, unknown>);
  }
  return [];
}

export function isPermissionCode(value: string): value is AppPermission {
  return value.includes('_') && !Object.values(BusinessModule).includes(value as BusinessModule);
}
