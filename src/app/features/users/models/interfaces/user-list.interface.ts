import { UserType } from '../enums/user-type.enum';

export interface UserList {
  id: string;
  email: string;
  userName: string;
  role: UserType;
  active: boolean;
  createdAt: string;
}
