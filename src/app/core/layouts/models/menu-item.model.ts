import { UserType } from '@features/auth/models';

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
}
