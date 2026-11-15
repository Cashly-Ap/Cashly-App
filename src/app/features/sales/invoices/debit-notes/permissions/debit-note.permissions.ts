export enum DebitNotePermission {
  VIEW_LIST = 'SALES_INVOICES_DEBIT_NOTES_VIEW_LIST',
  VIEW_DETAIL = 'SALES_INVOICES_DEBIT_NOTES_VIEW_DETAIL',
  DELETE = 'SALES_INVOICES_DEBIT_NOTES_DELETE',
  CREATE = 'SALES_INVOICES_DEBIT_NOTES_CREATE',
}

export const DEBIT_NOTE_PERMISSIONS = [
  {
    code: DebitNotePermission.VIEW_LIST,
    labelKey: 'platform.auth.permissions.sales_invoices_debit_notes.view_list',
  },
  {
    code: DebitNotePermission.VIEW_DETAIL,
    labelKey: 'platform.auth.permissions.sales_invoices_debit_notes.view_detail',
  },
  {
    code: DebitNotePermission.DELETE,
    labelKey: 'platform.auth.permissions.sales_invoices_debit_notes.delete',
  },
  {
    code: DebitNotePermission.CREATE,
    labelKey: 'platform.auth.permissions.sales_invoices_debit_notes.create',
  },
] as const;
