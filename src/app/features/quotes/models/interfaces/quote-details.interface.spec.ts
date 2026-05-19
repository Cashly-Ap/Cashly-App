import { describe, it, expect } from 'vitest';
import {
  QuoteAllocationDetail,
  QuoteWarehouseStock,
  QuoteLineDetail,
  QuoteDetails,
} from './quote-details.interface';
import { QuoteStatus } from '../enums/quote-status.enum';

describe('QuoteAllocationDetail interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteAllocationDetail = {
      warehouseId: 'wh-001',
      warehouseName: 'Central Warehouse',
      allocatedQuantity: 10,
    };

    expect(obj.warehouseId).toBe('wh-001');
    expect(obj.warehouseName).toBe('Central Warehouse');
    expect(obj.allocatedQuantity).toBe(10);
  });

  it('should accept optional warehouseCode', () => {
    const obj: QuoteAllocationDetail = {
      warehouseId: 'wh-002',
      warehouseName: 'Secondary',
      warehouseCode: 'WH2',
      allocatedQuantity: 5,
    };

    expect(obj.warehouseCode).toBe('WH2');
  });
});

describe('QuoteWarehouseStock interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteWarehouseStock = {
      warehouseId: 'wh-001',
      warehouseName: 'Central Warehouse',
      available: 50,
    };

    expect(obj.warehouseId).toBe('wh-001');
    expect(obj.warehouseName).toBe('Central Warehouse');
    expect(obj.available).toBe(50);
  });
});

describe('QuoteLineDetail interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteLineDetail = {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 100,
      subtotal: 500,
      allocations: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Central',
          allocatedQuantity: 5,
        },
      ],
    };

    expect(obj.id).toBe('line-001');
    expect(obj.productId).toBe('p1');
    expect(obj.productName).toBe('Motor 10HP');
    expect(obj.productCode).toBe('MOT-10');
    expect(obj.quantity).toBe(5);
    expect(obj.unitPrice).toBe(100);
    expect(obj.subtotal).toBe(500);
    expect(obj.allocations).toHaveLength(1);
  });

  it('should accept optional warehouseStocks', () => {
    const obj: QuoteLineDetail = {
      id: 'line-002',
      productId: 'p2',
      productName: 'Motor 20HP',
      productCode: 'MOT-20',
      quantity: 3,
      unitPrice: 200,
      subtotal: 600,
      allocations: [],
      warehouseStocks: [
        {
          warehouseId: 'wh-001',
          warehouseName: 'Central',
          available: 40,
        },
      ],
    };

    expect(obj.warehouseStocks).toHaveLength(1);
  });
});

describe('QuoteDetails interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteDetails = {
      id: 'q-001',
      quoteNumber: 'QT-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      createdBy: 'user-001',
      createdByName: 'John Doe',
      status: QuoteStatus.DRAFT,
      notes: 'Test notes',
      subtotal: 500,
      lines: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    expect(obj.id).toBe('q-001');
    expect(obj.quoteNumber).toBe('QT-001');
    expect(obj.customerId).toBe('c1');
    expect(obj.customerName).toBe('Test Customer');
    expect(obj.customerRif).toBe('J-12345678-9');
    expect(obj.createdBy).toBe('user-001');
    expect(obj.createdByName).toBe('John Doe');
    expect(obj.status).toBe(QuoteStatus.DRAFT);
    expect(obj.notes).toBe('Test notes');
    expect(obj.subtotal).toBe(500);
    expect(obj.lines).toHaveLength(0);
    expect(obj.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(obj.updatedAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should accept null notes', () => {
    const obj: QuoteDetails = {
      id: 'q-002',
      quoteNumber: 'QT-002',
      customerId: 'c2',
      customerName: 'Customer B',
      customerRif: 'J-98765432-1',
      createdBy: 'user-002',
      createdByName: 'Jane Doe',
      status: QuoteStatus.CONVERTED_TO_INVOICE,
      notes: null,
      subtotal: 0,
      lines: [],
      createdAt: '2025-02-01T00:00:00Z',
      updatedAt: '2025-02-01T00:00:00Z',
    };

    expect(obj.notes).toBeNull();
  });

  it('should accept lines with allocations', () => {
    const obj: QuoteDetails = {
      id: 'q-003',
      quoteNumber: 'QT-003',
      customerId: 'c3',
      customerName: 'Customer C',
      customerRif: 'J-11111111-1',
      createdBy: 'user-003',
      createdByName: 'Bob Smith',
      status: QuoteStatus.CANCELLED,
      notes: null,
      subtotal: 1100,
      lines: [
        {
          id: 'line-001',
          productId: 'p1',
          productName: 'Product A',
          productCode: 'PRD-A',
          quantity: 5,
          unitPrice: 100,
          subtotal: 500,
          allocations: [
            {
              warehouseId: 'wh-001',
              warehouseName: 'Central',
              allocatedQuantity: 5,
            },
          ],
        },
      ],
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
    };

    expect(obj.lines).toHaveLength(1);
    expect(obj.lines[0].allocations).toHaveLength(1);
  });
});
