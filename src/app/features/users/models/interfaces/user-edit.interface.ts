import { UserType } from '@features/users/models/enums/user-type';

export interface UserEdit {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
}
