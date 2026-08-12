import { Injectable } from '@angular/core';
import { InvoiceDetails } from '@features/invoices/models/interfaces';
import { InvoiceList } from '@features/invoices/models/interfaces';

@Injectable({ providedIn: 'root' })
export class InvoiceMapper {
  static toList(detail: InvoiceDetails): InvoiceList {
    return {
      id: detail.id,
      invoiceNumber: detail.invoiceNumber,
      customerId: detail.customerId,
      customerName: detail.customerName,
      status: detail.status,
      statusLabel: detail.statusLabel,
      paymentType: detail.paymentType,
      subtotal: detail.subtotal,
      total: detail.total,
      paidAmount: 0,
      creditApplied: detail.creditApplied ?? 0,
      debitApplied: detail.debitApplied ?? 0,
      lineCount: detail.lines.length,
      orderId: detail.orderId,
      orderNumber: detail.orderNumber,
      createdAt: detail.createdAt,
      returnStatus: detail.returnStatus ?? null,
    };
  }
}
