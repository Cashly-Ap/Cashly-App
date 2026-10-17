export enum ReturnType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export const RETURN_TYPE_LABELS: Record<ReturnType, string> = {
  [ReturnType.AUTOMATIC]: 'Automática',
  [ReturnType.MANUAL]: 'Manual',
};

export function getReturnTypeLabel(type: ReturnType): string {
  return RETURN_TYPE_LABELS[type] ?? type;
}
