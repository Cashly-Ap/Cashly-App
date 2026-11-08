export enum DebitNotePermission {
  VIEW_LIST = 'FINANCE_BILLING_DEBIT_NOTES_VIEW_LIST',
  VIEW_DETAIL = 'FINANCE_BILLING_DEBIT_NOTES_VIEW_DETAIL',
  DELETE = 'FINANCE_BILLING_DEBIT_NOTES_DELETE',
  CREATE = 'FINANCE_BILLING_DEBIT_NOTES_CREATE',
}

export const DEBIT_NOTE_PERMISSIONS = [
  {
    code: DebitNotePermission.VIEW_LIST,
    labelKey: 'finance.billing.debitNotes.permissions.viewList',
  },
  {
    code: DebitNotePermission.VIEW_DETAIL,
    labelKey: 'finance.billing.debitNotes.permissions.viewDetail',
  },
  { code: DebitNotePermission.DELETE, labelKey: 'finance.billing.debitNotes.permissions.delete' },
  { code: DebitNotePermission.CREATE, labelKey: 'finance.billing.debitNotes.permissions.create' },
] as const;
