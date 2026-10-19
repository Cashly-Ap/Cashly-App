import { HttpContextToken } from '@angular/common/http';
export const ACCESS_REFRESH_REQUEST = new HttpContextToken<boolean>(() => false);
import { BusinessModule } from '../../user/models/enums/business-module.enum';
export type PermissionAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  | 'EXECUTE';
export type PermissionMatrix = Partial<Record<BusinessModule, PermissionAction[]>>;
export interface CurrentAccess {
  roleId: string;
  roleName: string;
  departmentId: string;
  systemAdministrator: boolean;
  permissions: PermissionMatrix;
}
export interface PermissionRegistry {
  module: BusinessModule;
  actions: PermissionAction[];
}
export interface SelectionOption {
  id: string;
  name: string;
}
export interface Department {
  id: string;
  name: string;
  description: string;
  active: boolean;
  version: number;
}
export interface Role extends Department {
  systemKey: string | null;
  permissions: PermissionMatrix;
}
export interface UserProfile {
  firstName: string;
  lastName: string;
  address: {
    street: string | null;
    city: string | null;
    region: string | null;
    country: string | null;
    postalCode: string | null;
  } | null;
  phone: string | null;
  roleId: string;
  departmentId: string;
  roleName?: string;
  departmentName?: string;
}
