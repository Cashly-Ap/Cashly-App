import { describe, it, expect } from 'vitest';
import {
  QuoteLineAllocationEdit,
  QuoteLineEdit,
  QuoteEdit,
} from '@features/quotes/models/interfaces/quote-edit.interface';

describe('QuoteLineAllocationEdit interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineAllocationEdit = {
      warehouseId: 'wh-001',
      allocatedQuantity: 10,
    };

    expect(obj.warehouseId).toBe('wh-001');
    expect(obj.allocatedQuantity).toBe(10);
  });
});

describe('QuoteLineEdit interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineEdit = {
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

  it('should accept optional id', () => {
    const obj: QuoteLineEdit = {
      id: 'line-001',
      productId: 'p2',
      quantity: 3,
      unitPrice: 200,
      warehouseAllocations: [],
    };

    expect(obj.id).toBe('line-001');
  });

  it('should accept optional productName and productCode', () => {
    const obj: QuoteLineEdit = {
      productId: 'p3',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 2,
      unitPrice: 150,
      warehouseAllocations: [],
    };

    expect(obj.productName).toBe('Motor 10HP');
    expect(obj.productCode).toBe('MOT-10');
  });
});

describe('QuoteEdit interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteEdit = {
      notes: 'Updated notes',
      lines: [
        {
          productId: 'p1',
          quantity: 5,
          unitPrice: 100,
          warehouseAllocations: [],
        },
      ],
    };

    expect(obj.notes).toBe('Updated notes');
    expect(obj.lines).toHaveLength(1);
  });

  it('should accept null notes', () => {
    const obj: QuoteEdit = {
      notes: null,
      lines: [],
    };

    expect(obj.notes).toBeNull();
  });

  it('should accept lines with optional id', () => {
    const obj: QuoteEdit = {
      notes: 'Edit with line ids',
      lines: [
        {
          id: 'line-001',
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

    expect(obj.lines[0].id).toBe('line-001');
    expect(obj.lines[1].id).toBeUndefined();
  });
});
