import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { DocumentListAction, documentListAction } from '@shared/models/document-list-action';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
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

import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import {
  ListFilterComponent,
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
  viewAction,
  editAction,
  pdfAction,
  deleteAction,
  cancelAction,
  confirmAction,
} from '@shared/components/list';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { CancelPurchaseDialogComponent } from '@features/procurement/purchases/components/cancel-purchase-dialog/cancel-purchase-dialog.component';
import { ConfirmPurchaseDialogComponent } from '@features/procurement/purchases/components/confirm-purchase-dialog/confirm-purchase-dialog.component';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';
import { PurchaseFilters } from '@features/procurement/purchases/services/api/purchase-api.service';
import {
  PurchaseStatus,
  PURCHASE_STATUS_LABELS,
  getPurchaseStatusLabel,
} from '@features/procurement/purchases/models/enums/purchase-status.enum';
import { PurchaseList } from '@features/procurement/purchases/models/interfaces/purchase-list.interface';
import { PdfViewerService } from '@core/pdf-viewer';
import { PURCHASE_SUCCESS_MESSAGES } from '@features/procurement/purchases/messages/success-messages';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { CreateButtonComponent } from '@shared/components/ui/create-button/create-button.component';
@Component({
  selector: 'app-purchase-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CreateButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
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
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    TextBadgeComponent,
    CancelPurchaseDialogComponent,
    ConfirmPurchaseDialogComponent,
  ],
  templateUrl: './purchase-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class PurchaseListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
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

  private readonly listDestroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  private readonly navigationAction = signal<DocumentListAction | undefined>(undefined);

  private readonly listNavigation = connectListNavigation({
    onActionChange: (action) => {
      const previous = this.navigationAction();
      this.navigationAction.set(documentListAction(action));
      if (!action && previous) this.loadWithFilters();
    },
    records: () => this.purchases().slice(this.first(), this.first() + this.rows()),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    acceptsAction: () => {
      this.filterStatus.set('DRAFT');
      return true;
    },
    search: (term) => this.onSearch(term),
    paginate: (event) => this.onPageChange(event),
    filters: () =>
      this.navigationAction()
        ? []
        : [
            {
              label: 'Estado',
              value: this.filterStatus(),
              options: this.statusOptions,
              change: (value) => this.onStatusFilterChange(value),
            },
          ],
    label: (record) => record.purchaseNumber,
    description: (record) => `${record.supplierName} · ${record.status}`,
    refresh: () => this.loadWithFilters(),
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
    this.router.navigate(['/procurement/purchases/new']);
  }

  onView(purchase: PurchaseList): void {
    this.router.navigate(['/procurement/purchases', purchase.id]);
  }

  onEdit(purchase: PurchaseList): void {
    this.router.navigate(['/procurement/purchases', purchase.id, 'edit']);
  }

  actionsFor(purchase: PurchaseList): ListAction[] {
    const actions: ListAction[] = [
      viewAction(() => this.onView(purchase)),
      pdfAction(() => this.onDownloadPdf(purchase)),
    ];
    if (purchase.status === 'DRAFT') {
      actions.push(
        editAction(() => this.onEdit(purchase)),
        confirmAction('Confirmar compra', () => this.onConfirm(purchase)),
        deleteAction(() => this.onDelete(purchase)),
      );
    }
    if (purchase.status === 'CONFIRMED') {
      actions.push(cancelAction('Cancelar compra', () => this.onCancelPurchase(purchase)));
    }
    return actions;
  }

  onDelete(purchase: PurchaseList): void {
    this.deletion.open('purchases', purchase.id, purchase.purchaseNumber, () =>
      this.loadWithFilters(),
    );
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
    if (this.navigationAction()) filters.action = this.navigationAction();
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (!this.navigationAction() && this.filterStatus()) filters.status = this.filterStatus();
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.listRequest?.unsubscribe();
    this.listRequest = this.purchaseService
      .loadAll(filters)
      .pipe(takeUntilDestroyed(this.listDestroyRef))
      .subscribe();
  }
}
