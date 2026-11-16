export enum RolePermission {
  VIEW_LIST = 'ROLES_VIEW_LIST',
  VIEW_DETAIL = 'ROLES_VIEW_DETAIL',
  EDIT = 'ROLES_EDIT',
  DELETE = 'ROLES_DELETE',
  CREATE = 'ROLES_CREATE',
}

export const ROLE_PERMISSIONS = [
  { code: RolePermission.VIEW_LIST, labelKey: 'platform.auth.roles.permissions.viewList' },
  { code: RolePermission.VIEW_DETAIL, labelKey: 'platform.auth.roles.permissions.viewDetail' },
  { code: RolePermission.EDIT, labelKey: 'platform.auth.roles.permissions.edit' },
  { code: RolePermission.DELETE, labelKey: 'platform.auth.roles.permissions.delete' },
  { code: RolePermission.CREATE, labelKey: 'platform.auth.roles.permissions.create' },
] as const;
