import { LanguageService } from '@core/i18n/language.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import {
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
} from '@shared/components/list';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { CancelInvoiceDialogComponent } from '@features/finance/billing/invoices/components/cancel-invoice-dialog/cancel-invoice-dialog.component';
import {
  ConfirmInvoiceDialogComponent,
  ConfirmInvoiceSubmit,
} from '@features/finance/billing/invoices/components/confirm-invoice-dialog/confirm-invoice-dialog.component';
import { DuplicateInvoiceDialogComponent } from '@features/finance/billing/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { InvoiceFilters } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import {
  InvoiceStatus,
  INVOICE_STATUS_LABELS,
  getInvoiceStatusLabel,
} from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import {
  PaymentType,
  PAYMENT_TYPE_LABELS,
  getPaymentTypeLabel,
} from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';

@Component({
  selector: 'app-invoice-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    ShortcutDirective,
    PermissionDirective,
    CommonModule,
    FormsModule,
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
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    TextBadgeComponent,
    CancelInvoiceDialogComponent,
    ConfirmInvoiceDialogComponent,
    DuplicateInvoiceDialogComponent,
  ],
  templateUrl: './invoice-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class InvoiceListPageComponent implements OnInit {
  readonly locale = inject(LanguageService).locale;

  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly pdfViewerService = inject(PdfViewerService);

  readonly invoices = this.invoiceService.invoices;
  readonly loading = this.invoiceService.loading;
  readonly totalElements = this.invoiceService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly selectedStatus = signal('');
  readonly selectedReturnStatus = signal('');
  readonly selectedDueStatus = signal('');
  readonly filterPaymentType = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);

  readonly defaultStatuses = [
    InvoiceStatus.DRAFT,
    InvoiceStatus.PENDING_PAYMENT,
    InvoiceStatus.PARTIALLY_PAID,
  ];

  readonly filterStatus = computed(() => {
    const s = this.selectedStatus();
    return s === 'ALL' ? Object.values(InvoiceStatus) : s ? [s] : [];
  });

  readonly cancelDialogVisible = signal(false);
  readonly invoiceToCancel = signal<InvoiceList | null>(null);

  readonly duplicateDialogVisible = signal(false);
  readonly invoiceToDuplicate = signal<InvoiceList | null>(null);

  readonly confirmDialogVisible = signal(false);
  readonly invoiceToConfirm = signal<InvoiceList | null>(null);
  readonly isConfirming = signal(false);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { label: 'Todas las facturas', value: 'ALL' },
    { label: 'Facturas activas', value: '' },
    ...Object.values(InvoiceStatus).map((s) => ({ label: INVOICE_STATUS_LABELS[s], value: s })),
  ];

  readonly paymentTypeOptions = [
    { label: 'Todos los tipos', value: '' },
    ...Object.values(PaymentType).map((p) => ({ label: PAYMENT_TYPE_LABELS[p], value: p })),
  ];

  readonly returnStatusOptions = [
    { label: 'Todas', value: '' },
    { label: 'Sin devolución', value: 'NONE' },
    { label: 'Parcialmente Devuelta', value: 'PARTIAL' },
    { label: 'Totalmente Devuelta', value: 'FULL' },
  ];

  readonly dueStatusOptions = [
    { label: 'Todas las fechas', value: '' },
    { label: 'Vencidas', value: 'OVERDUE' },
    { label: 'Al día', value: 'CURRENT' },
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    const statuses = this.filterStatus();
    if (statuses.length > 0) count++;
    if (this.filterPaymentType()) count++;
    if (this.selectedReturnStatus()) count++;
    if (this.selectedDueStatus()) count++;
    if (this.filterDateFrom()) count++;
    if (this.filterDateTo()) count++;
    return count;
  });

  readonly showInitialLoading = computed(
    () => this.loading() && (this.invoices()?.length ?? 0) === 0,
  );
  readonly isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.activeFilterCount() === 0 &&
      !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.activeFilterCount() > 0 || !!this.searchTerm()),
  );

  private readonly listDestroyRef = inject(DestroyRef);
  private listRequest?: Subscription;

  private readonly listNavigation = connectListNavigation({
    records: () => this.invoices(),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => this.onSearch(term),
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.invoiceNumber,
    description: (record) => `${record.customerName} · ${record.status}`,
    actions: (record) => this.actionsFor(record),
  });

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

  onPaymentTypeFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterPaymentType()) return;
    this.filterPaymentType.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onReturnStatusFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.selectedReturnStatus()) return;
    this.selectedReturnStatus.set(normalized);
    this.first.set(0);
    this.loadWithFilters();
  }

  onDueStatusFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.selectedDueStatus()) return;
    this.selectedDueStatus.set(normalized);
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
    this.selectedReturnStatus.set('');
    this.selectedDueStatus.set('');
    this.filterPaymentType.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onView(invoice: InvoiceList): void {
    this.router.navigate(['/finance/billing/invoices', invoice.id]);
  }

  onCreate(): void {
    this.router.navigate(['/finance/billing/invoices/new']);
  }

  onEdit(invoice: InvoiceList): void {
    this.router.navigate(['/finance/billing/invoices', invoice.id, 'edit']);
  }

  actionsFor(invoice: InvoiceList): ListAction[] {
    const actions: ListAction[] = [
      {
        requiredAction: 'READ',
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.onView(invoice),
      },
      {
        requiredAction: 'EXPORT',
        label: 'Descargar PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.onDownloadPdf(invoice),
      },
    ];
    if (invoice.status === 'DRAFT') {
      actions.push(
        {
          requiredAction: 'CONFIRM',
                    label: 'Confirmar',
          icon: 'pi pi-check',
          command: () => this.onConfirmInvoice(invoice),
        },
        {
          requiredAction: 'UPDATE',
                    label: 'Editar',
          icon: 'pi pi-pencil',
          command: () => this.onEdit(invoice),
        },
        {
          requiredAction: 'DELETE',
                    label: 'Eliminar',
          icon: 'pi pi-trash',
          danger: true,
          command: () => this.onDelete(invoice),
        },
      );
    }
    if (this.canCancel(invoice.status)) {
      actions.push({
        requiredAction: 'CANCEL',
                label: 'Cancelar',
        icon: 'pi pi-times',
        danger: true,
        command: () => this.onCancelInvoice(invoice),
      });
    }
    actions.push({
      requiredAction: 'CREATE',
            label: 'Duplicar',
      icon: 'pi pi-copy',
      command: () => this.onDuplicate(invoice),
    });
    return actions;
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

  onConfirmInvoice(invoice: InvoiceList): void {
    this.invoiceToConfirm.set(invoice);
    this.confirmDialogVisible.set(true);
  }

  onConfirmDialogConfirmed(data: ConfirmInvoiceSubmit): void {
    const invoice = this.invoiceToConfirm();
    if (!invoice) return;
    this.isConfirming.set(true);
    this.invoiceService
      .confirm(invoice.id, data)
      .pipe(finalize(() => this.isConfirming.set(false)))
      .subscribe({
        next: () => {
          this.confirmDialogVisible.set(false);
          this.invoiceToConfirm.set(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Factura confirmada exitosamente',
            life: 3000,
          });
          this.loadWithFilters();
        },
        error: (err: { error?: { message?: string } }) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error al confirmar.',
            life: 5000,
          });
        },
      });
  }

  onConfirmDialogDismissed(): void {
    this.confirmDialogVisible.set(false);
    this.invoiceToConfirm.set(null);
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
    this.invoiceToDuplicate.set(invoice);
    this.duplicateDialogVisible.set(true);
  }

  onDuplicateDialogConfirmed(event: { invoiceId: string; customerId?: string }): void {
    this.duplicateDialogVisible.set(false);
    this.invoiceService.duplicate(event.invoiceId, event.customerId).subscribe({
      next: () => {
        this.invoiceToDuplicate.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Factura duplicada exitosamente',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.invoiceToDuplicate.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al duplicar la factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onDuplicateDialogDismissed(): void {
    this.duplicateDialogVisible.set(false);
    this.invoiceToDuplicate.set(null);
  }

  onDownloadPdf(invoice: InvoiceList): void {
    const config: PdfViewerConfig = {
      url: `/api/reports/invoices/${invoice.id}/pdf`,
      title: `Nota #${invoice.invoiceNumber}`,
      fileName: `nota-${invoice.invoiceNumber}.pdf`,
    };
    this.pdfViewerService.open(config);
  }

  getStatusLabel(status: InvoiceStatus): string {
    return getInvoiceStatusLabel(status);
  }

  getPaymentTypeLabel(paymentType: PaymentType): string {
    return getPaymentTypeLabel(paymentType);
  }

  getStatusVariant(status: InvoiceStatus): 'success' | 'danger' | 'info' | 'label' | 'warning' {
    const variants: Record<InvoiceStatus, 'success' | 'danger' | 'info' | 'label' | 'warning'> = {
      [InvoiceStatus.DRAFT]: 'label',
      [InvoiceStatus.PENDING_PAYMENT]: 'info',
      [InvoiceStatus.PARTIALLY_PAID]: 'info',
      [InvoiceStatus.PAID]: 'success',
      [InvoiceStatus.CANCELLED]: 'danger',
      [InvoiceStatus.FULLY_RETURNED]: 'info',
    };
    return variants[status] ?? 'label';
  }

  getReturnStatusLabel(returnStatus: string | null): string {
    const labels: Record<string, string> = {
      PARTIAL: 'Parcialmente Devuelta',
      FULL: 'Totalmente Devuelta',
    };
    return returnStatus ? (labels[returnStatus] ?? '') : '';
  }

  pendingAmount(invoice: InvoiceList): number {
    return Math.max(0, invoice.total - invoice.paidAmount);
  }

  getReturnStatusVariant(returnStatus: string | null): 'warning' | 'info' | undefined {
    if (returnStatus === 'PARTIAL') return 'warning';
    if (returnStatus === 'FULL') return 'info';
    return undefined;
  }

  canCancel(status: InvoiceStatus): boolean {
    return (
      status !== InvoiceStatus.DRAFT &&
      status !== InvoiceStatus.CANCELLED &&
      status !== InvoiceStatus.PAID &&
      status !== InvoiceStatus.FULLY_RETURNED
    );
  }

  private loadWithFilters(): void {
    const filters: InvoiceFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus().length > 0) filters.statuses = this.filterStatus();
    if (this.selectedReturnStatus()) filters.returnStatus = [this.selectedReturnStatus()];
    if (this.selectedDueStatus())
      filters.dueStatus = this.selectedDueStatus() as 'OVERDUE' | 'CURRENT';
    if (this.filterPaymentType()) filters.paymentType = this.filterPaymentType();
    if (this.filterDateFrom())
      filters.dateFrom = this.filterDateFrom()!.toISOString().split('T')[0];
    if (this.filterDateTo()) filters.dateTo = this.filterDateTo()!.toISOString().split('T')[0];
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.listRequest?.unsubscribe();
    this.listRequest = this.invoiceService
      .loadAll(filters)
      .pipe(takeUntilDestroyed(this.listDestroyRef))
      .subscribe();
  }
}
