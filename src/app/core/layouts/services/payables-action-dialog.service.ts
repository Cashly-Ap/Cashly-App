import { Injectable, signal } from '@angular/core';

export type PayablesActionKind =
  | 'view'
  | 'pay_all'
  | 'pay_partial'
  | 'pay_with_validation'
  | 'refund'
  | 'advance';

export interface PayablesActionDialogRequest {
  supplierId: string;
  supplierName: string;
  action: PayablesActionKind;
}

@Injectable({ providedIn: 'root' })
export class PayablesActionDialogService {
  readonly request = signal<PayablesActionDialogRequest | null>(null);

  open(request: PayablesActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
