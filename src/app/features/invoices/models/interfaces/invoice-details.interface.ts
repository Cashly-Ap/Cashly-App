import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceLineDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  warehouseAllocations: {
    id: string;
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    available: number;
    allocated: number;
  }[];
  warehouseStocks?: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    quantity: number;
  }[];
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  orderId: string | null;
  orderNumber: string | null;
  status: InvoiceStatus;
  paymentType: PaymentType;
  notes: string | null;
  subtotal: number;
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  lines: InvoiceLineDetail[];
}