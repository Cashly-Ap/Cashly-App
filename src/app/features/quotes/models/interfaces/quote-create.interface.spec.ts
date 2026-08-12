import { describe, it, expect } from 'vitest';
import {
  QuoteLineAllocationCreate,
  QuoteLineCreate,
  QuoteCreate,
} from '@features/quotes/models/interfaces/quote-create.interface';

describe('QuoteLineAllocationCreate interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineAllocationCreate = {
      warehouseId: 'wh-001',
      allocatedQuantity: 10,
    };

    expect(obj.warehouseId).toBe('wh-001');
    expect(obj.allocatedQuantity).toBe(10);
  });
});

describe('QuoteLineCreate interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineCreate = {
      productId: 'p1',
      quantity: 5,
      unitPrice: 100,
      warehouseAllocations: [
        {
          warehouseId: 'wh-001',
          allocatedQuantity: 5,
        },
      ],
    };

    expect(obj.productId).toBe('p1');
    expect(obj.quantity).toBe(5);
    expect(obj.unitPrice).toBe(100);
    expect(obj.warehouseAllocations).toHaveLength(1);
  });

  it('should accept empty warehouseAllocations', () => {
    const obj: QuoteLineCreate = {
      productId: 'p2',
      quantity: 3,
      unitPrice: 200,
      warehouseAllocations: [],
    };

    expect(obj.warehouseAllocations).toHaveLength(0);
  });
});

describe('QuoteCreate interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteCreate = {
      customerId: 'c1',
      notes: 'Test notes',
      lines: [
        {
          productId: 'p1',
          quantity: 5,
          unitPrice: 100,
          warehouseAllocations: [],
        },
      ],
    };

    expect(obj.customerId).toBe('c1');
    expect(obj.notes).toBe('Test notes');
    expect(obj.lines).toHaveLength(1);
  });

  it('should accept null notes', () => {
    const obj: QuoteCreate = {
      customerId: 'c2',
      notes: null,
      lines: [],
    };

    expect(obj.notes).toBeNull();
  });

  it('should accept multiple lines', () => {
    const obj: QuoteCreate = {
      customerId: 'c3',
      notes: 'Multi-line quote',
      lines: [
        {
          productId: 'p1',
          quantity: 5,
          unitPrice: 100,
          warehouseAllocations: [],
        },
        {
          productId: 'p2',
          quantity: 3,
          unitPrice: 200,
          warehouseAllocations: [],
        },
      ],
    };

    expect(obj.lines).toHaveLength(2);
  });
});
