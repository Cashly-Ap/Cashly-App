import { UserType } from '../enums/user-type.enum';
import { BusinessModule } from '../enums/business-module.enum';

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
