import { describe, it, expect } from 'vitest';
import { REPORTS_ROUTES } from '@features/reports/router/reports.routes';
import { INVENTORY_REPORTS_ROUTES } from '@features/reports/inventory/router/inventory-reports.routes';

describe('Reports Routes', () => {
  it('should have 2 top-level routes', () => {
    expect(REPORTS_ROUTES).toHaveLength(2);
  });

  it('should have inventory as child route', () => {
    expect(REPORTS_ROUTES[1].path).toBe('inventory');
  });

  it('should use lazy loading for inventory module', () => {
    expect(REPORTS_ROUTES[1].loadChildren).toBeDefined();
  });

  it('should reference INVENTORY_REPORTS_ROUTES', () => {
    expect(INVENTORY_REPORTS_ROUTES).toBeDefined();
    expect(Array.isArray(INVENTORY_REPORTS_ROUTES)).toBe(true);
  });
});
