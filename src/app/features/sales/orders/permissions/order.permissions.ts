export enum OrderPermission {
  VIEW_LIST = 'SALES_ORDERS_VIEW_LIST',
  VIEW_DETAIL = 'SALES_ORDERS_VIEW_DETAIL',
  EDIT = 'SALES_ORDERS_EDIT',
  DELETE = 'SALES_ORDERS_DELETE',
  CREATE = 'SALES_ORDERS_CREATE',
  REPORT_PDF = 'SALES_ORDERS_REPORT_PDF',
  DOWNLOAD_PDF = 'SALES_ORDERS_DOWNLOAD_PDF',
  CONFIRM = 'SALES_ORDERS_CONFIRM',
  CONVERT_TO_INVOICE = 'SALES_ORDERS_CONVERT_TO_INVOICE',
  CANCEL = 'SALES_ORDERS_CANCEL',
}

export const ORDER_PERMISSIONS = [
  { code: OrderPermission.VIEW_LIST, labelKey: 'sales.orders.permissions.viewList' },
  { code: OrderPermission.VIEW_DETAIL, labelKey: 'sales.orders.permissions.viewDetail' },
  { code: OrderPermission.EDIT, labelKey: 'sales.orders.permissions.edit' },
  { code: OrderPermission.DELETE, labelKey: 'sales.orders.permissions.delete' },
  { code: OrderPermission.CREATE, labelKey: 'sales.orders.permissions.create' },
  { code: OrderPermission.REPORT_PDF, labelKey: 'sales.orders.permissions.reportPdf' },
  { code: OrderPermission.DOWNLOAD_PDF, labelKey: 'sales.orders.permissions.downloadPdf' },
  { code: OrderPermission.CONFIRM, labelKey: 'sales.orders.permissions.confirm' },
  {
    code: OrderPermission.CONVERT_TO_INVOICE,
    labelKey: 'sales.orders.permissions.convertToInvoice',
  },
  { code: OrderPermission.CANCEL, labelKey: 'sales.orders.permissions.cancel' },
] as const;
