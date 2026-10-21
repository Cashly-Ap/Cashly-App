import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

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
  photoPath?: string | null;
  type: UserType;
  role: UserType;
  active: boolean;
  createdAt: string;
  modulePermissions: BusinessModule[];
}
