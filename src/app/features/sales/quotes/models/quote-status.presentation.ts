import { StatusVariant } from '@shared/models/status-variant';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';

export function quoteStatusVariant(status: QuoteStatus): StatusVariant {
  const variants: Record<QuoteStatus, StatusVariant> = {
    [QuoteStatus.DRAFT]: 'label',
    [QuoteStatus.CANCELLED]: 'danger',
    [QuoteStatus.CONVERTED_TO_ORDER]: 'success',
    [QuoteStatus.CONVERTED_TO_INVOICE]: 'success',
  };
  return variants[status] ?? 'label';
}
