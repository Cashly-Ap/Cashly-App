import { describe, it, expect } from 'vitest';
import { FinanceMapper } from './finance.mapper';
import { PaymentMethodDetail } from '../../models/interfaces';

describe('FinanceMapper', () => {
  const mockDetail: PaymentMethodDetail = {
    id: 'pm-001',
    code: 'CASH',
    name: 'Efectivo',
    description: 'Pago en efectivo',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  };

  describe('toPaymentMethodList', () => {
    it('should convert detail to list', () => {
      const result = FinanceMapper.toPaymentMethodList(mockDetail);
      expect(result.id).toBe('pm-001');
      expect(result.name).toBe('Efectivo');
      expect(result.isActive).toBe(true);
    });
  });

  describe('formatCreatedAt', () => {
    it('should format date to locale string', () => {
      const result = FinanceMapper.formatCreatedAt('2025-01-15T00:00:00Z');
      expect(result).toContain('2025');
    });
  });
});
