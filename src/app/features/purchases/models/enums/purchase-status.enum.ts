export enum PurchaseStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  [PurchaseStatus.DRAFT]: 'Borrador',
  [PurchaseStatus.CONFIRMED]: 'Confirmado',
  [PurchaseStatus.CANCELLED]: 'Cancelado',
};

export function getPurchaseStatusLabel(status: PurchaseStatus): string {
  return PURCHASE_STATUS_LABELS[status] ?? status;
}
