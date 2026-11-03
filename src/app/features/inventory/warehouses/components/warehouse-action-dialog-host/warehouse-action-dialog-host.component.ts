import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import {
  WarehouseActionDialogService,
  WarehouseOperationKind,
} from '@core/layouts/services/warehouse-action-dialog.service';
import { WarehouseStockOperationDialogComponent } from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';

@Component({
  selector: 'app-warehouse-action-dialog-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WarehouseStockOperationDialogComponent],
  templateUrl: './warehouse-action-dialog-host.component.html',
})
export class WarehouseActionDialogHostComponent {
  readonly actions = inject(WarehouseActionDialogService);

  readonly visible = signal(false);
  readonly warehouseId = signal('');
  readonly warehouseName = signal('');
  readonly operation = signal<WarehouseOperationKind>('entry');

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      this.warehouseId.set(request.warehouseId);
      this.warehouseName.set(request.warehouseName);
      this.operation.set(request.operation);
      this.visible.set(true);
    });
  }

  onVisibleChange(isVisible: boolean): void {
    this.visible.set(isVisible);
    if (isVisible) return;
    this.warehouseId.set('');
    this.warehouseName.set('');
    this.operation.set('entry');
    this.actions.close();
  }
}
