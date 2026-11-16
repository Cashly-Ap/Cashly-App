import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';

export interface QuoteList {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerRif: string;
  status: QuoteStatus;
  subtotal: number;
  expiryDate: string;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
}
