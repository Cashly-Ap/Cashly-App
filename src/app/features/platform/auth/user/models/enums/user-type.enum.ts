export enum UserType {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface UserTypeOption {
  label: string;
  value: UserType;
}

export const USER_TYPES: readonly UserTypeOption[] = [
  { label: 'Operador', value: UserType.OPERATOR },
  { label: 'Administrador', value: UserType.ADMIN },
  { label: 'Super Admin', value: UserType.SUPER_ADMIN },
] as const;

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.OPERATOR]: 'Operador',
  [UserType.ADMIN]: 'Administrador',
  [UserType.SUPER_ADMIN]: 'Super Admin',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] ?? type;
}
