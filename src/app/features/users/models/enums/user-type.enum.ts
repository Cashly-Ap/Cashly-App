export enum UserType {
  CUSTOMERS = 'CUSTOMERS',
  OPERATORS = 'OPERATORS',
  ADMINISTRATION = 'ADMINISTRATION',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface UserTypeOption {
  label: string;
  value: UserType;
}

export const USER_TYPES: readonly UserTypeOption[] = [
  { label: 'Clientes', value: UserType.CUSTOMERS },
  { label: 'Operadores', value: UserType.OPERATORS },
  { label: 'Administración', value: UserType.ADMINISTRATION },
  { label: 'Super Admin', value: UserType.SUPER_ADMIN },
] as const;

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.CUSTOMERS]: 'Clientes',
  [UserType.OPERATORS]: 'Operadores',
  [UserType.ADMINISTRATION]: 'Administración',
  [UserType.SUPER_ADMIN]: 'Super Admin',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] || type;
}
