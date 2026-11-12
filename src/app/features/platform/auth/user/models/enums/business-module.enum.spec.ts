import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '@features/platform/auth/user/models/enums/business-module.enum';

const NAVBAR_CONTRACT_MODULES = [
  'USERS',
  'ROLES',
  'DEPARTMENTS',
  'CATALOG_PRODUCTS',
  'CATALOG_CATEGORIES',
  'CATALOG_PRICES',
  'INVENTORY_WAREHOUSES',
  'SALES_QUOTES',
  'SALES_ORDERS',
  'CONTACTS_CUSTOMERS',
  'FINANCE_INVOICES',
  'FINANCE_RETURNS',
  'FINANCE_CREDIT_NOTES',
  'FINANCE_DEBIT_NOTES',
  'FINANCE_CASH_REGISTER',
  'FINANCE_RECEIVABLES',
  'FINANCE_PAYABLES',
  'FINANCE_PAYMENT_METHODS',
  'PURCHASES',
  'CONTACTS_SUPPLIERS',
  'DASHBOARD',
];

const LEGACY_MODULES = [
  'COMPANY',
  'DOCUMENTS',
  'FINANCE_BILLING',
  'FINANCE_TREASURY',
  'INVENTORY',
  'SALES',
  'CATALOG',
  'FINANCE',
  'FINANCES',
  'DOCUMENT_ADMIN',
];

describe('BusinessModule', () => {
  it('matches exactly the navbar contract modules in contract order', () => {
    expect(Object.values(BusinessModule)).toEqual(NAVBAR_CONTRACT_MODULES);
    expect(Object.values(BusinessModule)).toHaveLength(21);
  });

  it('exposes each enum key as its own value', () => {
    for (const [key, value] of Object.entries(BusinessModule)) {
      expect(value).toBe(key);
    }
  });

  it('does not expose legacy or aggregate modules', () => {
    const values: string[] = Object.values(BusinessModule);
    for (const legacy of LEGACY_MODULES) {
      expect(values).not.toContain(legacy);
    }
  });

  it('includes the consolidated customer contacts module', () => {
    expect(BusinessModule.CONTACTS_CUSTOMERS).toBe('CONTACTS_CUSTOMERS');
  });
});

describe('BUSINESS_MODULE_LABELS', () => {
  it('maps each contract module to its label key', () => {
    expect(BUSINESS_MODULE_LABELS[BusinessModule.USERS]).toBe('platform.auth.userManagement');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.INVENTORY_WAREHOUSES]).toBe(
      'platform.auth.inventoryWarehouses',
    );
    expect(BUSINESS_MODULE_LABELS[BusinessModule.CONTACTS_CUSTOMERS]).toBe(
      'platform.auth.contactsCustomers',
    );
    expect(BUSINESS_MODULE_LABELS[BusinessModule.FINANCE_CASH_REGISTER]).toBe(
      'platform.auth.financeCashRegister',
    );
    expect(BUSINESS_MODULE_LABELS[BusinessModule.PURCHASES]).toBe('platform.auth.purchases');
  });

  it('has a non-empty label key for every contract module and no extra keys', () => {
    expect(Object.keys(BUSINESS_MODULE_LABELS).sort()).toEqual([...NAVBAR_CONTRACT_MODULES].sort());
    for (const module of NAVBAR_CONTRACT_MODULES) {
      expect(BUSINESS_MODULE_LABELS[module as BusinessModule]).toMatch(/^platform\.auth\./);
    }
  });
});
