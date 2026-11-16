export interface PaymentPdfFilters {
  paymentId: string;
}

export interface PaymentHistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  type?: string;
  method?: string;
}
