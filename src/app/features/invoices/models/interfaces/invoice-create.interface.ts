import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceLineCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: { warehouseId: string; allocated: number }[];
}

export interface InvoiceCreate {
  customerId: string;
  paymentType: PaymentType;
  notes?: string;
  lines: InvoiceLineCreate[];
}