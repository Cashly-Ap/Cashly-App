import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '@features/platform/auth/user/models/enums/business-module.enum';

describe('BusinessModule', () => {
  it('should have all expected enum values', () => {
    expect(BusinessModule.USERS).toBe('USERS');
    expect(BusinessModule.ROLES).toBe('ROLES');
    expect(BusinessModule.DEPARTMENTS).toBe('DEPARTMENTS');
    expect(BusinessModule.CATALOG).toBe('CATALOG');
    expect(BusinessModule.INVENTORY).toBe('INVENTORY');
    expect(BusinessModule.SALES).toBe('SALES');
    expect(BusinessModule.FINANCE).toBe('FINANCES');
    expect(BusinessModule.PURCHASES).toBe('PURCHASES');
    expect(BusinessModule.DOCUMENT_ADMIN).toBe('DOCUMENT_ADMIN');
  });

  it('should have exactly 11 enum values', () => {
    expect(Object.keys(BusinessModule).length).toBe(11);
  });
});

describe('BUSINESS_MODULE_LABELS', () => {
  it('should map each module to its label', () => {
    expect(BUSINESS_MODULE_LABELS[BusinessModule.USERS]).toBe('platform.auth.userManagement');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.INVENTORY]).toBe('platform.auth.inventory');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.SALES]).toBe('platform.auth.salesManagement');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.FINANCE]).toBe('platform.auth.finance');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.PURCHASES]).toBe('platform.auth.purchases');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.DOCUMENT_ADMIN]).toBe('platform.auth.reports');
  });

  it('should have labels for all enum values', () => {
    const moduleKeys = Object.keys(BusinessModule) as BusinessModule[];
    moduleKeys.forEach((module) => {
      expect(BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBeDefined();
      expect(typeof BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBe('string');
    });
  });
});
