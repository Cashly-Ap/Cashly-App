import {
  BusinessModule,
  BUSINESS_MODULE_LABELS,
} from '@features/users/models/enums/business-module.enum';

describe('BusinessModule', () => {
  it('should have all expected enum values', () => {
    expect(BusinessModule.USERS).toBe('USERS');
    expect(BusinessModule.INVENTORY).toBe('INVENTORY');
    expect(BusinessModule.SALES).toBe('SALES');
    expect(BusinessModule.FINANCE).toBe('FINANCES');
    expect(BusinessModule.PURCHASES).toBe('PURCHASES');
    expect(BusinessModule.CUSTOMER_PORTAL).toBe('CUSTOMER_PORTAL');
    expect(BusinessModule.DOCUMENT_ADMIN).toBe('DOCUMENT_ADMIN');
  });

  it('should have exactly 8 enum values', () => {
    expect(Object.keys(BusinessModule).length).toBe(8);
  });
});

describe('BUSINESS_MODULE_LABELS', () => {
  it('should map each module to its label', () => {
    expect(BUSINESS_MODULE_LABELS[BusinessModule.USERS]).toBe('Gestión de Usuarios');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.INVENTORY]).toBe('Inventario');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.SALES]).toBe('Gestión Comercial');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.FINANCE]).toBe('Finanzas');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.PURCHASES]).toBe('Compras');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.CUSTOMER_PORTAL]).toBe('Portal Web de Clientes');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.DOCUMENT_ADMIN]).toBe('Reportes');
  });

  it('should have labels for all enum values', () => {
    const moduleKeys = Object.keys(BusinessModule) as BusinessModule[];
    moduleKeys.forEach((module) => {
      expect(BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBeDefined();
      expect(typeof BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBe('string');
    });
  });
});
