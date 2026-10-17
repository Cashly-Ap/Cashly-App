export interface AccountsReceivableFilters {
  customerId?: string;
  overdueOnly?: boolean;
}

export interface CollectionsFilters {
  customerId?: string;
  agingFrom?: string;
}
