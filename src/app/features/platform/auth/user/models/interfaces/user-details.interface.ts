import { Language } from '@core/i18n/language';
import { UserProfile } from '@features/platform/auth/authorization/models/access.model';
import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';

export interface UserDetails extends UserProfile {
  language?: Language;
  id: string;
  email: string;
  userName: string;
  photoPath?: string | null;
  role?: UserType;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
