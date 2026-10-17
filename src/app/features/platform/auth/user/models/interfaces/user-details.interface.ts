import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface UserDetails {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  modulePermissions: BusinessModule[];
}
