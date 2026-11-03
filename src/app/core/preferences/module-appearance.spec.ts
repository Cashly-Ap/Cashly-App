import { describe, expect, it } from 'vitest';
import { chartPalette, moduleGroupFromUrl, MODULE_APPEARANCE } from '@core/preferences/module-appearance';

describe('Module appearance', () => {
  it('keeps nested routes in their module group and ignores query strings', () => {
    expect(moduleGroupFromUrl('/finance/billing/invoices/new?copy=1')).toBe('finance');
    expect(moduleGroupFromUrl('/procurement/purchases/123/edit')).toBe('procurement');
    expect(moduleGroupFromUrl('/platform/auth/configuration')).toBe('platform');
    expect(moduleGroupFromUrl('/unknown')).toBe('platform');
  });

  it('assigns a distinct color to each module group', () => {
    const entries = Object.values(MODULE_APPEARANCE);
    expect(new Set(entries.map((entry) => entry.light)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.dark)).size).toBe(entries.length);
  });

  it('provides repeatable distinct chart colors without changing data length', () => {
    const colors = chartPalette(12, false);
    expect(colors).toHaveLength(12);
    expect(new Set(colors.slice(0, 8)).size).toBe(8);
    expect(colors[8]).toBe(colors[0]);
    expect(chartPalette(0, true)).toEqual([]);
    expect(chartPalette(3, true)).not.toEqual(chartPalette(3, false));
  });
});
