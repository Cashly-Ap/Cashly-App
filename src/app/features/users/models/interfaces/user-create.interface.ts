import { UserType } from '@features/users/models/enums/user-type.enum';

export interface UserCreate {
  email: string;
  password: string;
  userName: string;
  role: UserType;
  active: boolean;
}
