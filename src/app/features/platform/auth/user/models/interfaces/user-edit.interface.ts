import { Language } from '@core/i18n/language';
import { UserProfile } from '@features/platform/auth/authorization/models/access.model';

export interface UserEdit extends UserProfile {
  language?: Language;
  userName: string;
  active: boolean;
}
