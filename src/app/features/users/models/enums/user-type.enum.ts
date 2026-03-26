export enum UserType {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
}

export interface UserTypeOption {
  label: string;
  value: UserType;
}

export const USER_TYPES: readonly UserTypeOption[] = [
  { label: 'Usuario', value: UserType.USER },
  { label: 'Vendedor', value: UserType.MERCHANT },
  { label: 'Administrador', value: UserType.ADMIN },
  { label: 'Despachador', value: UserType.DISPATCHER },
] as const;

export const USER_TYPE_LABELS: Record<UserType, string> = {
  [UserType.USER]: 'Usuario',
  [UserType.MERCHANT]: 'Vendedor',
  [UserType.ADMIN]: 'Administrador',
  [UserType.DISPATCHER]: 'Despachador',
};

export function getUserTypeLabel(type: UserType): string {
  return USER_TYPE_LABELS[type] || type;
}
