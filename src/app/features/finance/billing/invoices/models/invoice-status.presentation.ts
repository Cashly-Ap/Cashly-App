import { StatusVariant } from '@shared/models/status-variant';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';

export function invoiceStatusVariant(status: InvoiceStatus | string): StatusVariant {
  const variants: Record<string, StatusVariant> = {
    [InvoiceStatus.DRAFT]: 'label',
    [InvoiceStatus.PENDING_PAYMENT]: 'info',
    [InvoiceStatus.PARTIALLY_PAID]: 'info',
    [InvoiceStatus.PAID]: 'success',
    [InvoiceStatus.CANCELLED]: 'danger',
    [InvoiceStatus.FULLY_RETURNED]: 'info',
  };
  return variants[status] ?? 'label';
}

export function returnStatusVariant(returnStatus: string | null): StatusVariant | undefined {
  if (returnStatus === 'PARTIAL') return 'warning';
  if (returnStatus === 'FULL') return 'info';
  return undefined;
}
