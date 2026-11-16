import { Injectable, signal } from '@angular/core';

export type CashRegisterActionKind = 'open' | 'close' | 'detail';

export interface CashRegisterActionDialogRequest {
  action: CashRegisterActionKind;
}

@Injectable({ providedIn: 'root' })
export class CashRegisterActionDialogService {
  readonly request = signal<CashRegisterActionDialogRequest | null>(null);

  open(request: CashRegisterActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
