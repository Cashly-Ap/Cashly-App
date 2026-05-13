export interface InvoicesPdfFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
  mode?: 'SIMPLE' | 'DETAILED';
}
