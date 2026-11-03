import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerPickerActionService } from '@features/sales/orders/services/customer-picker-action.service';
import { CustomerPickerDialogComponent } from './customer-picker-dialog.component';

@Component({
  selector: 'app-customer-picker-action-host',
  standalone: true,
  imports: [CustomerPickerDialogComponent],
  templateUrl: './customer-picker-action-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerPickerActionHostComponent {
  readonly actions = inject(CustomerPickerActionService);
  private readonly router = inject(Router);

  select(customer: CustomerList): void {
    const action = this.actions.action();
    this.actions.close();
    if (!action) return;
    void this.router.navigate(['/partners/customers', customer.id, action]);
  }

  close(): void {
    this.actions.close();
  }
}
