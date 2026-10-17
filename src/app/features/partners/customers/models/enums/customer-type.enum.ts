export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  NON_PROFIT = 'NON_PROFIT',
}

export interface CustomerTypeOption {
  label: string;
  value: CustomerType;
}

export const CUSTOMER_TYPES: readonly CustomerTypeOption[] = [
  { label: 'Natural', value: CustomerType.INDIVIDUAL },
  { label: 'Jurídico', value: CustomerType.BUSINESS },
  { label: 'Gobierno', value: CustomerType.GOVERNMENT },
  { label: 'Otros', value: CustomerType.NON_PROFIT },
] as const;

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  [CustomerType.INDIVIDUAL]: 'Natural',
  [CustomerType.BUSINESS]: 'Jurídico',
  [CustomerType.GOVERNMENT]: 'Gobierno',
  [CustomerType.NON_PROFIT]: 'Otros',
};

export function getCustomerTypeLabel(type: CustomerType): string {
  return CUSTOMER_TYPE_LABELS[type] || type;
}
