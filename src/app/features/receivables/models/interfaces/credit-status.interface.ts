export interface OverdueInvoice {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface AdvanceInfo {
  paymentNumber: string;
  amount: number;
  remainingAmount: number;
  date: string;
}

export interface CreditStatusResponse {
  customerId: string;
  customerName: string;
  customerRif: string;
  creditLimit: number;
  pendingBalance: number;
  unconsumedAdvances: number;
  availableCredit: number;
  overdueInvoices: OverdueInvoice[];
  advances: AdvanceInfo[];
  hasOverdue: boolean;
  canCreateCreditInvoice: boolean;
}
