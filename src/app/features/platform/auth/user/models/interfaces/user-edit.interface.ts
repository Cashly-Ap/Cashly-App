import { Language } from '@core/i18n/language';
import { UserProfile } from '../../../authorization/models/access.model';

export interface UserEdit extends UserProfile {
  language?: Language;
  userName: string;
  active: boolean;
}
