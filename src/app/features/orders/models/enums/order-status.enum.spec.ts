import { describe, it, expect } from 'vitest';
import { OrderStatus, ORDER_STATUS_LABELS, getOrderStatusLabel } from './order-status.enum';

describe('OrderStatus', () => {
  it('should have DRAFT value', () => {
    expect(OrderStatus.DRAFT).toBe('DRAFT');
  });

  it('should have CONFIRMED value', () => {
    expect(OrderStatus.CONFIRMED).toBe('CONFIRMED');
  });

  it('should have CANCELLED value', () => {
    expect(OrderStatus.CANCELLED).toBe('CANCELLED');
  });

  it('should have INVOICED value', () => {
    expect(OrderStatus.INVOICED).toBe('INVOICED');
  });

  it('should have 5 values', () => {
    expect(Object.keys(OrderStatus).filter((k) => isNaN(Number(k)))).toHaveLength(5);
  });
});

describe('ORDER_STATUS_LABELS', () => {
  it('should have label for DRAFT', () => {
    expect(ORDER_STATUS_LABELS[OrderStatus.DRAFT]).toBe('Borrador');
  });

  it('should have label for CONFIRMED', () => {
    expect(ORDER_STATUS_LABELS[OrderStatus.CONFIRMED]).toBe('Confirmado');
  });

  it('should have label for CANCELLED', () => {
    expect(ORDER_STATUS_LABELS[OrderStatus.CANCELLED]).toBe('Cancelado');
  });

  it('should have label for INVOICED', () => {
    expect(ORDER_STATUS_LABELS[OrderStatus.INVOICED]).toBe('Facturado');
  });
});

describe('getOrderStatusLabel', () => {
  it('should return label for valid status', () => {
    expect(getOrderStatusLabel(OrderStatus.DRAFT)).toBe('Borrador');
    expect(getOrderStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmado');
    expect(getOrderStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelado');
    expect(getOrderStatusLabel(OrderStatus.INVOICED)).toBe('Facturado');
  });

  it('should return status string for unknown value', () => {
    expect(getOrderStatusLabel('UNKNOWN' as any)).toBe('UNKNOWN');
  });
});
