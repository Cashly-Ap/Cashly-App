import { Injectable } from '@angular/core';
import { PaymentMethodDetail, PaymentMethodList } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PaymentMethodMapper {
  static toList(detail: PaymentMethodDetail): PaymentMethodList {
    return {
      id: detail.id,
      code: detail.code,
      name: detail.name,
      description: detail.description,
      isActive: detail.isActive,
      createdAt: detail.createdAt,
    };
  }
}
