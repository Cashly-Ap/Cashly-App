import { AppPermission } from '@features/platform/auth/permissions/app-permission';

export interface CatalogPermission {
  readonly code: AppPermission;
  readonly labelKey: string;
}

export interface CatalogModule {
  readonly moduleKey: string;
  readonly permissions: readonly CatalogPermission[];
}

export interface CatalogSection {
  readonly sectionKey: string | null;
  readonly modules: readonly CatalogModule[];
}

export interface CatalogArea {
  readonly areaKey: string;
  readonly sections: readonly CatalogSection[];
}
