export enum QuotePermission {
  VIEW_LIST = 'SALES_QUOTES_VIEW_LIST',
  VIEW_DETAIL = 'SALES_QUOTES_VIEW_DETAIL',
  EDIT = 'SALES_QUOTES_EDIT',
  DELETE = 'SALES_QUOTES_DELETE',
  CREATE = 'SALES_QUOTES_CREATE',
  REPORT_PDF = 'SALES_QUOTES_REPORT_PDF',
  DOWNLOAD_PDF = 'SALES_QUOTES_DOWNLOAD_PDF',
  CONVERT_TO_ORDER = 'SALES_QUOTES_CONVERT_TO_ORDER',
  CONVERT_TO_INVOICE = 'SALES_QUOTES_CONVERT_TO_INVOICE',
  CANCEL = 'SALES_QUOTES_CANCEL',
}

export const QUOTE_PERMISSIONS = [
  { code: QuotePermission.VIEW_LIST, labelKey: 'sales.quotes.permissions.viewList' },
  { code: QuotePermission.VIEW_DETAIL, labelKey: 'sales.quotes.permissions.viewDetail' },
  { code: QuotePermission.EDIT, labelKey: 'sales.quotes.permissions.edit' },
  { code: QuotePermission.DELETE, labelKey: 'sales.quotes.permissions.delete' },
  { code: QuotePermission.CREATE, labelKey: 'sales.quotes.permissions.create' },
  { code: QuotePermission.REPORT_PDF, labelKey: 'sales.quotes.permissions.reportPdf' },
  { code: QuotePermission.DOWNLOAD_PDF, labelKey: 'sales.quotes.permissions.downloadPdf' },
  { code: QuotePermission.CONVERT_TO_ORDER, labelKey: 'sales.quotes.permissions.convertToOrder' },
  { code: QuotePermission.CONVERT_TO_INVOICE, labelKey: 'sales.quotes.permissions.convertToInvoice' },
  { code: QuotePermission.CANCEL, labelKey: 'sales.quotes.permissions.cancel' },
] as const;
