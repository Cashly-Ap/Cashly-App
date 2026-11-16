export type ReportType = 'SIMPLE' | 'DETAILED' | 'GROUPED';

export interface CashRegisterReportFilters {
  dateFrom: string;
  dateTo: string;
  type: ReportType;
  format: 'PDF' | 'EXCEL';
  customerId?: string;
  productId?: string;
  categoryId?: string;
}
