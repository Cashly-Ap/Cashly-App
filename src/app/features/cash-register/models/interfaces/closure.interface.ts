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
  version: number;
  createdAt: string;
  updatedAt: string;
  details: CashRegisterDetailResponse[];
  totalInvoiced: number;
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  revenueSummary: RevenueSummaryItem[];
  expenseSummary: ExpenseSummaryItem[];
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
  closingNotes: string;
}

export interface OpenRegisterRequest {
  openedByName: string;
}
