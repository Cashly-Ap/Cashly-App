import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface PermissionEntry {
  action: PermissionAction;
  labelKey: string;
  descriptionKey: string;
  sortOrder: number;
}

export interface PermissionGroup {
  key: string;
  labelKey: string;
  sortOrder: number;
  permissions: PermissionEntry[];
}

export interface PermissionCatalogModule {
  module: BusinessModule;
  parent?: string;
  section?: string;
  sortOrder: number;
  groups: PermissionGroup[];
}

export interface PermissionCatalogDomain {
  module: BusinessModule;
  labelKey: string;
  sortOrder: number;
  permissions: PermissionEntry[];
}

export interface PermissionCatalogArea {
  area: string;
  labelKey: string;
  sortOrder: number;
  domains: PermissionCatalogDomain[];
}
