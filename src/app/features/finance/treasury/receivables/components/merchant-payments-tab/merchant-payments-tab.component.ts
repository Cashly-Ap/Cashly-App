import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { PaymentDetailDialogComponent } from '@features/finance/treasury/receivables/components/payment-detail-dialog/payment-detail-dialog.component';

function getStatusLabel(status: string): string {
  switch (status) {
    case 'APPLIED':
      return 'Aplicado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

function getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'contrast' {
  switch (status) {
    case 'APPLIED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'info';
  }
}

@Component({
  selector: 'app-merchant-payments-tab',
  standalone: true,
  imports: [
    PermissionDirective,
    TableModule,
    ButtonModule,
    TagModule,
    CurrencyPipe,
    DatePipe,
    PaymentDetailDialogComponent,
  ],
  templateUrl: './merchant-payments-tab.component.html',
})
export class MerchantPaymentsTabComponent implements OnInit, OnDestroy {
  private apiService = inject(ReceivablesApiService);
  protected service = inject(ReceivablesApplicationService);
  private readonly destroy$ = new Subject<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected statusFilter = signal<string | null>(null);

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
    const params: any = { page: 0, size: 50 };
    this.apiService.getPaymentHistory(params).subscribe({
      next: (response) => {
        let items = response.content ?? [];
        if (this.statusFilter()) {
          items = items.filter((p: PendingPayment) => p.status === this.statusFilter());
        }
        this.payments.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }

  protected filterByStatus(status: string | null): void {
    this.statusFilter.set(status);
    this.loadPayments();
  }

  protected onViewDetail(payment: PendingPayment): void {
    this.selectedPayment.set(payment);
    this.detailVisible.set(true);
  }

  protected onCloseDetail(): void {
    this.detailVisible.set(false);
    this.selectedPayment.set(null);
  }

  protected readonly getStatusLabel = getStatusLabel;
  protected readonly getStatusSeverity = getStatusSeverity;
}
