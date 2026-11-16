import { Injectable, signal } from '@angular/core';

export type CustomerPickerAction = 'edit' | 'balance';

@Injectable({ providedIn: 'root' })
export class CustomerPickerActionService {
  readonly action = signal<CustomerPickerAction | null>(null);

  open(action: CustomerPickerAction): void {
    this.action.set(action);
  }

  close(): void {
    this.action.set(null);
  }
}
