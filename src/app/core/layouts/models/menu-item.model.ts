import { UserType } from '@features/platform/auth/models/interfaces/user.interface';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

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
  requiredAction?: import('@features/platform/auth/authorization/models/access.model').PermissionAction;
  requiredModule?: BusinessModule;
}
