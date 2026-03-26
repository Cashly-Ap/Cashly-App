import { UserType } from '../enums/user-type.enum';

export interface UserList {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
  createdAt: string;
}
