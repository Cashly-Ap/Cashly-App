export type ExpenseRegisterStatus = 'OPEN' | 'CLOSED';

export interface Expense {
  id: string;
  registerId: string;
  registerOpenedAt: string;
  registerStatus: ExpenseRegisterStatus;
  amount: number;
  description: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  createdByName: string | null;
  occurredAt: string;
  cancelled: boolean;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelledByName: string | null;
}

export interface ExpenseCreate {
  registerId: string;
  amount: number;
  description: string;
  paymentMethodId: string;
  occurredAt: string;
}

export interface ExpenseCancel {
  id: string;
  reason: string;
}

export interface ExpenseRegisterOption {
  id: string;
  openedAt: string;
  closedAt: string | null;
  status: ExpenseRegisterStatus;
  openedByName: string;
}

export interface ExpenseFilters {
  page?: number;
  size?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: string;
  registerId?: string;
  orderBy?: 'occurredAt' | 'amount' | 'description' | 'paymentMethodName';
  orderDir?: 'asc' | 'desc';
}
