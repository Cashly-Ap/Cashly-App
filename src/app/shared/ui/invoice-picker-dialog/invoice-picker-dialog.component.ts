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
@Component({
  selector: 'app-invoice-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
