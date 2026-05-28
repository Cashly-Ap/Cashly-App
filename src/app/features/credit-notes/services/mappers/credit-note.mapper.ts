import { Injectable } from '@angular/core';
import { CreditNoteDetail, CreditNoteList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CreditNoteMapper {
  static toList(detail: CreditNoteDetail): CreditNoteList {
    return {
      id: detail.id,
      noteNumber: detail.noteNumber,
      customerName: detail.customerName,
      invoiceNumber: detail.invoiceNumber,
      amount: detail.amount,
      reason: detail.reason,
      createdByName: detail.createdByName,
      createdAt: detail.createdAt,
    };
  }
}
