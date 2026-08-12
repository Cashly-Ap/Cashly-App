import { describe, it, expect } from 'vitest';
import { QuoteFormData, QuoteLineFormData } from './quote-form-data.interface';

describe('QuoteLineFormData interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineFormData = {
      productId: 'p1',
      productCode: 'MOT-10',
      productName: 'Motor 10HP',
      quantity: 5,
      unitPrice: 100,
      stock: [],
      warehouseAllocations: [],
    };

    expect(obj.productId).toBe('p1');
    expect(obj.productCode).toBe('MOT-10');
    expect(obj.productName).toBe('Motor 10HP');
    expect(obj.quantity).toBe(5);
    expect(obj.unitPrice).toBe(100);
    expect(obj.stock).toHaveLength(0);
    expect(obj.warehouseAllocations).toHaveLength(0);
  });

  it('should accept stock items', () => {
    const obj: QuoteLineFormData = {
      productId: 'p2',
      productCode: 'MOT-20',
      productName: 'Motor 20HP',
      quantity: 3,
      unitPrice: 200,
      stock: [{ warehouseId: 'wh-001', warehouseName: 'Central', quantity: 50 }],
      warehouseAllocations: [],
    };

    expect(obj.stock).toHaveLength(1);
    expect(obj.stock[0].warehouseId).toBe('wh-001');
  });
});

describe('QuoteFormData interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteFormData = {
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
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

    expect(obj.customerId).toBe('c1');
    expect(obj.customerName).toBe('Test Customer');
    expect(obj.customerRif).toBe('J-12345678-9');
    expect(obj.notes).toBe('Test notes');
    expect(obj.items).toHaveLength(1);
  });

  it('should accept empty items array', () => {
    const obj: QuoteFormData = {
      customerId: 'c2',
      customerName: 'Customer B',
      customerRif: 'J-98765432-1',
      notes: '',
      items: [],
    };

    expect(obj.items).toHaveLength(0);
  });

  it('should accept multiple items', () => {
    const obj: QuoteFormData = {
      customerId: 'c3',
      customerName: 'Customer C',
      customerRif: 'J-11111111-1',
      notes: 'Multi-item quote',
      items: [
        {
          productId: 'p1',
          productCode: 'PRD-A',
          productName: 'Product A',
          quantity: 5,
          unitPrice: 100,
          stock: [],
          warehouseAllocations: [],
        },
        {
          productId: 'p2',
          productCode: 'PRD-B',
          productName: 'Product B',
          quantity: 3,
          unitPrice: 200,
          stock: [],
          warehouseAllocations: [],
        },
      ],
    };

    expect(obj.items).toHaveLength(2);
  });
});
