export type UserType = 'CUSTOMERS' | 'OPERATORS' | 'ADMINISTRATION' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  password?: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  role: UserType;
  active: boolean;
  createdAt: string;
  merchantId?: string;
  commissionDeductionPercentage: number;
}

