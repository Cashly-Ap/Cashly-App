import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PdfViewerConfig, PdfViewerService } from '@core/pdf-viewer';
import { ReceivablesActionDialogService } from '@core/layouts/services/receivables-action-dialog.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { CustomerDebtDialogComponent } from '@features/finance/treasury/receivables/components/customer-debt-dialog/customer-debt-dialog.component';
import {
  PaymentFormDialogComponent,
  PaymentFormMode,
  PaymentSubmitEvent,
} from '@features/finance/treasury/receivables/components/payment-form-dialog/payment-form-dialog.component';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/receivables/components/payment-history-dialog/payment-history-dialog.component';
import { CustomerInvoiceDebt } from '@features/finance/treasury/receivables/models/interfaces/customer-invoice-debt.interface';
import { PayPartialDebtRequest } from '@features/finance/treasury/receivables/models/interfaces/payment-request.interface';

@Component({
  selector: 'app-receivables-action-dialog-host',
  standalone: true,
  imports: [CustomerDebtDialogComponent, PaymentFormDialogComponent, PaymentHistoryDialogComponent],
  templateUrl: './receivables-action-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivablesActionDialogHostComponent {
  readonly actions = inject(ReceivablesActionDialogService);
  readonly service = inject(ReceivablesApplicationService);
  private readonly pdfViewer = inject(PdfViewerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly customerId = signal('');
  readonly customerName = signal('');
  readonly debtVisible = signal(false);

  readonly paymentFormVisible = signal(false);
  readonly paymentFormMode = signal<PaymentFormMode>('single');
  readonly paymentInvoice = signal<CustomerInvoiceDebt | null>(null);
  readonly paymentCustomerName = signal('');
  readonly paymentTotalDebt = signal(0);
  readonly paymentSubmitting = signal(false);

  readonly paymentHistoryVisible = signal(false);
  readonly paymentHistoryCustomerId = signal('');
  readonly paymentHistoryInvoiceId = signal<string | null>(null);

  private readonly debtDialog = viewChild(CustomerDebtDialogComponent);
  private requestVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      const version = ++this.requestVersion;
      this.customerId.set(request.customerId);
      this.customerName.set(request.customerName);

      switch (request.action) {
        case 'view':
          this.debtVisible.set(true);
          return;
        case 'pay_all':
        case 'pay_partial': {
          const mode: PaymentFormMode = request.action === 'pay_all' ? 'all' : 'partial';
          this.service
            .loadCustomerDebt(request.customerId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              if (version !== this.requestVersion) return;
              this.paymentFormMode.set(mode);
              this.paymentCustomerName.set(
                request.customerName || this.service.currentCustomer()?.customerName || '',
              );
              this.paymentTotalDebt.set(this.service.currentCustomer()?.totalDebt ?? 0);
              this.paymentFormVisible.set(true);
            });
          return;
        }
        case 'refund':
        case 'advance': {
          this.debtVisible.set(false);
          const dialog = this.debtDialog();
          dialog?.openBalanceAction(request.action, request.customerId);
          return;
        }
      }
    });
  }

  onCloseDebt(): void {
    this.debtVisible.set(false);
    this.customerId.set('');
    this.service.clearCurrentCustomer();
    this.actions.close();
  }

  onPayInvoice(invoice: CustomerInvoiceDebt): void {
    this.paymentInvoice.set(invoice);
    this.paymentFormMode.set('single');
    this.paymentCustomerName.set(
      this.customerName() || this.service.currentCustomer()?.customerName || '',
    );
    this.paymentTotalDebt.set(invoice.balance);
    this.paymentFormVisible.set(true);
  }

  onPayAll(): void {
    this.openCustomerPayment('all');
  }

  onPayPartial(): void {
    this.openCustomerPayment('partial');
  }

  onSubmitPayment(event: PaymentSubmitEvent): void {
    const mode = this.paymentFormMode();
    if (mode === 'single') {
      const invoice = this.paymentInvoice();
      if (!invoice) return;
      this.sendPayment(this.service.payInvoice(invoice.invoiceId, event.request));
      return;
    }
    this.sendPayment(
      mode === 'all'
        ? this.service.payAllCustomerDebt(this.customerId(), event.request)
        : this.service.payPartialDebt(this.customerId(), event.request as PayPartialDebtRequest),
    );
  }

  onClosePaymentForm(): void {
    this.paymentFormVisible.set(false);
    this.paymentInvoice.set(null);
    this.paymentCustomerName.set('');
    this.paymentTotalDebt.set(0);
  }

  onViewPaymentHistory(invoice: CustomerInvoiceDebt): void {
    this.paymentHistoryCustomerId.set(this.customerId());
    this.paymentHistoryInvoiceId.set(invoice.invoiceId);
    this.paymentHistoryVisible.set(true);
  }

  onClosePaymentHistory(): void {
    this.paymentHistoryVisible.set(false);
    this.paymentHistoryCustomerId.set('');
    this.paymentHistoryInvoiceId.set(null);
  }

  onViewInvoicePdf(invoice: CustomerInvoiceDebt): void {
    const config: PdfViewerConfig = {
      url: `/api/reports/invoices/${invoice.invoiceId}/pdf`,
      title: `Factura #${invoice.invoiceNumber}`,
      fileName: `factura-${invoice.invoiceNumber}.pdf`,
    };
    this.pdfViewer.open(config);
  }

  private openCustomerPayment(mode: 'all' | 'partial'): void {
    this.paymentFormMode.set(mode);
    this.paymentCustomerName.set(
      this.customerName() || this.service.currentCustomer()?.customerName || '',
    );
    this.paymentTotalDebt.set(this.service.currentCustomer()?.totalDebt ?? 0);
    this.paymentFormVisible.set(true);
  }

  private sendPayment(stream: Observable<unknown>): void {
    this.paymentSubmitting.set(true);
    stream
      .pipe(
        finalize(() => this.paymentSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.onClosePaymentForm();
          this.service.customerDebtChange.next();
          this.debtDialog()?.refreshVisibleDetails();
        },
      });
  }
}
