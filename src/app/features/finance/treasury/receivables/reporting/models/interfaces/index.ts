export interface AccountsReceivableFilters {
  customerId?: string;
  overdueOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface CollectionsFilters {
  customerId?: string;
  agingFrom?: string;
}
