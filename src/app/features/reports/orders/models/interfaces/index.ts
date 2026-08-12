export interface OrdersPdfFilters {
  customerId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  createdBy?: string;
  mode?: 'simple' | 'detailed';
}

export interface OrderPdfFilters {
  mode?: 'simple' | 'detailed';
}
