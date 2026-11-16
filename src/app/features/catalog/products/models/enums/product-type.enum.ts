export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  SERVICE = 'SERVICE',
  COMPOSITE = 'COMPOSITE',
}

export const PRODUCT_TYPES: readonly { value: ProductType; label: string }[] = [
  { value: ProductType.PHYSICAL, label: 'Físico' },
  { value: ProductType.SERVICE, label: 'Servicio' },
  { value: ProductType.COMPOSITE, label: 'Compuesto' },
] as const;

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.PHYSICAL]: 'Físico',
  [ProductType.SERVICE]: 'Servicio',
  [ProductType.COMPOSITE]: 'Compuesto',
};

export function getProductTypeLabel(type: ProductType): string {
  return PRODUCT_TYPE_LABELS[type] ?? type;
}
