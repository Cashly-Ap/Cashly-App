export enum UserPermission {
  VIEW_LIST = 'USERS_VIEW_LIST',
  VIEW_DETAIL = 'USERS_VIEW_DETAIL',
  EDIT = 'USERS_EDIT',
  DELETE = 'USERS_DELETE',
  CREATE = 'USERS_CREATE',
}

export const USER_PERMISSIONS = [
  { code: UserPermission.VIEW_LIST, labelKey: 'platform.auth.users.permissions.viewList' },
  { code: UserPermission.VIEW_DETAIL, labelKey: 'platform.auth.users.permissions.viewDetail' },
  { code: UserPermission.EDIT, labelKey: 'platform.auth.users.permissions.edit' },
  { code: UserPermission.DELETE, labelKey: 'platform.auth.users.permissions.delete' },
  { code: UserPermission.CREATE, labelKey: 'platform.auth.users.permissions.create' },
] as const;
