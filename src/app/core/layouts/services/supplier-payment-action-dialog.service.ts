import { Injectable, signal } from '@angular/core';

export type SupplierPaymentActionKind = 'approve' | 'reject';

export interface SupplierPaymentActionDialogRequest {
  paymentId: string;
  action: SupplierPaymentActionKind;
}

@Injectable({ providedIn: 'root' })
export class SupplierPaymentActionDialogService {
  readonly request = signal<SupplierPaymentActionDialogRequest | null>(null);

  open(request: SupplierPaymentActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
