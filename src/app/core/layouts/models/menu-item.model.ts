import { UserType } from '@features/auth/models/interfaces/user.interface';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  children?: MenuItem[];
  badge?: string;
  badgeSeverity?: 'success' | 'info' | 'warning' | 'danger';
  visible?: boolean;
  separator?: boolean;
  command?: () => void;
  isMegaMenu?: boolean;
  allowedRoles?: UserType[];
  requiredModule?: BusinessModule;
}
