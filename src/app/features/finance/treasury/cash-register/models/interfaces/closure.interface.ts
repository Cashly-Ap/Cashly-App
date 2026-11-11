export interface CashRegisterResponse {
  id: string;
  closureDate: string;
  status: 'OPEN' | 'CLOSED';
  openedBy: string;
  openedByName: string;
  openedAt: string;
  closedBy: string | null;
  closedByName: string | null;
  closedAt: string | null;
  closingNotes: string | null;
  details: CashRegisterDetailResponse[];
  totalInvoiced: number;
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  revenueSummary: RevenueSummaryItem[];
  expenseSummary: ExpenseSummaryItem[];
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  expectedBalance: number;
  declaredBalance: number | null;
  difference: number | null;
  movements: CashMovementResponse[];
}

export interface CashMovementResponse {
  id: string;
  direction: 'IN' | 'OUT';
  type:
    | 'PAYMENT'
    | 'ADVANCE'
    | 'REFUND'
    | 'INVOICE'
    | 'CREDIT_NOTE'
    | 'DEBIT_NOTE'
    | 'RETURN'
    | 'MANUAL_INCOME'
    | 'EXPENSE'
    | 'WITHDRAWAL'
    | 'ADJUSTMENT';
  amount: number;
  paymentMethodId: string | null;
  paymentMethodName: string;
  description: string | null;
  sourceType: string | null;
  sourceId: string | null;
  createdBy: string | null;
  createdByName: string | null;
  occurredAt: string;
  cancelled: boolean;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelledByName: string | null;
}

export interface CashRegisterDetailResponse {
  id: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  transactionCount: number;
  expectedAmount: number;
}

export interface RevenueSummaryItem {
  paymentMethod: string;
  total: number;
}

export interface ExpenseSummaryItem {
  concept: string;
  total: number;
}

export interface CloseRegisterRequest {
  closedByName: string;
  declaredBalance: number;
  closingNotes: string;
}

export interface OpenRegisterRequest {
  openedByName: string;
  openingBalance: number;
}

export type CashRegisterHistoryView = 'SIMPLE' | 'DETAILED';
export type CashRegisterReportFormat = 'PDF' | 'EXCEL';

export interface CashMovementRequest {
  direction: 'IN' | 'OUT';
  type: 'MANUAL_INCOME' | 'EXPENSE' | 'WITHDRAWAL' | 'ADJUSTMENT';
  amount: number;
  paymentMethodId: string;
  description: string;
  occurredAt?: string;
}

export interface CashMovementCancelRequest {
  reason: string;
}
