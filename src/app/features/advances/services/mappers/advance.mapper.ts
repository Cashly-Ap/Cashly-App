import { Injectable } from '@angular/core';
import { AdvanceDetail, AdvanceList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AdvanceMapper {
  static toList(detail: AdvanceDetail): AdvanceList {
    return {
      id: detail.id,
      advanceNumber: detail.advanceNumber,
      amount: detail.amount,
      remainingAmount: detail.remainingAmount,
      status: detail.status,
      notes: detail.notes,
      createdAt: detail.createdAt,
    };
  }
}
