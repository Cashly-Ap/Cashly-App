export enum PaymentStatus {
  DRAFT = 'DRAFT',
  APPLIED = 'APPLIED',
  PARTIALLY_APPLIED = 'PARTIALLY_APPLIED',
  CANCELLED = 'CANCELLED',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.DRAFT]: 'Borrador',
  [PaymentStatus.APPLIED]: 'Aplicado',
  [PaymentStatus.PARTIALLY_APPLIED]: 'Parcialmente Aplicado',
  [PaymentStatus.CANCELLED]: 'Cancelado',
};

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}
