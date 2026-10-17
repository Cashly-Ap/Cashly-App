import {
  PaymentType,
  PAYMENT_TYPES,
} from '@features/customers/models/enums/payment-type.enum';

describe('PaymentType', () => {
  it('should have all expected enum values', () => {
    expect(PaymentType.CASH).toBe('CASH');
    expect(PaymentType.CREDIT).toBe('CREDIT');
  });

  it('should have exactly 2 enum values', () => {
    expect(Object.keys(PaymentType).length).toBe(2);
  });
});

describe('PAYMENT_TYPES', () => {
  it('should contain all payment types', () => {
    const values = PAYMENT_TYPES.map((t) => t.value);
    expect(values).toContain(PaymentType.CASH);
    expect(values).toContain(PaymentType.CREDIT);
  });

  it('should have correct labels', () => {
    expect(PAYMENT_TYPES[0].label).toBe('Contado');
    expect(PAYMENT_TYPES[1].label).toBe('Crédito');
  });

  it('should be readonly', () => {
    expect(PAYMENT_TYPES.length).toBe(2);
  });
});
