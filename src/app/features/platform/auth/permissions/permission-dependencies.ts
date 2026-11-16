import { AppPermission } from '@features/platform/auth/permissions/app-permission';
import { CatalogModule } from '@features/platform/auth/permissions/permission-catalog.types';

export type PermissionGrant = (code: AppPermission) => boolean;

const alwaysGrant: PermissionGrant = () => true;

export function isRootPermission(code: AppPermission): boolean {
  return code.endsWith('_VIEW_LIST') || code === 'DASHBOARD_VIEW' || code === 'COMPANY_VIEW';
}

export function rootPermission(module: CatalogModule): AppPermission | undefined {
  return module.permissions.find((permission) => isRootPermission(permission.code))?.code;
}

export function findPermissionModule(
  modules: readonly CatalogModule[],
  code: AppPermission,
): CatalogModule | undefined {
  return modules.find((module) =>
    module.permissions.some((permission) => permission.code === code),
  );
}

export function togglePermission(
  modules: readonly CatalogModule[],
  selected: readonly AppPermission[],
  code: AppPermission,
  checked: boolean,
  canGrant: PermissionGrant = alwaysGrant,
): AppPermission[] {
  const module = findPermissionModule(modules, code);
  if (!module) return [...selected];

  const root = rootPermission(module);
  const next = new Set(selected);

  if (!checked) {
    next.delete(code);
    if (code === root) {
      for (const permission of module.permissions) next.delete(permission.code);
    }
    return [...next];
  }

  if (root && !canGrant(root)) return [...selected];

  if (root) next.add(root);
  next.add(code);
  return [...next];
}

export function normalizePermissionSelection(
  modules: readonly CatalogModule[],
  selected: readonly AppPermission[],
  canGrant: PermissionGrant = alwaysGrant,
): AppPermission[] {
  const next = new Set(selected);
  for (const module of modules) {
    const root = rootPermission(module);
    if (!root || !canGrant(root)) continue;
    if (module.permissions.some((permission) => next.has(permission.code))) {
      next.add(root);
    }
  }
  return [...next];
}

export function replaceModulePermissions(
  selected: readonly AppPermission[],
  module: CatalogModule,
  codes: readonly AppPermission[],
): AppPermission[] {
  const moduleCodes = new Set(module.permissions.map((permission) => permission.code));
  const next = new Set(selected.filter((code) => !moduleCodes.has(code)));
  for (const code of codes) next.add(code);
  return [...next];
}
