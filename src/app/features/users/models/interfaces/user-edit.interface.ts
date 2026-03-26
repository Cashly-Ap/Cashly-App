import { UserType } from '../enums/user-type.enum';

export interface UserEdit {
  id: string;
  email: string;
  displayName: string;
  type: UserType;
  active: boolean;
}
