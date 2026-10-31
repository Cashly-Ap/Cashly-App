import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { CustomerInvoiceDebt } from '../models/interfaces/customer-invoice-debt.interface';
import {
  invoiceStatusSeverity,
  invoiceStatusTranslationKey,
  isInvoiceOverdue,
  receivableAmountClass,
} from './receivables-presentation';

describe('receivables presentation', () => {
  const language = signal<'en' | 'es'>('en');
  beforeEach(() => {
    language.set('en');
    TestBed.configureTestingModule({
      providers: [{ provide: LanguageService, useValue: { language } }],
    });
  });

  it.each(['success', 'danger', 'info'] as const)(
    'uses neutral amounts for %s in minimal mode',
    (tone) => {
      expect(receivableAmountClass(false, tone)).toBe('text-surface-900 dark:text-surface-0');
    },
  );

  it('uses blue for informational amounts in informative mode', () => {
    expect(receivableAmountClass(true, 'info')).toBe('text-blue-600 dark:text-blue-400');
  });

  it('uses neutral status badges in minimal mode', () => {
    expect(invoiceStatusSeverity('PENDING_PAYMENT', false)).toBe('contrast');
  });

  it('uses an informational badge for pending payments in informative mode', () => {
    expect(invoiceStatusSeverity('PENDING_PAYMENT', true)).toBe('info');
  });

  it.each([
    ['PENDING_PAYMENT', 'Pending'],
    ['PARTIALLY_PAID', 'Partially paid'],
    ['PAID', 'Paid'],
    ['CANCELLED', 'Cancelled'],
    ['DRAFT', 'Draft'],
  ])('translates the %s invoice status in English', (status, label) => {
    expect(TestBed.inject(TranslationService).t(invoiceStatusTranslationKey(status))).toBe(label);
  });

  const overdue = {
    status: 'PENDING_PAYMENT',
    balance: 10,
    dueDate: '2025-01-01',
  } as CustomerInvoiceDebt;

  it('marks unpaid invoices overdue after their due date', () => {
    expect(isInvoiceOverdue(overdue, '2026-10-31')).toBe(true);
  });

  it.each(['PAID', 'DRAFT', 'CANCELLED', 'FULLY_RETURNED'])(
    'does not mark %s invoices overdue',
    (status) => {
      expect(isInvoiceOverdue({ ...overdue, status }, '2026-10-31')).toBe(false);
    },
  );

  it('does not mark a settled invoice overdue even if its status is stale', () => {
    expect(isInvoiceOverdue({ ...overdue, balance: 0 }, '2026-10-31')).toBe(false);
  });
});
