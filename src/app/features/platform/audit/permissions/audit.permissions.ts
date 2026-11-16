export enum AuditPermission {
  VIEW_LIST = 'AUDIT_TRAIL_VIEW_LIST',
}

export const AUDIT_PERMISSIONS = [
  { code: AuditPermission.VIEW_LIST, labelKey: 'platform.auth.permissions.auditTrail.viewList' },
] as const;
