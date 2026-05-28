import { Injectable } from '@angular/core';
import { DebitNoteDetail, DebitNoteList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class DebitNoteMapper {
  static toList(detail: DebitNoteDetail): DebitNoteList {
    return {
      id: detail.id,
      noteNumber: detail.noteNumber,
      customerId: detail.customerId,
      customerName: detail.customerName,
      invoiceNumber: detail.invoiceNumber,
      amount: detail.amount,
      createdAt: detail.createdAt,
    };
  }
}
