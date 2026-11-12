import { Injectable, signal } from '@angular/core';

export type SupplierPickerAction = 'balance';

@Injectable({ providedIn: 'root' })
export class SupplierPickerActionService {
  readonly action = signal<SupplierPickerAction | null>(null);

  open(action: SupplierPickerAction): void {
    this.action.set(action);
  }

  close(): void {
    this.action.set(null);
  }
}
