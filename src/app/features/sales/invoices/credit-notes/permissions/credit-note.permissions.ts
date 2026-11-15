export enum CreditNotePermission {
  VIEW_LIST = 'SALES_INVOICES_CREDIT_NOTES_VIEW_LIST',
  VIEW_DETAIL = 'SALES_INVOICES_CREDIT_NOTES_VIEW_DETAIL',
  DELETE = 'SALES_INVOICES_CREDIT_NOTES_DELETE',
  CREATE = 'SALES_INVOICES_CREDIT_NOTES_CREATE',
}

export const CREDIT_NOTE_PERMISSIONS = [
  {
    code: CreditNotePermission.VIEW_LIST,
    labelKey: 'platform.auth.permissions.sales_invoices_credit_notes.view_list',
  },
  {
    code: CreditNotePermission.VIEW_DETAIL,
    labelKey: 'platform.auth.permissions.sales_invoices_credit_notes.view_detail',
  },
  {
    code: CreditNotePermission.DELETE,
    labelKey: 'platform.auth.permissions.sales_invoices_credit_notes.delete',
  },
  {
    code: CreditNotePermission.CREATE,
    labelKey: 'platform.auth.permissions.sales_invoices_credit_notes.create',
  },
] as const;
