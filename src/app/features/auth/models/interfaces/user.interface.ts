import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export type UserType = 'OPERATOR' | 'ADMIN' | 'SUPER_ADMIN';

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
  userName: string;
  type: UserType;
  role: UserType;
  active: boolean;
  createdAt: string;
  modulePermissions: BusinessModule[];
}
