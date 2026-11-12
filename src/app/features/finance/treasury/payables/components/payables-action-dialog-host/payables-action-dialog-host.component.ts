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
import { PayablesActionDialogService } from '@core/layouts/services/payables-action-dialog.service';
import { PayablesApplicationService } from '@features/finance/treasury/payables/services/application/payables-application.service';
import { SupplierDebtDialogComponent } from '@features/finance/treasury/payables/components/supplier-debt-dialog/supplier-debt-dialog.component';
import {
  SupplierPaymentFormDialogComponent,
  PaymentFormMode,
  PaymentSubmitEvent,
} from '@features/finance/treasury/payables/components/supplier-payment-form-dialog/supplier-payment-form-dialog.component';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/payables/components/payment-history-dialog/payment-history-dialog.component';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { PayPartialDebtRequest } from '@features/finance/treasury/payables/models/interfaces/payment-request.interface';

@Component({
  selector: 'app-payables-action-dialog-host',
  standalone: true,
  imports: [
    SupplierDebtDialogComponent,
    SupplierPaymentFormDialogComponent,
    PaymentHistoryDialogComponent,
  ],
  templateUrl: './payables-action-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayablesActionDialogHostComponent {
  readonly actions = inject(PayablesActionDialogService);
  readonly service = inject(PayablesApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly supplierId = signal('');
  readonly supplierName = signal('');
  readonly debtVisible = signal(false);

  readonly paymentFormVisible = signal(false);
  readonly paymentFormMode = signal<PaymentFormMode>('single');
  readonly paymentPurchase = signal<SupplierPurchaseDebt | null>(null);
  readonly paymentSupplierName = signal('');
  readonly paymentTotalDebt = signal(0);
  readonly paymentSubmitting = signal(false);

  readonly paymentHistoryVisible = signal(false);
  readonly paymentHistorySupplierId = signal('');
  readonly paymentHistoryPurchaseId = signal<string | null>(null);

  private readonly debtDialog = viewChild(SupplierDebtDialogComponent);
  private requestVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      if (!request) return;
      const version = ++this.requestVersion;
      this.supplierId.set(request.supplierId);
      this.supplierName.set(request.supplierName);

      switch (request.action) {
        case 'view':
          this.debtVisible.set(true);
          return;
        case 'pay_all':
        case 'pay_partial':
        case 'pay_with_validation': {
          const mode: PaymentFormMode =
            request.action === 'pay_all'
              ? 'all'
              : request.action === 'pay_partial'
                ? 'partial'
                : 'validation';
          this.service
            .loadSupplierDebt(request.supplierId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              if (version !== this.requestVersion) return;
              this.paymentFormMode.set(mode);
              this.paymentSupplierName.set(
                request.supplierName || this.service.currentSupplier()?.supplierName || '',
              );
              this.paymentTotalDebt.set(this.service.currentSupplier()?.totalDebt ?? 0);
              this.paymentFormVisible.set(true);
            });
          return;
        }
        case 'refund':
        case 'advance': {
          this.debtVisible.set(false);
          this.debtDialog()?.openBalanceAction(request.action);
          return;
        }
      }
    });
  }

  onCloseDebt(): void {
    this.debtVisible.set(false);
    this.supplierId.set('');
    this.service.clearCurrentSupplier();
    this.actions.close();
  }

  onPayPurchase(purchase: SupplierPurchaseDebt): void {
    this.paymentPurchase.set(purchase);
    this.paymentFormMode.set('single');
    this.paymentSupplierName.set(
      this.supplierName() || this.service.currentSupplier()?.supplierName || '',
    );
    this.paymentTotalDebt.set(purchase.balance);
    this.paymentFormVisible.set(true);
  }

  onPayAll(): void {
    this.openSupplierPayment('all');
  }

  onPayPartial(): void {
    this.openSupplierPayment('partial');
  }

  onSubmitPayment(event: PaymentSubmitEvent): void {
    const mode = this.paymentFormMode();
    if (mode === 'single') {
      const purchase = this.paymentPurchase();
      if (!purchase) return;
      this.sendPayment(this.service.payPurchase(purchase.purchaseId, event.request));
      return;
    }
    if (mode === 'validation') {
      this.sendPayment(
        this.service.createPayment({
          supplierId: this.supplierId(),
          status: 'PENDING',
          amount: event.request.amount,
          paymentMethodId: event.request.paymentMethodId,
          ...(event.request.referenceNumber
            ? { referenceNumber: event.request.referenceNumber }
            : {}),
          paymentDate: event.request.paymentDate,
          ...(event.request.notes ? { notes: event.request.notes } : {}),
        }),
      );
      return;
    }
    this.sendPayment(
      mode === 'all'
        ? this.service.payAllSupplierDebt(this.supplierId(), event.request)
        : this.service.payPartialDebt(this.supplierId(), event.request as PayPartialDebtRequest),
    );
  }

  onClosePaymentForm(): void {
    this.paymentFormVisible.set(false);
    this.paymentPurchase.set(null);
    this.paymentSupplierName.set('');
    this.paymentTotalDebt.set(0);
  }

  onViewPaymentHistory(purchase: SupplierPurchaseDebt): void {
    this.paymentHistorySupplierId.set(this.supplierId());
    this.paymentHistoryPurchaseId.set(purchase.purchaseId);
    this.paymentHistoryVisible.set(true);
  }

  onClosePaymentHistory(): void {
    this.paymentHistoryVisible.set(false);
    this.paymentHistorySupplierId.set('');
    this.paymentHistoryPurchaseId.set(null);
  }

  private openSupplierPayment(mode: 'all' | 'partial'): void {
    this.paymentFormMode.set(mode);
    this.paymentSupplierName.set(
      this.supplierName() || this.service.currentSupplier()?.supplierName || '',
    );
    this.paymentTotalDebt.set(this.service.currentSupplier()?.totalDebt ?? 0);
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
          this.service.supplierDebtChange.next();
          this.debtDialog()?.refreshVisibleDetails();
        },
      });
  }
}
