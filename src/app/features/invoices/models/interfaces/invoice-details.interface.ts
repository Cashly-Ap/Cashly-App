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
    reserved: number;
    available: number;
  }[];
  returnedQuantity: number;
}

export interface NoteInfo {
  id: string;
  noteNumber: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  applicationDate: string;
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
  statusLabel: string;
  paymentType: PaymentType;
  notes: string | null;
  subtotal: number;
  creditApplied: number;
  debitApplied: number;
  total: number;
  notesList: NoteInfo[];
  cancelledAt: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  issueDate?: string;
  dueDate?: string;
  lines: InvoiceLineDetail[];
  returnedTotal: number;
  returnStatus: 'PARTIAL' | 'FULL' | null;
  returns: ReturnDetail[];
}

export interface ReturnDetail {
  id: string;
  returnNumber: string;
  returnType: 'AUTOMATIC' | 'MANUAL';
  reason: string;
  total: number;
  createdAt: string;
  createdByName: string;
  lines: ReturnLineDetail[];
}

export interface ReturnLineDetail {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocations: ReturnAllocationDetail[];
}

export interface ReturnAllocationDetail {
  warehouseId: string;
  warehouseName: string;
  allocated: number;
}
