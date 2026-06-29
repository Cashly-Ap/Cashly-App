export enum SupplierType {
  NATURAL = 'NATURAL',
  JURIDICO = 'JURIDICO',
}

export interface SupplierTypeOption {
  label: string;
  value: SupplierType;
}

export const SUPPLIER_TYPES: readonly SupplierTypeOption[] = [
  { label: 'Natural', value: SupplierType.NATURAL },
  { label: 'Jurídico', value: SupplierType.JURIDICO },
] as const;

export const SUPPLIER_TYPE_LABELS: Record<SupplierType, string> = {
  [SupplierType.NATURAL]: 'Natural',
  [SupplierType.JURIDICO]: 'Jurídico',
};

export function getSupplierTypeLabel(type: SupplierType): string {
  return SUPPLIER_TYPE_LABELS[type] || type;
}
