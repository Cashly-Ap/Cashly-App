export enum InvoicePermission {
  VIEW_LIST = 'FINANCE_BILLING_INVOICES_VIEW_LIST',
  VIEW_DETAIL = 'FINANCE_BILLING_INVOICES_VIEW_DETAIL',
  EDIT = 'FINANCE_BILLING_INVOICES_EDIT',
  DELETE = 'FINANCE_BILLING_INVOICES_DELETE',
  CREATE = 'FINANCE_BILLING_INVOICES_CREATE',
  REPORT_PDF = 'FINANCE_BILLING_INVOICES_REPORT_PDF',
  DOWNLOAD_PDF = 'FINANCE_BILLING_INVOICES_DOWNLOAD_PDF',
  CONFIRM = 'FINANCE_BILLING_INVOICES_CONFIRM',
  CANCEL = 'FINANCE_BILLING_INVOICES_CANCEL',
  DUPLICATE = 'FINANCE_BILLING_INVOICES_DUPLICATE',
}

export const INVOICE_PERMISSIONS = [
  { code: InvoicePermission.VIEW_LIST, labelKey: 'finance.billing.invoices.permissions.viewList' },
  {
    code: InvoicePermission.VIEW_DETAIL,
    labelKey: 'finance.billing.invoices.permissions.viewDetail',
  },
  { code: InvoicePermission.EDIT, labelKey: 'finance.billing.invoices.permissions.edit' },
  { code: InvoicePermission.DELETE, labelKey: 'finance.billing.invoices.permissions.delete' },
  { code: InvoicePermission.CREATE, labelKey: 'finance.billing.invoices.permissions.create' },
  {
    code: InvoicePermission.REPORT_PDF,
    labelKey: 'finance.billing.invoices.permissions.reportPdf',
  },
  {
    code: InvoicePermission.DOWNLOAD_PDF,
    labelKey: 'finance.billing.invoices.permissions.downloadPdf',
  },
  { code: InvoicePermission.CONFIRM, labelKey: 'finance.billing.invoices.permissions.confirm' },
  { code: InvoicePermission.CANCEL, labelKey: 'finance.billing.invoices.permissions.cancel' },
  { code: InvoicePermission.DUPLICATE, labelKey: 'finance.billing.invoices.permissions.duplicate' },
] as const;
