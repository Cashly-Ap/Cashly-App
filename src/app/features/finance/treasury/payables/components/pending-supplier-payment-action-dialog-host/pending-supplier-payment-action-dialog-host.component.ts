import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { SupplierPaymentActionDialogService } from '@core/layouts/services/supplier-payment-action-dialog.service';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { PayablesApplicationService } from '@features/finance/treasury/payables/services/application/payables-application.service';
import { SupplierPayment } from '@features/finance/treasury/payables/models/interfaces/supplier-payment.interface';
import { PendingSupplierPaymentApproveDialogComponent } from '@features/finance/treasury/payables/components/pending-supplier-payment-approve-dialog/pending-supplier-payment-approve-dialog.component';
import { PendingSupplierPaymentRejectDialogComponent } from '@features/finance/treasury/payables/components/pending-supplier-payment-reject-dialog/pending-supplier-payment-reject-dialog.component';

@Component({
  selector: 'app-pending-supplier-payment-action-dialog-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PendingSupplierPaymentApproveDialogComponent,
    PendingSupplierPaymentRejectDialogComponent,
  ],
  templateUrl: './pending-supplier-payment-action-dialog-host.component.html',
})
export class PendingSupplierPaymentActionDialogHostComponent {
  private readonly actions = inject(SupplierPaymentActionDialogService);
  private readonly api = inject(PayablesApiService);
  private readonly payables = inject(PayablesApplicationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly approveVisible = signal(false);
  readonly rejectVisible = signal(false);
  readonly selectedPayment = signal<SupplierPayment | null>(null);

  private requestVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      const version = ++this.requestVersion;
      const apiAction = request.action === 'approve' ? 'APPROVE' : 'REJECT';

      this.api
        .listPendingPayments(apiAction)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (payments) => {
            if (version !== this.requestVersion) return;
            const payment = payments.find((item) => item.id === request.paymentId);
            if (!payment) {
              this.messages.add({
                severity: 'error',
                summary: 'Error',
                detail: 'finance.treasury.payables.messages.unableToLoadPendingPayment',
              });
              this.actions.close();
              return;
            }
            this.selectedPayment.set(payment);
            if (request.action === 'approve') {
              this.approveVisible.set(true);
              return;
            }
            this.rejectVisible.set(true);
          },
          error: () => {
            if (version !== this.requestVersion) return;
            this.messages.add({
              severity: 'error',
              summary: 'Error',
              detail: 'finance.treasury.payables.messages.unableToLoadPendingPayment',
            });
            this.actions.close();
          },
        });
    });
  }

  onApproved(): void {
    this.settle();
  }

  onRejected(): void {
    this.settle();
  }

  onApproveVisibleChange(isVisible: boolean): void {
    this.approveVisible.set(isVisible);
    if (isVisible) return;
    this.releaseWhenHidden();
  }

  onRejectVisibleChange(isVisible: boolean): void {
    this.rejectVisible.set(isVisible);
    if (isVisible) return;
    this.releaseWhenHidden();
  }

  private settle(): void {
    this.actions.close();
    this.payables.pendingPaymentsChange.next();
    this.payables.supplierDebtChange.next();
  }

  private releaseWhenHidden(): void {
    if (this.approveVisible() || this.rejectVisible()) return;
    this.selectedPayment.set(null);
    this.actions.close();
  }
}
