import { UserType } from '@features/users/models/enums/user-type';

export interface UserCreate {
  email: string;
  password: string;
  userName: string;
  role: UserType;
  active: boolean;
}
