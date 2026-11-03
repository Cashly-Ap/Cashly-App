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
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { ImageViewerDialogComponent } from '@shared/components/ui/image-viewer-dialog/image-viewer-dialog.component';
import { PendingPaymentApproveDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-approve-dialog/pending-payment-approve-dialog.component';
import { PendingPaymentRejectDialogComponent } from '@features/finance/treasury/receivables/components/pending-payment-reject-dialog/pending-payment-reject-dialog.component';

const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i;

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-pending-payments-tab',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ImageViewerDialogComponent,
    PendingPaymentApproveDialogComponent,
    PendingPaymentRejectDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pending-payments-tab.component.html',
})
export class PendingPaymentsTabComponent implements OnInit, OnDestroy {
  private readonly api = inject(ReceivablesApiService);
  private readonly receivablesService = inject(ReceivablesApplicationService);
  private readonly destroy$ = new Subject<void>();

  readonly payments = signal<PendingPayment[]>([]);
  readonly loading = signal(false);
  readonly focusPaymentId = input<string | null>(null);
  readonly focusHandled = output<string>();
  readonly paymentValidated = output<void>();

  readonly approveDialogVisible = signal(false);
  readonly rejectDialogVisible = signal(false);
  readonly selectedPayment = signal<PendingPayment | null>(null);
  readonly voucherViewerVisible = signal(false);
  readonly voucherViewerUrl = signal<string | null>(null);
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
    this.receivablesService.pendingPaymentsChange
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

  openApprove(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.approveDialogVisible.set(true);
  }

  openReject(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.rejectDialogVisible.set(true);
  }

  onPaymentCompleted(): void {
    this.paymentValidated.emit();
    this.load();
  }

  formatCustomer(payment: PendingPayment): string {
    if (payment.customerName) return payment.customerName;
    return payment.createdByName || 'Automático';
  }

  openVoucher(payment: PendingPayment): void {
    const url = payment.voucherUrl;
    if (!url) return;
    if (IMAGE_EXTENSION_PATTERN.test(url)) {
      this.voucherViewerUrl.set(url);
      this.voucherViewerVisible.set(true);
      return;
    }
    window.open(url, '_blank');
  }
}
