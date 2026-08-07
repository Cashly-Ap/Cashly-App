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
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { ConvertToOrderDialogComponent } from '@features/quotes/components/convert-to-order-dialog/convert-to-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { AssignWarehousesDialogComponent } from '@features/quotes/components/assign-warehouses-dialog/assign-warehouses-dialog.component';
import { QuoteApplicationService } from '@features/quotes/services/application/quote-application.service';
import { QuoteFilters, ConvertToInvoiceRequest, AssignQuoteWarehousesRequest } from '@features/quotes/services/api/quote-api.service';
import { QuoteStatus, QUOTE_STATUS_LABELS, getQuoteStatusLabel } from '@features/quotes/models/enums/quote-status.enum';
import { QuoteList } from '@features/quotes/models/interfaces';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';

@Component({
  selector: 'app-quote-list-page',
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
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
    ConvertToOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
    AssignWarehousesDialogComponent,
  ],
  templateUrl: './quote-list-page.component.html',
  providers: [ConfirmationService],
})
export class QuoteListPageComponent implements OnInit {
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly pdfViewerService = inject(PdfViewerService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly quotes = this.quoteService.quotes;
  readonly loading = this.quoteService.loading;
  readonly totalElements = this.quoteService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterStatus = signal('');

  readonly orderDialogVisible = signal(false);
  readonly quoteToConvertToOrder = signal<QuoteList | null>(null);

  readonly invoiceDialogVisible = signal(false);
  readonly quoteToConvertToInvoice = signal<QuoteList | null>(null);

  readonly assignDialogVisible = signal(false);
  readonly quoteToAssignWarehouses = signal<QuoteList | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { label: 'Todos (Borradores)', value: '' },
    { label: 'Borrador', value: 'DRAFT' },
    ...Object.values(QuoteStatus)
      .filter((s) => s !== QuoteStatus.DRAFT && s !== QuoteStatus.CANCELLED)
      .map((s) => ({ label: QUOTE_STATUS_LABELS[s], value: s })),
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterStatus()) count++;
    return count;
  });

  readonly showInitialLoading = computed(() => this.loading() && (this.quotes()?.length ?? 0) === 0);
  readonly isEmptyDatabase = computed(
    () => !this.loading() && this.totalElements() === 0 && !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () => !this.loading() && this.totalElements() === 0 && !!this.searchTerm(),
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

  clearFilters(): void {
    this.filterStatus.set('DRAFT');
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

  onCreate(): void {
    this.router.navigate(['/quotes/new']);
  }

  onView(quote: QuoteList): void {
    this.router.navigate(['/quotes', quote.id]);
  }

  onEdit(quote: QuoteList): void {
    this.router.navigate(['/quotes', quote.id, 'edit']);
  }

  onDelete(quote: QuoteList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el presupuesto #${quote.quoteNumber}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.quoteService.delete(quote.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Presupuesto eliminado exitosamente',
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el presupuesto. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onConvertToOrder(quote: QuoteList): void {
    this.quoteToConvertToOrder.set(quote);
    this.orderDialogVisible.set(true);
  }

  onOrderDialogConfirmed(): void {
    const quote = this.quoteToConvertToOrder();
    if (!quote) return;
    this.orderDialogVisible.set(false);
    this.quoteService.convertToOrder(quote.id).subscribe({
      next: () => {
        this.quoteToConvertToOrder.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Presupuesto #${quote.quoteNumber} convertido a pedido exitosamente`,
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.quoteToConvertToOrder.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al convertir el presupuesto a pedido. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onOrderDialogDismissed(): void {
    this.orderDialogVisible.set(false);
    this.quoteToConvertToOrder.set(null);
  }

  onConvertToInvoice(quote: QuoteList): void {
    this.quoteToConvertToInvoice.set(quote);
    this.invoiceDialogVisible.set(true);
  }

  onInvoiceDialogConfirmed(request: ConvertToInvoiceRequest): void {
    const quote = this.quoteToConvertToInvoice();
    if (!quote) return;
    this.invoiceDialogVisible.set(false);
    this.quoteService.convertToInvoice(quote.id, request).subscribe({
      next: () => {
        this.quoteToConvertToInvoice.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Presupuesto #${quote.quoteNumber} convertido a factura exitosamente`,
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.quoteToConvertToInvoice.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al convertir el presupuesto a factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onInvoiceDialogDismissed(): void {
    this.invoiceDialogVisible.set(false);
    this.quoteToConvertToInvoice.set(null);
  }

  onAssignWarehouses(quote: QuoteList): void {
    this.quoteToAssignWarehouses.set(quote);
    this.assignDialogVisible.set(true);
  }

  onConvertToOrderFromAssign(quoteId: string): void {
    this.assignDialogVisible.set(false);
    this.quoteToAssignWarehouses.set(null);
    this.quoteService.convertToOrder(quoteId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Almacenes asignados y convertido a pedido.',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Error al convertir a pedido.',
          life: 5000,
        });
        this.loadWithFilters();
      },
    });
  }

  onConvertToInvoiceFromAssign(quoteId: string): void {
    this.assignDialogVisible.set(false);
    this.quoteToAssignWarehouses.set(null);
    this.quoteService.convertToInvoice(quoteId, { paymentType: 'CASH' }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Almacenes asignados y convertido a factura.',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Error al convertir a factura.',
          life: 5000,
        });
        this.loadWithFilters();
      },
    });
  }

  onAssignFinished(): void {
    const quote = this.quoteToAssignWarehouses();
    this.assignDialogVisible.set(false);
    this.quoteToAssignWarehouses.set(null);
    if (quote) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Presupuesto #${quote.quoteNumber} con almacenes asignados.`,
        life: 3000,
      });
    }
    this.loadWithFilters();
  }

  onAssignWarehousesDismissed(): void {
    this.assignDialogVisible.set(false);
    this.quoteToAssignWarehouses.set(null);
  }

  onDownloadPdf(quote: QuoteList): void {
    const config: PdfViewerConfig = {
      url: `/api/reports/quotes/${quote.id}/pdf`,
      title: `Presupuesto #${quote.quoteNumber}`,
      fileName: `presupuesto-${quote.quoteNumber}.pdf`,
    };
    this.pdfViewerService.open(config);
  }

  getStatusLabel(status: QuoteStatus): string {
    return getQuoteStatusLabel(status);
  }

  getStatusVariant(status: QuoteStatus): 'success' | 'warning' | 'danger' | 'label' {
    const variants: Record<QuoteStatus, 'success' | 'warning' | 'danger' | 'label'> = {
      [QuoteStatus.DRAFT]: 'label',
      [QuoteStatus.CUSTOMER_DRAFT]: 'warning',
      [QuoteStatus.CANCELLED]: 'danger',
      [QuoteStatus.CONVERTED_TO_ORDER]: 'success',
      [QuoteStatus.CONVERTED_TO_INVOICE]: 'success',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    const filters: QuoteFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus()) filters.status = this.filterStatus();
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.quoteService.loadAll(filters).subscribe();
  }
}
