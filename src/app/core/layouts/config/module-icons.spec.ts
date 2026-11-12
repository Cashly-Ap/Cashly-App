import { moduleIconForUrl } from '@core/layouts/config/module-icons';
import { describe, expect, it } from 'vitest';

describe('moduleIconForUrl', () => {
  it('should resolve the icon of every module list route', () => {
    expect(moduleIconForUrl('/catalog/categories')).toBe('pi pi-tags');
    expect(moduleIconForUrl('/catalog/products')).toBe('pi pi-box');
    expect(moduleIconForUrl('/partners/customers')).toBe('pi pi-id-card');
    expect(moduleIconForUrl('/sales/quotes')).toBe('pi pi-file-edit');
    expect(moduleIconForUrl('/finance/treasury/receivables')).toBe('pi pi-money-bill');
    expect(moduleIconForUrl('/analytics/dashboard')).toBe('pi pi-chart-line');
  });

  it('should resolve the icon on detail routes of the same module', () => {
    expect(moduleIconForUrl('/partners/customers/42')).toBe('pi pi-id-card');
    expect(moduleIconForUrl('/catalog/products/42/edit')).toBe('pi pi-box');
  });

  it('should return null for routes without a business module', () => {
    expect(moduleIconForUrl('/platform/auth/preferences')).toBeNull();
  });
});
