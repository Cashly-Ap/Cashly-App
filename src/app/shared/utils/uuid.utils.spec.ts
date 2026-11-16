import { describe, expect, it } from 'vitest';
import { isUuid } from '@shared/utils/uuid.utils';

describe('isUuid', () => {
  it('accepts canonical UUID values in any case', () => {
    expect(isUuid('5f0f4f1e-8f4b-4c6e-9f6d-2a1b3c4d5e6f')).toBe(true);
    expect(isUuid('5F0F4F1E-8F4B-4C6E-9F6D-2A1B3C4D5E6F')).toBe(true);
  });

  it('rejects empty, partial and padded values', () => {
    expect(isUuid('')).toBe(false);
    expect(isUuid('wh-1')).toBe(false);
    expect(isUuid(' 5f0f4f1e-8f4b-4c6e-9f6d-2a1b3c4d5e6f ')).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});
