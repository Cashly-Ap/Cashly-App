export interface Expense {
  id: string;
  registerId: string;
  registerOpenedAt: string;
  amount: number;
  description: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  createdByName: string | null;
  occurredAt: string;
}

export interface ExpenseCreate {
  amount: number;
  description: string;
  paymentMethodId: string;
}

export interface ExpenseFilters {
  page?: number;
  size?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: string;
  orderBy?: 'occurredAt' | 'amount' | 'description' | 'paymentMethodName';
  orderDir?: 'asc' | 'desc';
}
