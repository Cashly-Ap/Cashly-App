import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
import { TableRowSkeletonComponent } from '@shared/components/ui/skeletons/table-row-skeleton.component';
import { CardSkeletonComponent } from '@shared/components/ui/skeletons/card-skeleton.component';
import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';

@Component({
  selector: 'app-invoice-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    TableRowSkeletonComponent,
    CardSkeletonComponent,
    DialogHeaderComponent,
    TableCardComponent,
    CancelButtonComponent,
    TranslatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    SearchFieldComponent,
  ],
  templateUrl: './invoice-picker-dialog.component.html',
})
export class InvoicePickerDialogComponent {
  private readonly invoiceApi = inject(InvoiceApiService);

  readonly visible = input<boolean>(false);
  readonly customerId = input<string>('');
  readonly invoiceSelected = output<InvoiceList>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly allInvoices = signal<InvoiceList[]>([]);
  readonly loading = signal<boolean>(false);

  readonly filteredInvoices = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.allInvoices();
    return this.allInvoices().filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q),
    );
  });

  onDialogShow(): void {
    this.search.set('');
    this.load();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
  }

  onSelect(invoice: InvoiceList): void {
    this.invoiceSelected.emit(invoice);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private load(): void {
    this.loading.set(true);
    this.invoiceApi
      .getAll({
        customerId: this.customerId() || undefined,
        orderBy: 'createdAt',
        orderDir: 'desc',
      })
      .subscribe({
        next: (res) => {
          this.allInvoices.set(res);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
