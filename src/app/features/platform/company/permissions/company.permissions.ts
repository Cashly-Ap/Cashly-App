export enum CompanyPermission {
  VIEW = 'COMPANY_VIEW',
  EDIT = 'COMPANY_EDIT',
}

export const COMPANY_PERMISSIONS = [
  { code: CompanyPermission.VIEW, labelKey: 'platform.company.permissions.view' },
  { code: CompanyPermission.EDIT, labelKey: 'platform.company.permissions.edit' },
] as const;
