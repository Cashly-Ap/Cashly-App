import { Injectable, signal } from '@angular/core';

export type WarehouseOperationKind = 'entry' | 'exit';

export interface WarehouseActionDialogRequest {
  warehouseId: string;
  warehouseName: string;
  operation: WarehouseOperationKind;
}

@Injectable({ providedIn: 'root' })
export class WarehouseActionDialogService {
  readonly request = signal<WarehouseActionDialogRequest | null>(null);

  open(request: WarehouseActionDialogRequest): void {
    this.request.set(request);
  }

  close(): void {
    this.request.set(null);
  }
}
