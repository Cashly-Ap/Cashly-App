export interface OverdueInvoice {
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export interface CreditStatusResponse {
  customerId: string;
  customerName: string;
  customerRif: string;
  creditLimit: number;
  pendingBalance: number;
  customerBalance: number;
  availableCredit: number;
  overdueInvoices: OverdueInvoice[];
  hasOverdue: boolean;
  canCreateCreditInvoice: boolean;
}
