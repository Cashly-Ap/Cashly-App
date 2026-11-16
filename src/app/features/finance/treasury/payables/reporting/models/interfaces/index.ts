export interface AccountsPayableFilters {
  supplierId?: string;
  overdueOnly?: boolean;
}

export interface PaymentsFilters {
  supplierId?: string;
  dateFrom?: string;
}
