import { describe, expect, it } from 'vitest';
import { english, spanish } from '@core/i18n/dictionaries';

describe('translation coverage', () => {
  it('keeps the same keys in Spanish and English', () => {
    expect(Object.keys(english).sort()).toEqual(Object.keys(spanish).sort());
  });

  it('does not contain empty translations', () => {
    for (const [key, value] of Object.entries(spanish)) {
      expect(value.trim(), key).not.toBe('');
    }
    for (const [key, value] of Object.entries(english)) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('translates the shared user-facing actions', () => {
    expect(english['shared.cancel']).toBe('Cancel');
    expect(english['shared.save']).toBe('Save');
    expect(english['shared.active']).toBe('Active');
    expect(english['shared.inactive']).toBe('Inactive');
    expect(english['shared.loading']).toBe('Loading...');
  });
});
