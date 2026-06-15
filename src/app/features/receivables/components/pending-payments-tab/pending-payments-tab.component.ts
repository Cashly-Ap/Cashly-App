import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApplicationService } from '@app/features/receivables/services/application/receivables-application.service';
import { PendingPayment } from '../../models/interfaces';
import { PaymentDetailDialogComponent } from '../payment-detail-dialog/payment-detail-dialog.component';

@Component({
  selector: 'app-pending-payments-tab',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    PaymentDetailDialogComponent,
  ],
  templateUrl: './pending-payments-tab.component.html',
})
export class PendingPaymentsTabComponent implements OnInit, OnDestroy {
  protected service = inject(ReceivablesApplicationService);
  private readonly destroy$ = new Subject<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected detailVisible = signal(false);
  protected selectedPayment = signal<PendingPayment | null>(null);

  constructor() {
    this.service.customerDebtChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadPayments());
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected loadPayments(): void {
    this.loading.set(true);
    this.service.loadPendingPayments({ page: 0, size: 50 }).subscribe({
      next: () => {
        this.payments.set(this.service.pendingPayments());
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }

  protected onViewDetail(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.detailVisible.set(true);
  }

  protected onCloseDetail(): void {
    this.detailVisible.set(false);
    this.selectedPayment.set(null);
  }

}
