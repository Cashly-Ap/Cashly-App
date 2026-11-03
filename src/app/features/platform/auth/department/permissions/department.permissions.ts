export enum DepartmentPermission {
  VIEW_LIST = 'DEPARTMENTS_VIEW_LIST',
  VIEW_DETAIL = 'DEPARTMENTS_VIEW_DETAIL',
  EDIT = 'DEPARTMENTS_EDIT',
  DELETE = 'DEPARTMENTS_DELETE',
  CREATE = 'DEPARTMENTS_CREATE',
}

export const DEPARTMENT_PERMISSIONS = [
  { code: DepartmentPermission.VIEW_LIST, labelKey: 'platform.auth.departments.permissions.viewList' },
  { code: DepartmentPermission.VIEW_DETAIL, labelKey: 'platform.auth.departments.permissions.viewDetail' },
  { code: DepartmentPermission.EDIT, labelKey: 'platform.auth.departments.permissions.edit' },
  { code: DepartmentPermission.DELETE, labelKey: 'platform.auth.departments.permissions.delete' },
  { code: DepartmentPermission.CREATE, labelKey: 'platform.auth.departments.permissions.create' },
] as const;
