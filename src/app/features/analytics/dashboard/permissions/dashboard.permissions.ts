export enum DashboardPermission {
  VIEW = 'DASHBOARD_VIEW',
}

export const DASHBOARD_PERMISSIONS = [
  { code: DashboardPermission.VIEW, labelKey: 'analytics.dashboard.permissions.view' },
] as const;
