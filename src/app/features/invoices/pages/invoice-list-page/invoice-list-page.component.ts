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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CancelInvoiceDialogComponent } from '@features/invoices/components/cancel-invoice-dialog/cancel-invoice-dialog.component';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { InvoiceFilters } from '@features/invoices/services/api/invoice-api.service';
import { InvoiceStatus, INVOICE_STATUS_LABELS, getInvoiceStatusLabel } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType, PAYMENT_TYPE_LABELS, getPaymentTypeLabel } from '@features/invoices/models/enums/payment-type.enum';
import { InvoiceList } from '@features/invoices/models/interfaces';

@Component({
  selector: 'app-invoice-list-page',
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
    CancelInvoiceDialogComponent,
  ],
  templateUrl: './invoice-list-page.component.html',
  providers: [ConfirmationService],
})
export class InvoiceListPageComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly invoices = this.invoiceService.invoices;
  readonly loading = this.invoiceService.loading;
  readonly totalElements = this.invoiceService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterStatus = signal('');
  readonly filterPaymentType = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);

  readonly cancelDialogVisible = signal(false);
  readonly invoiceToCancel = signal<InvoiceList | null>(null);

  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    ...Object.values(InvoiceStatus).map((s) => ({ label: INVOICE_STATUS_LABELS[s], value: s })),
  ];

  readonly paymentTypeOptions = [
    { label: 'Todos los tipos', value: '' },
    ...Object.values(PaymentType).map((p) => ({ label: PAYMENT_TYPE_LABELS[p], value: p })),
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    if (this.filterPaymentType()) count++;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    return count;
  });

  readonly showInitialLoading = computed(() => this.loading() && (this.invoices()?.length ?? 0) === 0);
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
    if (normalized === this.filterStatus()) return;
    this.filterStatus.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPaymentTypeFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterPaymentType()) return;
    this.filterPaymentType.set(normalized);
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

  clearFilters(): void {
    this.filterStatus.set('');
    this.filterPaymentType.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onView(invoice: InvoiceList): void {
    this.router.navigate(['/facturas', invoice.id]);
  }

  onCreate(): void {
    this.router.navigate(['/facturas', 'nuevo']);
  }

  onEdit(invoice: InvoiceList): void {
    this.router.navigate(['/facturas', invoice.id, 'editar']);
  }

  onDelete(invoice: InvoiceList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la factura #${invoice.invoiceNumber}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.invoiceService.delete(invoice.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Factura eliminada exitosamente',
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la factura. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onCancelInvoice(invoice: InvoiceList): void {
    this.invoiceToCancel.set(invoice);
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(event: { invoiceId: string; reason: string }): void {
    this.cancelDialogVisible.set(false);
    this.invoiceService.cancel(event.invoiceId, event.reason).subscribe({
      next: () => {
        this.invoiceToCancel.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Factura cancelada exitosamente',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.invoiceToCancel.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar la factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
    this.invoiceToCancel.set(null);
  }

  onDuplicate(invoice: InvoiceList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea duplicar la factura #${invoice.invoiceNumber}?`,
      header: 'Confirmar Duplicación',
      icon: 'pi pi-copy',
      acceptLabel: 'Sí, duplicar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.invoiceService.duplicate(invoice.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Factura duplicada exitosamente',
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al duplicar la factura. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  getStatusLabel(status: InvoiceStatus): string {
    return getInvoiceStatusLabel(status);
  }

  getPaymentTypeLabel(paymentType: PaymentType): string {
    return getPaymentTypeLabel(paymentType);
  }

  getStatusVariant(status: InvoiceStatus): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<InvoiceStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [InvoiceStatus.DRAFT]: 'label',
      [InvoiceStatus.PENDING_PAYMENT]: 'info',
      [InvoiceStatus.PARTIALLY_PAID]: 'info',
      [InvoiceStatus.PAID]: 'success',
      [InvoiceStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }

  canCancel(status: InvoiceStatus): boolean {
    return status !== InvoiceStatus.CANCELLED && status !== InvoiceStatus.PAID;
  }

  private loadWithFilters(): void {
    const filters: InvoiceFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus()) filters.status = this.filterStatus();
    if (this.filterPaymentType()) filters.paymentType = this.filterPaymentType();
    if (this.filterDateFrom()) filters.dateFrom = this.filterDateFrom()!.toISOString().split('T')[0];
    if (this.filterDateTo()) filters.dateTo = this.filterDateTo()!.toISOString().split('T')[0];
    this.invoiceService.loadAll(filters).subscribe();
  }
}