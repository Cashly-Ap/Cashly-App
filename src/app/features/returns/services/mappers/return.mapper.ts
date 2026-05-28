import { Injectable } from '@angular/core';
import { ReturnDetail, ReturnList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ReturnMapper {
  static toList(detail: ReturnDetail): ReturnList {
    return {
      id: detail.id,
      returnNumber: detail.returnNumber,
      customerName: detail.customerName,
      invoiceNumber: detail.invoiceNumber,
      returnType: detail.returnType,
      totalAmount: detail.totalAmount,
      reason: detail.reason,
      createdByName: detail.createdByName,
      createdAt: detail.createdAt,
    };
  }
}
