import { Injectable } from '@angular/core';
import { PaymentDetail, PaymentList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentMapper {
  static toList(detail: PaymentDetail): PaymentList {
    return {
      id: detail.id,
      paymentNumber: detail.paymentNumber,
      customerName: detail.customerName,
      invoiceNumber: detail.invoiceNumber,
      amount: detail.amount,
      status: detail.status,
      createdByName: detail.createdByName,
      createdAt: detail.createdAt,
    };
  }
}
