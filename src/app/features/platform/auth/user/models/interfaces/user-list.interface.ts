import { UserProfile } from '@features/platform/auth/authorization/models/access.model';
import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';

export interface UserList extends UserProfile {
  id: string;
  email: string;
  userName: string;
  photoPath?: string | null;
  role?: UserType;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  deletable: boolean;
}
