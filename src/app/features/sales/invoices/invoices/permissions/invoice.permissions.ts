export enum InvoicePermission {
  VIEW_LIST = 'SALES_INVOICES_INVOICES_VIEW_LIST',
  VIEW_DETAIL = 'SALES_INVOICES_INVOICES_VIEW_DETAIL',
  EDIT = 'SALES_INVOICES_INVOICES_EDIT',
  DELETE = 'SALES_INVOICES_INVOICES_DELETE',
  CREATE = 'SALES_INVOICES_INVOICES_CREATE',
  REPORT_PDF = 'SALES_INVOICES_INVOICES_REPORT_PDF',
  DOWNLOAD_PDF = 'SALES_INVOICES_INVOICES_DOWNLOAD_PDF',
  CONFIRM = 'SALES_INVOICES_INVOICES_CONFIRM',
  CANCEL = 'SALES_INVOICES_INVOICES_CANCEL',
  DUPLICATE = 'SALES_INVOICES_INVOICES_DUPLICATE',
}

export const INVOICE_PERMISSIONS = [
  {
    code: InvoicePermission.VIEW_LIST,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.view_list',
  },
  {
    code: InvoicePermission.VIEW_DETAIL,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.view_detail',
  },
  {
    code: InvoicePermission.EDIT,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.edit',
  },
  {
    code: InvoicePermission.DELETE,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.delete',
  },
  {
    code: InvoicePermission.CREATE,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.create',
  },
  {
    code: InvoicePermission.REPORT_PDF,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.report_pdf',
  },
  {
    code: InvoicePermission.DOWNLOAD_PDF,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.download_pdf',
  },
  {
    code: InvoicePermission.CONFIRM,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.confirm',
  },
  {
    code: InvoicePermission.CANCEL,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.cancel',
  },
  {
    code: InvoicePermission.DUPLICATE,
    labelKey: 'platform.auth.permissions.sales_invoices_invoices.duplicate',
  },
] as const;
