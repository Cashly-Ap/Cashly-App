import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { ReceivablesApiService } from '../../services/api/receivables-api.service';
import { PendingPayment } from '../../models/interfaces';
import { PaymentDetailDialogComponent } from '../payment-detail-dialog/payment-detail-dialog.component';
import { ApproveRejectDialogComponent, ApprovePaymentPayload } from '../approve-reject-dialog/approve-reject-dialog.component';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING_APPROVAL': return 'Pendiente de Aprobación';
    case 'APPROVED': return 'Aprobado';
    case 'REJECTED': return 'Rechazado';
    case 'PENDING': return 'Pendiente';
    default: return status;
  }
}

function getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'PENDING_APPROVAL': return 'warn';
    case 'REJECTED': return 'danger';
    case 'PENDING': return 'info';
    default: return 'info';
  }
}

@Component({
  selector: 'app-pending-payments-tab',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CurrencyPipe,
    DatePipe,
    PaymentDetailDialogComponent,
    ApproveRejectDialogComponent,
  ],
  templateUrl: './pending-payments-tab.component.html',
})
export class PendingPaymentsTabComponent implements OnInit, OnDestroy {
  private apiService = inject(ReceivablesApiService);
  protected service = inject(ReceivablesApplicationService);
  private readonly destroy$ = new Subject<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected detailVisible = signal(false);
  protected selectedPayment = signal<PendingPayment | null>(null);

  protected actionDialogVisible = signal(false);
  protected actionType = signal<'approve' | 'reject'>('approve');
  protected actionPayment = signal<PendingPayment | null>(null);

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
    this.apiService.getPendingPayments({ page: 0, size: 50, status: 'PENDING_APPROVAL' }).subscribe({
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

  protected onViewDetail(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.detailVisible.set(true);
  }

  protected onCloseDetail(): void {
    this.detailVisible.set(false);
    this.selectedPayment.set(null);
  }

  protected onApprove(payment: PendingPayment): void {
    this.actionPayment.set(payment);
    this.actionType.set('approve');
    this.actionDialogVisible.set(true);
  }

  protected onReject(payment: PendingPayment): void {
    this.actionPayment.set(payment);
    this.actionType.set('reject');
    this.actionDialogVisible.set(true);
  }

  protected onActionDialogClose(): void {
    this.actionDialogVisible.set(false);
    this.actionPayment.set(null);
  }

  protected onActionApprove(payload: ApprovePaymentPayload): void {
    this.apiService.approvePayment(payload.paymentId, payload.commissionPercentage).subscribe({
      next: () => {
        this.actionDialogVisible.set(false);
        this.actionPayment.set(null);
        this.loadPayments();
        this.service.customerDebtChange.next();
      },
      error: () => {
      },
    });
  }

  protected onActionReject(event: { paymentId: string; reason: string }): void {
    this.apiService.rejectPayment(event.paymentId, event.reason).subscribe({
      next: () => {
        this.actionDialogVisible.set(false);
        this.actionPayment.set(null);
        this.loadPayments();
        this.service.customerDebtChange.next();
      },
      error: () => {
      },
    });
  }

  protected readonly getStatusLabel = getStatusLabel;
  protected readonly getStatusSeverity = getStatusSeverity;
}
