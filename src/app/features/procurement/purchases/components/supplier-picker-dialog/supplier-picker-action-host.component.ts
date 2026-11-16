import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupplierList } from '@features/partners/suppliers/models/interfaces/supplier-list.interface';
import { SupplierPickerActionService } from '@features/procurement/purchases/services/supplier-picker-action.service';
import { SupplierPickerDialogComponent } from '@features/procurement/purchases/components/supplier-picker-dialog/supplier-picker-dialog.component';

@Component({
  selector: 'app-supplier-picker-action-host',
  standalone: true,
  imports: [SupplierPickerDialogComponent],
  templateUrl: './supplier-picker-action-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierPickerActionHostComponent {
  readonly actions = inject(SupplierPickerActionService);
  private readonly router = inject(Router);

  select(supplier: SupplierList): void {
    const action = this.actions.action();
    this.actions.close();
    if (!action) return;
    void this.router.navigate(['/partners/suppliers', supplier.id, action]);
  }

  close(): void {
    this.actions.close();
  }
}
