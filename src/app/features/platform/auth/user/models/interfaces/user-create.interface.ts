import { UserProfile } from '../../../authorization/models/access.model';

export interface UserCreate extends UserProfile {
  email: string;
  password: string;
  userName: string;
}
