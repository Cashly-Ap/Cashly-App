import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';

export interface UserEdit {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
}
