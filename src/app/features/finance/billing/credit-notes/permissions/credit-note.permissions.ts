export enum CreditNotePermission {
  VIEW_LIST = 'FINANCE_BILLING_CREDIT_NOTES_VIEW_LIST',
  VIEW_DETAIL = 'FINANCE_BILLING_CREDIT_NOTES_VIEW_DETAIL',
  DELETE = 'FINANCE_BILLING_CREDIT_NOTES_DELETE',
  CREATE = 'FINANCE_BILLING_CREDIT_NOTES_CREATE',
}

export const CREDIT_NOTE_PERMISSIONS = [
  {
    code: CreditNotePermission.VIEW_LIST,
    labelKey: 'finance.billing.creditNotes.permissions.viewList',
  },
  {
    code: CreditNotePermission.VIEW_DETAIL,
    labelKey: 'finance.billing.creditNotes.permissions.viewDetail',
  },
  { code: CreditNotePermission.DELETE, labelKey: 'finance.billing.creditNotes.permissions.delete' },
  { code: CreditNotePermission.CREATE, labelKey: 'finance.billing.creditNotes.permissions.create' },
] as const;
