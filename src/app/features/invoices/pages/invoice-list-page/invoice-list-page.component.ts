import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CancelInvoiceDialogComponent } from '@features/invoices/components/cancel-invoice-dialog/cancel-invoice-dialog.component';
import { DuplicateInvoiceDialogComponent } from '@features/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { PaymentMethodList } from '@features/payment-methods/models/interfaces';
import { PaymentMethodApiService } from '@features/payment-methods/services/api/payment-method-api.service';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { InvoiceFilters } from '@features/invoices/services/api/invoice-api.service';
import { InvoiceStatus, INVOICE_STATUS_LABELS, getInvoiceStatusLabel } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType, PAYMENT_TYPE_LABELS, getPaymentTypeLabel } from '@features/invoices/models/enums/payment-type.enum';
import { InvoiceList } from '@features/invoices/models/interfaces';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';
import { CustomerBalanceApiService } from '@features/customers/services/api/customer-balance-api.service';

@Component({
  selector: 'app-invoice-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    ::ng-deep .confirm-invoice-dialog .p-select,
    ::ng-deep .confirm-invoice-dialog .p-inputnumber {
      width: 100% !important;
    }
    ::ng-deep .confirm-invoice-dialog .p-select .p-select-label,
    ::ng-deep .confirm-invoice-dialog .p-inputnumber .p-inputnumber-input {
      width: 100% !important;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe,
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
    DialogModule,
    PasswordModule,
    RadioButtonModule,
    InputNumberModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
    CancelInvoiceDialogComponent,
    DuplicateInvoiceDialogComponent,
  ],
  templateUrl: './invoice-list-page.component.html',
  providers: [ConfirmationService],
})
export class InvoiceListPageComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly pdfViewerService = inject(PdfViewerService);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);

  readonly invoices = this.invoiceService.invoices;
  readonly loading = this.invoiceService.loading;
  readonly totalElements = this.invoiceService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly selectedStatus = signal('');
  readonly selectedReturnStatus = signal('');
  readonly filterPaymentType = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);

  readonly defaultStatuses = [InvoiceStatus.DRAFT, InvoiceStatus.PENDING_PAYMENT, InvoiceStatus.PARTIALLY_PAID];

  readonly filterStatus = computed(() => {
    const s = this.selectedStatus();
    return s ? [s] : [];
  });

  readonly cancelDialogVisible = signal(false);
  readonly invoiceToCancel = signal<InvoiceList | null>(null);

  readonly duplicateDialogVisible = signal(false);
  readonly invoiceToDuplicate = signal<InvoiceList | null>(null);

  readonly confirmDialogVisible = signal(false);
  readonly invoiceToConfirm = signal<InvoiceList | null>(null);
  readonly customerBalanceConfirm = signal(0);
  readonly useBalanceConfirm = signal(false);
  readonly confirmationPassword = signal('');
  readonly isConfirming = signal(false);
  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly paymentLines = signal<{ methodId: string; amount: number }[]>([]);

  readonly totalPayments = computed(() => {
    const balance = this.useBalanceConfirm() ? Math.min(this.customerBalanceConfirm(), this.invoiceToConfirm()?.total ?? 0) : 0;
    const methods = this.paymentLines().reduce((s, l) => s + (l.amount || 0), 0);
    return balance + methods;
  });

  readonly remainingToPay = computed(() => {
    const total = this.invoiceToConfirm()?.total ?? 0;
    return Math.max(0, total - this.totalPayments());
  });

  readonly maxPaymentPerLine = computed(() => {
    const total = this.invoiceToConfirm()?.total ?? 0;
    const balanceUsed = this.useBalanceConfirm() ? Math.min(this.customerBalanceConfirm(), total) : 0;
    const alreadyAssigned = this.paymentLines().reduce((s, l) => s + (l.amount || 0), 0);
    return Math.max(0, total - balanceUsed - alreadyAssigned);
  });

  maxForLine(index: number): number {
    const total = this.invoiceToConfirm()?.total ?? 0;
    const balanceUsed = this.useBalanceConfirm() ? Math.min(this.customerBalanceConfirm(), total) : 0;
    const otherLines = this.paymentLines()
      .filter((_, i) => i !== index)
      .reduce((s, l) => s + (l.amount || 0), 0);
    return Math.max(0, total - balanceUsed - otherLines);
  }

  readonly allPaymentsValid = computed(() => {
    const lines = this.paymentLines();
    const total = this.invoiceToConfirm()?.total ?? 0;
    if (lines.length === 0 && !this.useBalanceConfirm()) return false;
    return lines.every(l => l.methodId && l.amount > 0) && this.totalPayments() === total;
  });

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
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

  readonly activeFilterCount = computed(() => {
    let count = 0;
    const statuses = this.filterStatus();
    if (statuses.length > 0) count++;
    if (this.filterPaymentType()) count++;
    if (this.selectedReturnStatus()) count++;
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
    this.filterPaymentType.set('');
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onView(invoice: InvoiceList): void {
    this.router.navigate(['/invoices', invoice.id]);
  }

  onCreate(): void {
    this.router.navigate(['/invoices/new']);
  }

  onEdit(invoice: InvoiceList): void {
    this.router.navigate(['/invoices', invoice.id, 'edit']);
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
    this.confirmationPassword.set('');
    this.useBalanceConfirm.set(false);
    this.paymentLines.set([]);
    if (invoice.paymentType === PaymentType.CASH) {
      this.balanceApi.getBalance(invoice.customerId).subscribe({
        next: (b) => this.customerBalanceConfirm.set(b.totalBalance),
        error: () => this.customerBalanceConfirm.set(0),
      });
      this.paymentMethodApi.getAll({ active: true }).subscribe({
        next: (methods) => this.paymentMethods.set(methods),
        error: () => this.paymentMethods.set([]),
      });
    }
    this.confirmDialogVisible.set(true);
  }

  addPaymentLine(): void {
    this.paymentLines.update(lines => [...lines, { methodId: '', amount: 0 }]);
  }

  trackByIndex(index: number): number { return index; }

  removePaymentLine(index: number): void {
    this.paymentLines.update(lines => lines.filter((_, i) => i !== index));
  }

  updatePaymentLine(index: number, field: 'methodId' | 'amount', value: any): void {
    this.paymentLines.update(lines => {
      const updated = [...lines];
      if (field === 'amount') {
        const v = Number(value) || 0;
        const max = this.maxForLine(index);
        updated[index] = { ...updated[index], amount: v > max ? max : v };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }

  submitConfirm(): void {
    const invoice = this.invoiceToConfirm();
    if (!invoice) return;
    const isCash = invoice.paymentType === PaymentType.CASH;

    this.isConfirming.set(true);
    const confirmData: any = {};
    if (isCash) {
      const balanceToUse = this.useBalanceConfirm() ? Math.min(this.customerBalanceConfirm(), invoice.total) : 0;
      confirmData.useBalance = this.useBalanceConfirm();
      confirmData.balanceAmount = balanceToUse;
      const lines = this.paymentLines();
      if (lines.length > 0) {
        confirmData.paymentMethodId = lines[0].methodId;
      }
    } else {
      if (!this.confirmationPassword()) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar su contraseña.', life: 4000 });
        this.isConfirming.set(false);
        return;
      }
      confirmData.confirmationPassword = this.confirmationPassword();
    }

    this.invoiceService.confirm(invoice.id, confirmData).subscribe({
      next: () => {
        this.isConfirming.set(false);
        this.confirmDialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Factura confirmada exitosamente', life: 3000 });
        this.loadWithFilters();
      },
      error: (err) => {
        this.isConfirming.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Error al confirmar.', life: 5000 });
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
    return returnStatus ? labels[returnStatus] ?? '' : '';
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
    return status !== InvoiceStatus.DRAFT && status !== InvoiceStatus.CANCELLED && status !== InvoiceStatus.PAID && status !== InvoiceStatus.FULLY_RETURNED;
  }

  private loadWithFilters(): void {
    const filters: InvoiceFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus().length > 0) filters.statuses = this.filterStatus();
    if (this.selectedReturnStatus()) filters.returnStatus = [this.selectedReturnStatus()];
    if (this.filterPaymentType()) filters.paymentType = this.filterPaymentType();
    if (this.filterDateFrom()) filters.dateFrom = this.filterDateFrom()!.toISOString().split('T')[0];
    if (this.filterDateTo()) filters.dateTo = this.filterDateTo()!.toISOString().split('T')[0];
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.invoiceService.loadAll(filters).subscribe();
  }
}