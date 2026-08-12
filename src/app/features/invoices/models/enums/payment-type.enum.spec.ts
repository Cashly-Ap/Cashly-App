import { describe, it, expect } from 'vitest';
import {
  PaymentType,
  PAYMENT_TYPE_LABELS,
  getPaymentTypeLabel,
} from '@features/invoices/models/enums/payment-type.enum';

describe('PaymentType', () => {
  it('should have CASH value', () => {
    expect(PaymentType.CASH).toBe('CASH');
  });

  it('should have CREDIT value', () => {
    expect(PaymentType.CREDIT).toBe('CREDIT');
  });
});

describe('PAYMENT_TYPE_LABELS', () => {
  it('should have label for CASH', () => {
    expect(PAYMENT_TYPE_LABELS[PaymentType.CASH]).toBe('Contado');
  });

  it('should have label for CREDIT', () => {
    expect(PAYMENT_TYPE_LABELS[PaymentType.CREDIT]).toBe('Crédito');
  });
});

describe('getPaymentTypeLabel', () => {
  it('should return label for valid payment type', () => {
    expect(getPaymentTypeLabel(PaymentType.CASH)).toBe('Contado');
  });

  it('should return payment type string for unknown value', () => {
    expect(getPaymentTypeLabel('TRANSFER' as any)).toBe('TRANSFER');
  });
});
