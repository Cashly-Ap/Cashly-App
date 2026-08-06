export enum QuoteStatus {
  DRAFT = 'DRAFT',
  CUSTOMER_DRAFT = 'CUSTOMER_DRAFT',
  CONVERTED_TO_ORDER = 'CONVERTED_TO_ORDER',
  CONVERTED_TO_INVOICE = 'CONVERTED_TO_INVOICE',
  CANCELLED = 'CANCELLED',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  [QuoteStatus.DRAFT]: 'Borrador',
  [QuoteStatus.CUSTOMER_DRAFT]: 'Borrador de Cliente',
  [QuoteStatus.CONVERTED_TO_ORDER]: 'Convertido a Pedido',
  [QuoteStatus.CONVERTED_TO_INVOICE]: 'Convertido a Factura',
  [QuoteStatus.CANCELLED]: 'Cancelado',
};

export function getQuoteStatusLabel(status: QuoteStatus): string {
  return QUOTE_STATUS_LABELS[status] ?? status;
}
