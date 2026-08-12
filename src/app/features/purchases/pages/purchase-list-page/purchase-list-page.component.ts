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
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CancelPurchaseDialogComponent } from '@features/purchases/components/cancel-purchase-dialog/cancel-purchase-dialog.component';
import { ConfirmPurchaseDialogComponent } from '@features/purchases/components/confirm-purchase-dialog/confirm-purchase-dialog.component';
import { PurchaseApplicationService } from '@features/purchases/services/application/purchase-application.service';
import { PurchaseFilters } from '@features/purchases/services/api/purchase-api.service';
import {
  PurchaseStatus,
  PURCHASE_STATUS_LABELS,
  getPurchaseStatusLabel,
} from '@features/purchases/models/enums/purchase-status.enum';
import { PurchaseList } from '@features/purchases/models/interfaces';
import { PdfViewerService } from '@core/pdf-viewer';
import { PURCHASE_SUCCESS_MESSAGES } from '@features/purchases/messages';

@Component({
  selector: 'app-purchase-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    TextBadgeComponent,
    CancelPurchaseDialogComponent,
    ConfirmPurchaseDialogComponent,
  ],
  templateUrl: './purchase-list-page.component.html',
  providers: [ConfirmationService],
})
export class PurchaseListPageComponent implements OnInit {
  private readonly purchaseService = inject(PurchaseApplicationService);
  private readonly pdfViewerService = inject(PdfViewerService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly purchases = this.purchaseService.purchases;
  readonly loading = this.purchaseService.loading;
  readonly totalElements = this.purchaseService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterStatus = signal('DRAFT');

  readonly confirmDialogVisible = signal(false);
  readonly purchaseToConfirm = signal<PurchaseList | null>(null);

  readonly cancelDialogVisible = signal(false);
  readonly purchaseToCancel = signal<PurchaseList | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { label: 'Borrador', value: 'DRAFT' },
    ...Object.values(PurchaseStatus)
      .filter((s) => s !== PurchaseStatus.DRAFT)
      .map((s) => ({ label: PURCHASE_STATUS_LABELS[s], value: s })),
  ];

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterStatus() && this.filterStatus() !== 'DRAFT') count++;
    return count;
  });

  readonly showInitialLoading = computed(
    () => this.loading() && (this.purchases()?.length ?? 0) === 0,
  );
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
    this.router.navigate(['/purchases/new']);
  }

  onView(purchase: PurchaseList): void {
    this.router.navigate(['/purchases', purchase.id]);
  }

  onEdit(purchase: PurchaseList): void {
    this.router.navigate(['/purchases', purchase.id, 'edit']);
  }

  onDelete(purchase: PurchaseList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la compra #${purchase.purchaseNumber}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.purchaseService.delete(purchase.id).subscribe({
          next: () => {
            this.messageService.add(PURCHASE_SUCCESS_MESSAGES.deleted);
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la compra. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onConfirm(purchase: PurchaseList): void {
    this.purchaseToConfirm.set(purchase);
    this.confirmDialogVisible.set(true);
  }

  onConfirmDialogConfirmed(purchaseId: string): void {
    this.confirmDialogVisible.set(false);
    this.purchaseService.confirm(purchaseId).subscribe({
      next: () => {
        this.purchaseToConfirm.set(null);
        this.messageService.add(PURCHASE_SUCCESS_MESSAGES.confirmed);
        this.loadWithFilters();
      },
      error: () => {
        this.purchaseToConfirm.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al confirmar la compra. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onConfirmDialogDismissed(): void {
    this.confirmDialogVisible.set(false);
    this.purchaseToConfirm.set(null);
  }

  onCancelPurchase(purchase: PurchaseList): void {
    this.purchaseToCancel.set(purchase);
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(request: { reason: string; notes: string }): void {
    const purchase = this.purchaseToCancel();
    if (!purchase) return;
    this.cancelDialogVisible.set(false);
    this.purchaseService.cancel(purchase.id, request).subscribe({
      next: () => {
        this.purchaseToCancel.set(null);
        this.messageService.add(PURCHASE_SUCCESS_MESSAGES.cancelled);
        this.loadWithFilters();
      },
      error: () => {
        this.purchaseToCancel.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar la compra. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
    this.purchaseToCancel.set(null);
  }

  onDownloadPdf(purchase: PurchaseList): void {
    const config = {
      url: `/api/reports/purchases/${purchase.id}/pdf`,
      title: `Compra #${purchase.purchaseNumber}`,
      fileName: `compra-${purchase.purchaseNumber}.pdf`,
    };
    this.pdfViewerService.open(config);
  }

  getStatusLabel(status: PurchaseStatus): string {
    return getPurchaseStatusLabel(status);
  }

  getStatusVariant(status: PurchaseStatus): 'success' | 'danger' | 'label' {
    const variants: Record<PurchaseStatus, 'success' | 'danger' | 'label'> = {
      [PurchaseStatus.DRAFT]: 'label',
      [PurchaseStatus.CONFIRMED]: 'success',
      [PurchaseStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    const filters: PurchaseFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus()) filters.status = this.filterStatus();
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.purchaseService.loadAll(filters).subscribe();
  }
}
