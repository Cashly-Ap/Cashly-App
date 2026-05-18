import { BusinessModule, BUSINESS_MODULE_LABELS } from './business-module.enum';

describe('BusinessModule', () => {
  it('should have all expected enum values', () => {
    expect(BusinessModule.USERS).toBe('USERS');
    expect(BusinessModule.INVENTORY).toBe('INVENTORY');
    expect(BusinessModule.SALES).toBe('SALES');
    expect(BusinessModule.FINANCE).toBe('FINANCE');
    expect(BusinessModule.PURCHASES).toBe('PURCHASES');
    expect(BusinessModule.CUSTOMER_PORTAL).toBe('CUSTOMER_PORTAL');
    expect(BusinessModule.DOCUMENT_ADMIN).toBe('DOCUMENT_ADMIN');
  });

  it('should have exactly 7 enum values', () => {
    expect(Object.keys(BusinessModule).length).toBe(7);
  });
});

describe('BUSINESS_MODULE_LABELS', () => {
  it('should map each module to its label', () => {
    expect(BUSINESS_MODULE_LABELS[BusinessModule.USERS]).toBe('Gestión de Usuarios y Roles');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.INVENTORY]).toBe('Gestión de Inventario (Inventario 360°)');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.SALES]).toBe('Gestión Comercial (Ventas)');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.FINANCE]).toBe('Finanzas y Control de Crédito');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.PURCHASES]).toBe('Módulo de Compras');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.CUSTOMER_PORTAL]).toBe('Portal Web de Clientes');
    expect(BUSINESS_MODULE_LABELS[BusinessModule.DOCUMENT_ADMIN]).toBe('Administrador Documental Global');
  });

  it('should have labels for all enum values', () => {
    const moduleKeys = Object.keys(BusinessModule) as BusinessModule[];
    moduleKeys.forEach((module) => {
      expect(BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBeDefined();
      expect(typeof BUSINESS_MODULE_LABELS[BusinessModule[module]]).toBe('string');
    });
  });
});
