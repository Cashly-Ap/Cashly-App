import { QuoteList } from '@features/quotes/models/interfaces/quote-list.interface';
import { QuoteDetails } from '@features/quotes/models/interfaces/quote-details.interface';

export interface QuoteFormItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface QuoteFormModel {
  id?: string;
  customerId: string;
  notes: string;
  items: QuoteFormItem[];
}

export class QuoteMapper {
  static toList(details: QuoteDetails): QuoteList {
    return {
      id: details.id,
      quoteNumber: details.quoteNumber,
      customerName: details.customerName,
      customerRif: details.customerRif,
      status: details.status,
      subtotal: details.subtotal,
      expiryDate: '',
      createdBy: details.createdBy,
      createdByName: details.createdByName,
      createdAt: details.createdAt,
    };
  }

  static toFormModel(details: QuoteDetails): QuoteFormModel {
    return {
      id: details.id,
      customerId: details.customerId,
      notes: details.notes ?? '',
      items: details.lines.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };
  }
}
