export interface PaymentPdfFilters {
  paymentId: string;
}

export interface AccountsReceivableFilters {
  customerId?: string;
  overdueOnly?: boolean;
}

export interface PaymentHistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  type?: string;
  method?: string;
}

export interface CollectionsFilters {
  customerId?: string;
  agingFrom?: string;
}

export type ReportType = 'SIMPLE' | 'DETAILED' | 'GROUPED';

export interface CashRegisterReportFilters {
  dateFrom: string;
  dateTo: string;
  type: ReportType;
}
