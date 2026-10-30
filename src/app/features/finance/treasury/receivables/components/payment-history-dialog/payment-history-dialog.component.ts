import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PaginatorModule } from 'primeng/paginator';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';

@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './payment-history-dialog.component.html',
})
export class PaymentHistoryDialogComponent {
  private apiService = inject(ReceivablesApiService);

  readonly visible = input.required<boolean>();
  readonly customerId = input.required<string>();
  readonly invoiceId = input<string | null>(null);

  readonly close = output<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected totalAmount = computed(() => this.payments().reduce((sum, p) => sum + p.amount, 0));

  protected approvedCount = computed(
    () => this.payments().filter((p) => p.status === 'APPROVED').length,
  );

  protected rejectedCount = computed(
    () => this.payments().filter((p) => p.status === 'REJECTED').length,
  );

  protected dialogTitle = computed(() => {
    if (this.payments().length > 0) {
      return `Historial de Pagos - ${this.payments()[0].invoiceNumber}`;
    }
    return 'Historial de Pagos';
  });

  constructor() {
    effect(() => {
      const customerId = this.customerId();
      const invoiceId = this.invoiceId();
      const isVisible = this.visible();

      if (isVisible && customerId) {
        if (invoiceId) {
          this.loadInvoicePaymentHistory(invoiceId);
        } else {
          this.loadCustomerPaymentHistory(customerId);
        }
      }
    });
  }

  protected onClose(): void {
    this.payments.set([]);
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  private loadCustomerPaymentHistory(customerId: string): void {
    this.loading.set(true);
    this.apiService.getCustomerPaymentHistory(customerId, { page: 0, size: 100 }).subscribe({
      next: (response) => {
        this.payments.set(response.content ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadInvoicePaymentHistory(invoiceId: string): void {
    this.loading.set(true);
    const customerId = this.customerId();
    if (customerId) {
      this.apiService.getCustomerPaymentHistory(customerId, { page: 0, size: 100 }).subscribe({
        next: (response) => {
          this.payments.set(response.content ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.payments.set([]);
          this.loading.set(false);
        },
      });
    } else {
      this.payments.set([]);
      this.loading.set(false);
    }
  }
}
