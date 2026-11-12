import { StatusVariant } from '@shared/models/status-variant';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';

export type PayableTone = 'success' | 'danger' | 'info';

export function payableAmountClass(informative: boolean, tone: PayableTone): string {
  if (!informative) return 'text-surface-900 dark:text-surface-0';
  const colors: Record<PayableTone, string> = {
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-surface-900 dark:text-surface-0',
  };
  return colors[tone];
}

export function purchaseStatusTranslationKey(status: string): string {
  const keys: Record<string, string> = {
    DRAFT: 'finance.treasury.payables.statusDraft',
    CONFIRMED: 'finance.treasury.payables.statusConfirmed',
    PENDING: 'finance.treasury.payables.statusPending',
    PENDING_PAYMENT: 'finance.treasury.payables.statusPending',
    PARTIAL: 'finance.treasury.payables.statusPartial',
    PARTIALLY_PAID: 'finance.treasury.payables.statusPartiallyPaid',
    PAID: 'finance.treasury.payables.statusPaid',
    OVERDUE: 'finance.treasury.payables.statusOverdue',
    CANCELLED: 'finance.treasury.payables.statusCancelled',
    PARTIAL_RETURN: 'finance.treasury.payables.statusPartialReturn',
    FULLY_RETURNED: 'finance.treasury.payables.statusFullyReturned',
  };
  return keys[status] ?? status;
}

export function purchaseStatusVariant(status: string): StatusVariant {
  if (status === 'PAID') return 'success';
  if (status === 'CANCELLED' || status === 'FULLY_RETURNED') return 'danger';
  if (status === 'OVERDUE') return 'warning';
  if (status === 'DRAFT') return 'label';
  return 'info';
}

export function isPurchaseOverdue(purchase: SupplierPurchaseDebt, today: string): boolean {
  return (
    !!purchase.dueDate &&
    purchase.dueDate < today &&
    purchase.balance > 0 &&
    purchase.status !== 'DRAFT' &&
    purchase.status !== 'CANCELLED' &&
    purchase.status !== 'PAID' &&
    purchase.status !== 'FULLY_RETURNED'
  );
}
