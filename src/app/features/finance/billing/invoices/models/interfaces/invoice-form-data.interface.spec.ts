import { describe, it, expect } from 'vitest';
import { InvoiceFormData } from '@features/finance/billing/invoices/models/interfaces/invoice-form-data.interface';

describe('InvoiceFormData interface', () => {
  it('should have all required properties', () => {
    const data: InvoiceFormData = {
      customerId: 'c1',
      customerAlias: 'Test Alias',
      customerLegalName: 'Test Legal Name C.A.',
      notes: 'Test notes',
      items: [
        {
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [],
        },
      ],
    };

    expect(data.customerId).toBe('c1');
    expect(data.customerAlias).toBe('Test Alias');
    expect(data.customerLegalName).toBe('Test Legal Name C.A.');
    expect(data.items).toHaveLength(1);
  });

  it('should accept empty items array', () => {
    const data: InvoiceFormData = {
      customerId: 'c2',
      customerAlias: '',
      customerLegalName: '',
      notes: '',
      items: [],
    };

    expect(data.items).toEqual([]);
  });
});
