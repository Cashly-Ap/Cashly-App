import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageService } from '@core/i18n/language.service';
import { TranslationService } from '@core/i18n/translation.service';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import {
  isPurchaseOverdue,
  payableAmountClass,
  purchaseStatusTranslationKey,
  purchaseStatusVariant,
} from '@features/finance/treasury/payables/components/payables-presentation';

describe('payables presentation', () => {
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
      expect(payableAmountClass(false, tone)).toBe('text-surface-900 dark:text-surface-0');
    },
  );

  it('uses red for informational danger amounts', () => {
    expect(payableAmountClass(true, 'danger')).toBe('text-red-600 dark:text-red-400');
  });

  it.each([
    ['DRAFT', 'label'],
    ['CONFIRMED', 'info'],
    ['PAID', 'success'],
    ['OVERDUE', 'warning'],
    ['CANCELLED', 'danger'],
  ] as const)('maps %s to the %s badge variant', (status, variant) => {
    expect(purchaseStatusVariant(status)).toBe(variant);
  });

  it.each([
    ['PARTIALLY_PAID', 'Partially paid'],
    ['PAID', 'Paid'],
    ['CANCELLED', 'Cancelled'],
    ['OVERDUE', 'Overdue'],
  ])('translates the %s purchase status in English', (status, label) => {
    expect(TestBed.inject(TranslationService).t(purchaseStatusTranslationKey(status))).toBe(label);
  });

  const overdue = {
    status: 'CONFIRMED',
    balance: 10,
    dueDate: '2025-01-01',
  } as SupplierPurchaseDebt;

  it('marks unpaid purchases overdue after their due date', () => {
    expect(isPurchaseOverdue(overdue, '2026-10-31')).toBe(true);
  });

  it.each(['PAID', 'DRAFT', 'CANCELLED', 'FULLY_RETURNED'])(
    'does not mark %s purchases overdue',
    (status) => {
      expect(isPurchaseOverdue({ ...overdue, status }, '2026-10-31')).toBe(false);
    },
  );

  it('does not mark a settled purchase overdue even if its status is stale', () => {
    expect(isPurchaseOverdue({ ...overdue, balance: 0 }, '2026-10-31')).toBe(false);
  });
});
