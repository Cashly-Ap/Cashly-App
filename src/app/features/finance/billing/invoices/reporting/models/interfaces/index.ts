export interface InvoicesPdfFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
  productId?: string;
  categoryId?: string;
  mode?: 'SIMPLE' | 'DETAILED';
}
