import { describe, it, expect } from 'vitest';
import { InvoiceUpdate } from './invoice-edit.interface';
import { PaymentType } from '../enums/payment-type.enum';

describe('InvoiceUpdate interface', () => {
  it('should have all required properties', () => {
    const data: InvoiceUpdate = {
      paymentType: PaymentType.CREDIT,
      notes: 'Updated notes',
      lines: [
        {
          productId: 'p1',
          quantity: 10,
          unitPrice: 150,
          warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 10 }],
        },
      ],
    };

    expect(data.paymentType).toBe(PaymentType.CREDIT);
    expect(data.lines).toHaveLength(1);
  });

  it('should accept null notes', () => {
    const data: InvoiceUpdate = {
      paymentType: PaymentType.CASH,
      notes: null,
      lines: [],
    };

    expect(data.notes).toBeNull();
  });
});
