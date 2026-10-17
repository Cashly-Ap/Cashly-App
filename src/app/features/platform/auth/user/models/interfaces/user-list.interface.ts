import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface UserList {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  modulePermissions: BusinessModule[];
  deletable: boolean;
}
