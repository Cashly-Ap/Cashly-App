import { describe, it, expect } from 'vitest';
import { InvoiceCreate } from './invoice-create.interface';
import { PaymentType } from '../enums/payment-type.enum';

describe('InvoiceCreate interface', () => {
  it('should have all required properties', () => {
    const data: InvoiceCreate = {
      customerId: 'c1',
      paymentType: PaymentType.CASH,
      notes: 'Test notes',
      lines: [
        {
          productId: 'p1',
          quantity: 5,
          unitPrice: 100,
          warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 5 }],
        },
      ],
    };

    expect(data.customerId).toBe('c1');
    expect(data.paymentType).toBe(PaymentType.CASH);
    expect(data.lines).toHaveLength(1);
    expect(data.lines[0].warehouseAllocations).toHaveLength(1);
  });

  it('should accept empty notes', () => {
    const data: InvoiceCreate = {
      customerId: 'c1',
      paymentType: PaymentType.CREDIT,
      notes: '',
      lines: [],
    };

    expect(data.notes).toBe('');
  });
});
