import { describe, it, expect, beforeEach } from 'vitest';
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    pipe = new DateFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should format string date to dd/mm/yyyy', () => {
      expect(pipe.transform('2024-12-30')).toBe('30/12/2024');
    });

    it('should format Date object to dd/mm/yyyy', () => {
      const date = new Date(2024, 11, 30);
      expect(pipe.transform(date)).toBe('30/12/2024');
    });

    it('should handle null value', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('should handle undefined value', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('should pad single digit day with zero', () => {
      expect(pipe.transform('2024-01-05')).toBe('05/01/2024');
    });

    it('should pad single digit month with zero', () => {
      expect(pipe.transform('2024-03-15')).toBe('15/03/2024');
    });

    it('should handle invalid date string', () => {
      expect(pipe.transform('invalid-date')).toBe('');
    });

    it('should format ISO date string correctly', () => {
      expect(pipe.transform('2024-06-15T10:30:00.000Z')).toBe('15/06/2024');
    });

    it('should handle first day of year', () => {
      expect(pipe.transform('2024-01-01')).toBe('01/01/2024');
    });

    it('should handle last day of year', () => {
      expect(pipe.transform('2024-12-31')).toBe('31/12/2024');
    });
  });
});
