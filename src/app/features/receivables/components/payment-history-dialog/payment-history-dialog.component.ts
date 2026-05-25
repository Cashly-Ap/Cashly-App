import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApiService } from '../../services/api/receivables-api.service';
import { PendingPayment } from '../../models/interfaces';

@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TableModule, CurrencyPipe, DatePipe],
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
    this.apiService.getInvoicePaymentHistory(invoiceId).subscribe({
      next: (response: any) => {
        const mappedPayments: PendingPayment[] = Array.isArray(response?.payments)
          ? response.payments.map((p: any) => ({
              id: p.id,
              paymentNumber: p.paymentNumber || '',
              customerId: response.customerId || '',
              customerName: response.customerName || '',
              amount: p.amount,
              paymentMethodName: p.paymentMethodName || '',
              status: p.status,
              paymentDate: p.paymentDate,
              createdAt: p.createdAt || '',
              invoiceNumber: response.invoiceNumber || '',
              voucherPath: p.voucherPath || null,
            }))
          : [];
        this.payments.set(mappedPayments);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }
}
