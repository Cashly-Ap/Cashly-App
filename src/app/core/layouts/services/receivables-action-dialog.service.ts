import { Injectable, signal } from '@angular/core';

export type ReceivablesActionKind = 'view' | 'pay_all' | 'pay_partial' | 'refund' | 'advance';

export interface ReceivablesActionDialogRequest {
  customerId: string;
  customerName: string;
  action: ReceivablesActionKind;
}

@Injectable({ providedIn: 'root' })
export class ReceivablesActionDialogService {
  readonly request = signal<ReceivablesActionDialogRequest | null>(null);

  open(request: ReceivablesActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
