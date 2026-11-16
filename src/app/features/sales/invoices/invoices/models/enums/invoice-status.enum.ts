export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  FULLY_RETURNED = 'FULLY_RETURNED',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Borrador',
  [InvoiceStatus.PENDING_PAYMENT]: 'Pendiente de Pago',
  [InvoiceStatus.PARTIALLY_PAID]: 'Parcialmente Pagada',
  [InvoiceStatus.PAID]: 'Pagada',
  [InvoiceStatus.CANCELLED]: 'Cancelada',
  [InvoiceStatus.FULLY_RETURNED]: 'Totalmente Devuelta',
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_LABELS[status] ?? status;
}
