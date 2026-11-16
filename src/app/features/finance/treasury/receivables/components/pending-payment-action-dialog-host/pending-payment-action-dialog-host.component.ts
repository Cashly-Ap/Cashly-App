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
import { PendingPaymentActionDialogService } from '@core/layouts/services/pending-payment-action-dialog.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { PendingPaymentApproveDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-approve-dialog/pending-payment-approve-dialog.component';
import { PendingPaymentRejectDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-reject-dialog/pending-payment-reject-dialog.component';

@Component({
  selector: 'app-pending-payment-action-dialog-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PendingPaymentApproveDialogComponent, PendingPaymentRejectDialogComponent],
  templateUrl: './pending-payment-action-dialog-host.component.html',
})
export class PendingPaymentActionDialogHostComponent {
  private readonly actions = inject(PendingPaymentActionDialogService);
  private readonly api = inject(ReceivablesApiService);
  private readonly receivables = inject(ReceivablesApplicationService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly approveVisible = signal(false);
  readonly rejectVisible = signal(false);
  readonly selectedPayment = signal<PendingPayment | null>(null);

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
                detail: 'finance.treasury.receivables.messages.unableToLoadPendingPayment',
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
              detail: 'finance.treasury.receivables.messages.unableToLoadPendingPayment',
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
    this.receivables.pendingPaymentsChange.next();
    this.receivables.customerDebtChange.next();
  }

  private releaseWhenHidden(): void {
    if (this.approveVisible() || this.rejectVisible()) return;
    this.selectedPayment.set(null);
    this.actions.close();
  }
}
