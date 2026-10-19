import { UserProfile } from '../../../authorization/models/access.model';

export interface UserEdit extends UserProfile {
  userName: string;
  active: boolean;
}
