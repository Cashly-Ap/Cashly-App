import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { PayablesApplicationService } from '@features/finance/treasury/payables/services/application/payables-application.service';
import { SupplierPayment } from '@features/finance/treasury/payables/models/interfaces/supplier-payment.interface';
import { PendingSupplierPaymentApproveDialogComponent } from '@features/finance/treasury/payables/components/pending-supplier-payment-approve-dialog/pending-supplier-payment-approve-dialog.component';
import { PendingSupplierPaymentRejectDialogComponent } from '@features/finance/treasury/payables/components/pending-supplier-payment-reject-dialog/pending-supplier-payment-reject-dialog.component';

@Component({
  selector: 'app-pending-supplier-payments-tab',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    PendingSupplierPaymentApproveDialogComponent,
    PendingSupplierPaymentRejectDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pending-supplier-payments-tab.component.html',
})
export class PendingSupplierPaymentsTabComponent implements OnInit, OnDestroy {
  private readonly api = inject(PayablesApiService);
  private readonly payablesService = inject(PayablesApplicationService);
  private readonly destroy$ = new Subject<void>();

  readonly payments = signal<SupplierPayment[]>([]);
  readonly loading = signal(false);
  readonly focusPaymentId = input<string | null>(null);
  readonly focusHandled = output<string>();
  readonly paymentValidated = output<void>();

  readonly approveDialogVisible = signal(false);
  readonly rejectDialogVisible = signal(false);
  readonly selectedPayment = signal<SupplierPayment | null>(null);
  private readonly handledFocusId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const focusId = this.focusPaymentId();
      if (!focusId || focusId === this.handledFocusId()) return;
      const payment = this.payments().find((item) => item.id === focusId);
      if (!payment) return;
      this.handledFocusId.set(focusId);
      this.openApprove(payment);
      this.focusHandled.emit(focusId);
    });
  }

  ngOnInit(): void {
    this.load();
    this.payablesService.pendingPaymentsChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.api
      .listPendingPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.payments.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openApprove(payment: SupplierPayment): void {
    this.selectedPayment.set(payment);
    this.approveDialogVisible.set(true);
  }

  openReject(payment: SupplierPayment): void {
    this.selectedPayment.set(payment);
    this.rejectDialogVisible.set(true);
  }

  onPaymentCompleted(): void {
    this.paymentValidated.emit();
    this.load();
  }

  formatSupplier(payment: SupplierPayment): string {
    return payment.supplierName || payment.createdByName || 'Automático';
  }
}
