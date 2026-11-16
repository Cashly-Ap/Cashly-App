import { Injectable, signal } from '@angular/core';

export type InvoiceActionKind = 'confirm' | 'cancel' | 'duplicate';

export interface InvoiceActionDialogRequest {
  invoiceId: string;
  invoiceNumber: string;
  action: InvoiceActionKind;
}

@Injectable({ providedIn: 'root' })
export class InvoiceActionDialogService {
  readonly request = signal<InvoiceActionDialogRequest | null>(null);

  open(request: InvoiceActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
