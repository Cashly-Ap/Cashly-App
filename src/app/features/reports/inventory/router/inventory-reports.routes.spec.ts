import { describe, it, expect } from 'vitest';
import { INVENTORY_REPORTS_ROUTES } from './inventory-reports.routes';

describe('Inventory Reports Routes', () => {
  it('should have the inventory reports page route', () => {
    expect(INVENTORY_REPORTS_ROUTES).toHaveLength(1);
    expect(INVENTORY_REPORTS_ROUTES[0].path).toBe('');
  });

  it('should be a valid Routes array', () => {
    expect(Array.isArray(INVENTORY_REPORTS_ROUTES)).toBe(true);
  });
});
