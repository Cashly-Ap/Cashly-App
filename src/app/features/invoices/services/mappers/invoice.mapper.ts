import { Injectable } from '@angular/core';
import { InvoiceDetails } from '../../models/interfaces';
import { InvoiceList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class InvoiceMapper {
  static toList(detail: InvoiceDetails): InvoiceList {
    return {
      id: detail.id,
      invoiceNumber: detail.invoiceNumber,
      customerId: detail.customerId,
      customerName: detail.customerName,
      status: detail.status,
      paymentType: detail.paymentType,
      subtotal: detail.subtotal,
      lineCount: detail.lines.length,
      orderId: detail.orderId,
      orderNumber: detail.orderNumber,
      createdAt: detail.createdAt,
      returnStatus: detail.returnStatus ?? null,
    };
  }
}