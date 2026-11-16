import {
  CustomerType,
  CUSTOMER_TYPES,
  CUSTOMER_TYPE_LABELS,
  getCustomerTypeLabel,
} from '@features/partners/customers/models/enums/customer-type.enum';

describe('CustomerType', () => {
  it('should have all expected enum values', () => {
    expect(CustomerType.INDIVIDUAL).toBe('INDIVIDUAL');
    expect(CustomerType.BUSINESS).toBe('BUSINESS');
    expect(CustomerType.GOVERNMENT).toBe('GOVERNMENT');
    expect(CustomerType.NON_PROFIT).toBe('NON_PROFIT');
  });

  it('should have exactly 4 enum values', () => {
    expect(Object.keys(CustomerType).length).toBe(4);
  });
});

describe('CUSTOMER_TYPES', () => {
  it('should contain all customer types', () => {
    const values = CUSTOMER_TYPES.map((t) => t.value);
    expect(values).toContain(CustomerType.INDIVIDUAL);
    expect(values).toContain(CustomerType.BUSINESS);
    expect(values).toContain(CustomerType.GOVERNMENT);
    expect(values).toContain(CustomerType.NON_PROFIT);
  });

  it('should have correct labels', () => {
    expect(CUSTOMER_TYPES[0].label).toBe('Natural');
    expect(CUSTOMER_TYPES[1].label).toBe('Jurídico');
    expect(CUSTOMER_TYPES[2].label).toBe('Gobierno');
    expect(CUSTOMER_TYPES[3].label).toBe('Otros');
  });

  it('should be readonly', () => {
    expect(CUSTOMER_TYPES.length).toBe(4);
  });
});

describe('CUSTOMER_TYPE_LABELS', () => {
  it('should map each type to its label', () => {
    expect(CUSTOMER_TYPE_LABELS[CustomerType.INDIVIDUAL]).toBe('Natural');
    expect(CUSTOMER_TYPE_LABELS[CustomerType.BUSINESS]).toBe('Jurídico');
    expect(CUSTOMER_TYPE_LABELS[CustomerType.GOVERNMENT]).toBe('Gobierno');
    expect(CUSTOMER_TYPE_LABELS[CustomerType.NON_PROFIT]).toBe('Otros');
  });
});

describe('getCustomerTypeLabel', () => {
  it('should return correct label for known types', () => {
    expect(getCustomerTypeLabel(CustomerType.INDIVIDUAL)).toBe('Natural');
    expect(getCustomerTypeLabel(CustomerType.BUSINESS)).toBe('Jurídico');
    expect(getCustomerTypeLabel(CustomerType.GOVERNMENT)).toBe('Gobierno');
    expect(getCustomerTypeLabel(CustomerType.NON_PROFIT)).toBe('Otros');
  });

  it('should return the input for unknown types', () => {
    expect(getCustomerTypeLabel('UNKNOWN' as CustomerType)).toBe('UNKNOWN');
  });
});
