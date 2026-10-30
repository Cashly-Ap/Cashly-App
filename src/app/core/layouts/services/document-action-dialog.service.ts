import { Injectable, signal } from '@angular/core';

export interface DocumentActionDialogRequest {
  route: '/sales/quotes' | '/sales/orders' | '/procurement/purchases';
  label: string;
  recordId: string;
  recordLabel: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentActionDialogService {
  readonly request = signal<DocumentActionDialogRequest | null>(null);

  open(request: DocumentActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
