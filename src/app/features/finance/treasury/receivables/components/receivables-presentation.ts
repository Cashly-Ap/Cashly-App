import { CustomerInvoiceDebt } from '../models/interfaces/customer-invoice-debt.interface';

export type ReceivableTone = 'success' | 'danger' | 'info';

export function receivableAmountClass(informative: boolean, tone: ReceivableTone): string {
  if (!informative) return 'text-surface-900 dark:text-surface-0';
  const colors: Record<ReceivableTone, string> = {
    success: 'text-green-600 dark:text-green-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };
  return colors[tone];
}

export function invoiceStatusTranslationKey(status: string): string {
  const keys: Record<string, string> = {
    DRAFT: 'finance.billing.invoices.draft',
    PENDING: 'finance.treasury.receivables.pending',
    PENDING_PAYMENT: 'finance.treasury.receivables.pending',
    PARTIAL: 'finance.treasury.receivables.partial',
    PARTIALLY_PAID: 'finance.billing.invoices.partiallyPaid',
    PAID: 'finance.treasury.receivables.paid',
    FULLY_RETURNED: 'finance.treasury.receivables.returned',
    CANCELLED: 'finance.treasury.receivables.cancelled',
    DELIVERED: 'finance.treasury.receivables.delivered',
  };
  return keys[status] ?? status;
}

export function invoiceStatusSeverity(
  status: string,
  informative: boolean,
): 'success' | 'danger' | 'info' | 'contrast' {
  if (!informative || status === 'DRAFT') return 'contrast';
  if (status === 'PAID') return 'success';
  if (status === 'CANCELLED') return 'danger';
  return 'info';
}

export function isInvoiceOverdue(invoice: CustomerInvoiceDebt, today: string): boolean {
  return (
    !!invoice.dueDate &&
    invoice.dueDate < today &&
    invoice.balance > 0 &&
    invoice.status !== 'DRAFT' &&
    invoice.status !== 'CANCELLED' &&
    invoice.status !== 'PAID' &&
    invoice.status !== 'FULLY_RETURNED'
  );
}
