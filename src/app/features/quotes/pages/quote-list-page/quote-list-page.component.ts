import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { ConvertToOrderDialogComponent } from '@features/quotes/components/convert-to-order-dialog/convert-to-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { QuoteApplicationService } from '@features/quotes/services/application/quote-application.service';
import { QuoteStatus, getQuoteStatusLabel } from '@features/quotes/models/enums/quote-status.enum';
import { QuoteList } from '@features/quotes/models/interfaces';

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
    IconFieldModule,
    InputIconModule,
    PaginatorModule,
    ConfirmDialogModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
    ConvertToOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
  ],
  templateUrl: './quote-list-page.component.html',
  providers: [ConfirmationService],
})
export class QuoteListPageComponent implements OnInit {
  private readonly quoteService = inject(QuoteApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly quotes = this.quoteService.quotes;
  readonly loading = this.quoteService.loading;
  readonly totalElements = this.quoteService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);

  readonly filteredQuotes = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return (this.quotes() ?? [])
      .filter((q) => q.status === 'DRAFT')
      .filter((q) => {
        if (!term) return true;
        return q.quoteNumber.toLowerCase().includes(term) ||
               q.customerName.toLowerCase().includes(term);
      });
  });

  readonly displayedTotal = computed(() => this.filteredQuotes().length);

  readonly orderDialogVisible = signal(false);
  readonly quoteToConvertToOrder = signal<QuoteList | null>(null);

  readonly invoiceDialogVisible = signal(false);
  readonly quoteToConvertToInvoice = signal<QuoteList | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly showInitialLoading = computed(() => this.loading() && (this.quotes()?.length ?? 0) === 0);
  readonly isEmptyDatabase = computed(
    () => !this.loading() && this.displayedTotal() === 0 && !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () => !this.loading() && this.displayedTotal() === 0 && !!this.searchTerm(),
  );

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
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
    this.router.navigate(['/presupuestos', 'nuevo']);
  }

  onView(quote: QuoteList): void {
    this.router.navigate(['/presupuestos', quote.id]);
  }

  onEdit(quote: QuoteList): void {
    this.router.navigate(['/presupuestos', quote.id, 'editar']);
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

  onInvoiceDialogConfirmed(paymentType: string): void {
    const quote = this.quoteToConvertToInvoice();
    if (!quote) return;
    this.invoiceDialogVisible.set(false);
    this.quoteService.convertToInvoice(quote.id, paymentType).subscribe({
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

  getStatusLabel(status: QuoteStatus): string {
    return getQuoteStatusLabel(status);
  }

  getStatusVariant(status: QuoteStatus): 'success' | 'danger' | 'label' {
    const variants: Record<QuoteStatus, 'success' | 'danger' | 'label'> = {
      [QuoteStatus.DRAFT]: 'label',
      [QuoteStatus.CANCELLED]: 'danger',
      [QuoteStatus.CONVERTED_TO_ORDER]: 'success',
      [QuoteStatus.CONVERTED_TO_INVOICE]: 'success',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    this.quoteService.loadAll().subscribe();
  }
}
