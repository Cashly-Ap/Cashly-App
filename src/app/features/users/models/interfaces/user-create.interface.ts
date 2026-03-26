import { UserType } from '../enums/user-type.enum';

export interface UserCreate {
  email: string;
  password: string;
  displayName: string;
  type: UserType;
  active: boolean;
}
