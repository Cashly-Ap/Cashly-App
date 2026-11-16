import { Injectable, signal } from '@angular/core';

export type PendingPaymentActionKind = 'approve' | 'reject';

export interface PendingPaymentActionDialogRequest {
  paymentId: string;
  action: PendingPaymentActionKind;
}

@Injectable({ providedIn: 'root' })
export class PendingPaymentActionDialogService {
  readonly request = signal<PendingPaymentActionDialogRequest | null>(null);

  open(request: PendingPaymentActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
