export enum UserType {
  OPERATOR = 'OPERATOR',
  ADMINISTRATION = 'ADMINISTRATION',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface UserTypeOption {
  label: string;
  value: UserType;
}

export const USER_TYPES: readonly UserTypeOption[] = [
  { label: 'Operadores', value: UserType.OPERATOR },
  { label: 'Administración', value: UserType.ADMINISTRATION },
  { label: 'Super Admin', value: UserType.SUPER_ADMIN },
] as const;

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.OPERATOR]: 'Operadores',
  [UserType.ADMINISTRATION]: 'Administración',
  [UserType.SUPER_ADMIN]: 'Super Admin',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] || type;
}
