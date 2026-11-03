export enum PurchasePermission {
  VIEW_LIST = 'PURCHASES_VIEW_LIST',
  VIEW_DETAIL = 'PURCHASES_VIEW_DETAIL',
  EDIT = 'PURCHASES_EDIT',
  DELETE = 'PURCHASES_DELETE',
  CREATE = 'PURCHASES_CREATE',
  REPORT_PDF = 'PURCHASES_REPORT_PDF',
  DOWNLOAD_PDF = 'PURCHASES_DOWNLOAD_PDF',
  CONFIRM = 'PURCHASES_CONFIRM',
  CANCEL = 'PURCHASES_CANCEL',
}

export const PURCHASE_PERMISSIONS = [
  { code: PurchasePermission.VIEW_LIST, labelKey: 'procurement.purchases.permissions.viewList' },
  { code: PurchasePermission.VIEW_DETAIL, labelKey: 'procurement.purchases.permissions.viewDetail' },
  { code: PurchasePermission.EDIT, labelKey: 'procurement.purchases.permissions.edit' },
  { code: PurchasePermission.DELETE, labelKey: 'procurement.purchases.permissions.delete' },
  { code: PurchasePermission.CREATE, labelKey: 'procurement.purchases.permissions.create' },
  { code: PurchasePermission.REPORT_PDF, labelKey: 'procurement.purchases.permissions.reportPdf' },
  { code: PurchasePermission.DOWNLOAD_PDF, labelKey: 'procurement.purchases.permissions.downloadPdf' },
  { code: PurchasePermission.CONFIRM, labelKey: 'procurement.purchases.permissions.confirm' },
  { code: PurchasePermission.CANCEL, labelKey: 'procurement.purchases.permissions.cancel' },
] as const;
