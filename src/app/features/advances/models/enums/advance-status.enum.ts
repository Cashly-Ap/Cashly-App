export enum AdvanceStatus {
  ACTIVE = 'ACTIVE',
  PARTIALLY_CONSUMED = 'PARTIALLY_CONSUMED',
  FULLY_CONSUMED = 'FULLY_CONSUMED',
  CANCELLED = 'CANCELLED',
}

export const ADVANCE_STATUS_LABELS: Record<AdvanceStatus, string> = {
  [AdvanceStatus.ACTIVE]: 'Activo',
  [AdvanceStatus.PARTIALLY_CONSUMED]: 'Parcialmente Usado',
  [AdvanceStatus.FULLY_CONSUMED]: 'Totalmente Usado',
  [AdvanceStatus.CANCELLED]: 'Anulado',
};

export function getAdvanceStatusLabel(status: AdvanceStatus): string {
  return ADVANCE_STATUS_LABELS[status] ?? status;
}
