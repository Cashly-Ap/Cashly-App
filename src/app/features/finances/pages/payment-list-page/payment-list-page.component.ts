import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CancelPaymentDialogComponent } from '@features/finances/components/cancel-payment-dialog/cancel-payment-dialog.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';
import { PaymentFilters } from '@features/finances/services/api/payment-api.service';
import { PaymentStatus, PAYMENT_STATUS_LABELS, getPaymentStatusLabel } from '@features/finances/models/enums/payment-status.enum';
import { PaymentType, PAYMENT_TYPE_LABELS, getPaymentTypeLabel } from '@features/finances/models/enums/payment-type.enum';
import { PaymentList } from '@features/finances/models/interfaces';

@Component({
  selector: 'app-payment-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PopoverModule,
    ConfirmDialogModule,
    DatePickerModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
    CancelPaymentDialogComponent,
  ],
  templateUrl: './payment-list-page.component.html',
  providers: [ConfirmationService],
})
export class PaymentListPageComponent implements OnInit {
  private readonly financeService = inject(FinanceApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly payments = this.financeService.payments;
  readonly loading = this.financeService.loading;
  readonly totalElements = this.financeService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly selectedStatus = signal('');
  readonly filterType = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);

  readonly filterStatus = computed(() => {
    const s = this.selectedStatus();
    return s ? [s] : [];
  });

  readonly cancelDialogVisible = signal(false);
  readonly paymentToCancel = signal<PaymentList | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    ...Object.values(PaymentStatus).map((s) => ({ label: PAYMENT_STATUS_LABELS[s], value: s })),
  ];

  readonly typeOptions = [
    { label: 'Todos los tipos', value: '' },
    ...Object.values(PaymentType).map((t) => ({ label: PAYMENT_TYPE_LABELS[t], value: t })),
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    const statuses = this.filterStatus();
    if (statuses.length > 0) count++;
    if (this.filterType()) count++;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    return count;
  });

  readonly showInitialLoading = computed(() => this.loading() && (this.payments()?.length ?? 0) === 0);
  readonly isEmptyDatabase = computed(
    () => !this.loading() && this.totalElements() === 0 && this.activeFilterCount() === 0 && !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () => !this.loading() && this.totalElements() === 0 && (this.activeFilterCount() > 0 || !!this.searchTerm()),
  );

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onStatusFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.selectedStatus()) return;
    this.selectedStatus.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onTypeFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterType()) return;
    this.filterType.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onDateFromChange(value: Date | null): void {
    this.filterDateFrom.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onDateToChange(value: Date | null): void {
    this.filterDateTo.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  onSort(event: SortEvent): void {
    const newField = event.field ?? 'createdAt';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.selectedStatus.set('');
    this.filterType.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onView(payment: PaymentList): void {
    this.router.navigate(['/payments', payment.id]);
  }

  onCreate(): void {
    this.router.navigate(['/payments/new']);
  }

  onApply(payment: PaymentList): void {
    this.router.navigate(['/payments', payment.id, 'apply']);
  }

  onCancelPayment(payment: PaymentList): void {
    this.paymentToCancel.set(payment);
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(event: { paymentId: string; reason: string }): void {
    this.cancelDialogVisible.set(false);
    this.financeService.cancelPayment(event.paymentId, event.reason).subscribe({
      next: () => {
        this.paymentToCancel.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pago cancelado exitosamente',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.paymentToCancel.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar el pago. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
    this.paymentToCancel.set(null);
  }

  getStatusLabel(status: PaymentStatus): string {
    return getPaymentStatusLabel(status);
  }

  getPaymentTypeLabel(type: PaymentType): string {
    return getPaymentTypeLabel(type);
  }

  getStatusVariant(status: PaymentStatus): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<PaymentStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [PaymentStatus.DRAFT]: 'label',
      [PaymentStatus.APPLIED]: 'success',
      [PaymentStatus.PARTIALLY_APPLIED]: 'info',
      [PaymentStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }

  canCancel(status: PaymentStatus): boolean {
    return status !== PaymentStatus.DRAFT && status !== PaymentStatus.CANCELLED;
  }

  private loadWithFilters(): void {
    const filters: PaymentFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus().length > 0) filters.status = this.filterStatus()[0];
    if (this.filterType()) filters.type = this.filterType();
    if (this.filterDateFrom()) filters.dateFrom = this.filterDateFrom()!.toISOString().split('T')[0];
    if (this.filterDateTo()) filters.dateTo = this.filterDateTo()!.toISOString().split('T')[0];
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.financeService.loadPayments(filters).subscribe();
  }
}
