import { describe, expect, it } from 'vitest';
import {
  CashMovementType,
  CASH_MOVEMENT_TYPE_LABELS,
  cashMovementAffectsCash,
  getCashMovementTypeLabel,
} from '@features/finance/treasury/cash-register/models/enums/cash-movement-type.enum';

describe('CashMovementType', () => {
  it('provides a Spanish label for every movement type', () => {
    expect(Object.values(CashMovementType)).toHaveLength(11);
    expect(Object.keys(CASH_MOVEMENT_TYPE_LABELS)).toHaveLength(11);
    expect(getCashMovementTypeLabel(CashMovementType.PAYMENT)).toBe('Pago');
    expect(getCashMovementTypeLabel(CashMovementType.CREDIT_NOTE)).toBe('Nota de crédito');
  });

  it('keeps unknown values available as a fallback', () => {
    expect(getCashMovementTypeLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('identifies which movement types affect the cash balance', () => {
    expect(cashMovementAffectsCash(CashMovementType.PAYMENT)).toBe(true);
    expect(cashMovementAffectsCash(CashMovementType.EXPENSE)).toBe(true);
    expect(cashMovementAffectsCash(CashMovementType.REFUND)).toBe(true);
    expect(cashMovementAffectsCash(CashMovementType.CREDIT_NOTE)).toBe(false);
    expect(cashMovementAffectsCash(CashMovementType.DEBIT_NOTE)).toBe(false);
    expect(cashMovementAffectsCash(CashMovementType.RETURN)).toBe(false);
    expect(cashMovementAffectsCash(CashMovementType.INVOICE)).toBe(false);
  });
});
