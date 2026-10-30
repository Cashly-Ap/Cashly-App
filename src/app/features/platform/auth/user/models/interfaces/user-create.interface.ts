import { Language } from '@core/i18n/language';
import { UserProfile } from '../../../authorization/models/access.model';

export interface UserCreate extends UserProfile {
  language?: Language;
  email: string;
  password: string;
  userName: string;
}
