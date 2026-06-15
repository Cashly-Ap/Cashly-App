import { UserType } from '@features/users/models/enums/user-type';
import { BusinessModule } from '@features/users/models/enums/business-module';

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
