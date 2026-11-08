import { describe, expect, it } from 'vitest';
import { cloneValue, deepEqual } from '@shared/utils/value-comparison';

describe('value comparison', () => {
  it('compares primitives, dates, arrays and nested objects', () => {
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual('a', 'a')).toBe(true);
    expect(deepEqual('a', 'b')).toBe(false);
    expect(deepEqual(new Date('2026-01-01'), new Date('2026-01-01'))).toBe(true);
    expect(deepEqual(new Date('2026-01-01'), new Date('2026-01-02'))).toBe(false);
    expect(deepEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(deepEqual([1, { a: 2 }], [1, { a: 3 }])).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('clones nested values without sharing references', () => {
    const source = { a: 1, nested: { b: 2 }, list: [{ c: new Date('2026-01-01') }] };
    const copy = cloneValue(source);

    expect(copy).toEqual(source);
    expect(copy).not.toBe(source);
    expect(copy.nested).not.toBe(source.nested);
    expect(copy.list[0]).not.toBe(source.list[0]);
    expect(copy.list[0].c).not.toBe(source.list[0].c);
    expect(deepEqual(copy, source)).toBe(true);
  });
});
