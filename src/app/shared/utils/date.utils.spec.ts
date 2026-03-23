import { describe, it, expect } from 'vitest';
import { DateUtils } from './date.utils';

describe('DateUtils', () => {
  describe('toISODateString', () => {
    it('should format Date to ISO date string', () => {
      const date = new Date(2024, 0, 15);
      expect(DateUtils.toISODateString(date)).toBe('2024-01-15');
    });

    it('should format string date to ISO date string', () => {
      expect(DateUtils.toISODateString('2024-03-25')).toBe('2024-03-25');
    });

    it('should pad single digit month and day', () => {
      const date = new Date(2024, 4, 5);
      expect(DateUtils.toISODateString(date)).toBe('2024-05-05');
    });

    it('should return empty string for null', () => {
      expect(DateUtils.toISODateString(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(DateUtils.toISODateString(undefined)).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      expect(DateUtils.toISODateString('invalid')).toBe('');
    });
  });

  describe('toDisplayDate', () => {
    it('should format Date to display format DD/MM/YYYY', () => {
      const date = new Date(2024, 0, 15);
      expect(DateUtils.toDisplayDate(date)).toBe('15/01/2024');
    });

    it('should format string date to display format', () => {
      expect(DateUtils.toDisplayDate('2024-03-25')).toBe('25/03/2024');
    });

    it('should pad single digit month and day', () => {
      const date = new Date(2024, 4, 5);
      expect(DateUtils.toDisplayDate(date)).toBe('05/05/2024');
    });

    it('should return empty string for null', () => {
      expect(DateUtils.toDisplayDate(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(DateUtils.toDisplayDate(undefined)).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      expect(DateUtils.toDisplayDate('invalid')).toBe('');
    });
  });

  describe('toDate', () => {
    it('should return Date object from Date', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.toDate(date);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return Date object from string', () => {
      const result = DateUtils.toDate('2024-03-25');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(2);
      expect(result?.getDate()).toBe(25);
    });

    it('should return null for null input', () => {
      expect(DateUtils.toDate(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(DateUtils.toDate(undefined)).toBeNull();
    });

    it('should return null for invalid date string', () => {
      expect(DateUtils.toDate('invalid')).toBeNull();
    });
  });
});
