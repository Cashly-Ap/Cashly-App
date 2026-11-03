import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { ConfirmOrderDialogComponent } from '@features/sales/orders/components/confirm-order-dialog/confirm-order-dialog.component';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { DocumentListAction, documentListAction } from '@shared/models/document-list-action';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
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
  convertToInvoiceAction,
} from '@shared/components/list';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { CancelOrderDialogComponent } from '@features/sales/orders/components/cancel-order-dialog/cancel-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/sales/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import {
  OrderFilters,
  ConvertToInvoiceRequest,
} from '@features/sales/orders/services/api/order-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import {
  OrderStatus,
  ORDER_STATUS_LABELS,
  getOrderStatusLabel,
} from '@features/sales/orders/models/enums/order-status.enum';
import { OrderList } from '@features/sales/orders/models/interfaces/order-list.interface';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-order-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PanelCardComponent,
    ListFilterComponent,
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
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    TextBadgeComponent,
    ConfirmOrderDialogComponent,
    CancelOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
  ],
  templateUrl: './order-list-page.component.html',
  providers: [provideTranslatedConfirmation()],
})
export class OrderListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
  private readonly orderService = inject(OrderApplicationService);
  private readonly orderPdfApi = inject(OrderPdfApiService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly pdfViewerService = inject(PdfViewerService);

  readonly orders = this.orderService.orders;
  readonly loading = this.orderService.loading;
  readonly totalElements = this.orderService.totalElements;

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly filterStatus = signal('');

  readonly confirmOrderId = signal<string | null>(null);

  readonly cancelDialogVisible = signal(false);
  readonly orderToCancel = signal<OrderList | null>(null);

  readonly invoiceDialogVisible = signal(false);
  readonly orderToInvoice = signal<OrderList | null>(null);

  readonly orderBy = signal('createdAt');
  readonly orderDir = signal<'asc' | 'desc'>('desc');

  readonly statusOptions = [
    { label: 'Todos los borradores', value: '' },
    ...Object.values(OrderStatus).map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
    { label: 'Todos', value: 'ALL' },
  ];

  readonly activeFilterCount = computed(() => (this.filterStatus() ? 1 : 0));

  readonly showInitialLoading = computed(
    () => this.loading() && (this.orders()?.length ?? 0) === 0,
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
  private readonly navigationAction = signal<DocumentListAction | undefined>(undefined);

  private readonly listNavigation = connectListNavigation({
    onActionChange: (action) => {
      const previous = this.navigationAction();
      this.navigationAction.set(documentListAction(action));
      if (!action && previous) this.loadWithFilters();
    },
    records: () => this.orders().slice(this.first(), this.first() + this.rows()),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => {
      this.filterStatus.set('ALL');
      this.onSearch(term);
    },
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.orderNumber,
    description: (record) => `${record.customerAlias} · ${record.status}`,
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
    this.filterStatus.set('');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/sales/orders/new']);
  }

  onView(order: OrderList): void {
    this.router.navigate(['/sales/orders', order.id]);
  }

  onEdit(order: OrderList): void {
    this.router.navigate(['/sales/orders', order.id, 'edit']);
  }

  actionsFor(order: OrderList): ListAction[] {
    const actions: ListAction[] = [
      viewAction(() => this.onView(order)),
      pdfAction(() => this.onDownloadPdf(order)),
    ];
    if (order.status === 'DRAFT') {
      actions.push(
        editAction(() => this.onEdit(order)),
        confirmAction('Confirmar', () => this.onConfirm(order)),
        deleteAction(() => this.onDelete(order)),
      );
    }
    if (order.status === 'CONFIRMED') {
      actions.push(
        convertToInvoiceAction(() => this.onConvertToInvoice(order)),
        cancelAction('Cancelar pedido', () => this.onCancelOrder(order)),
      );
    }
    return actions;
  }

  onDelete(order: OrderList): void {
    this.deletion.open('orders', order.id, order.orderNumber, () => this.loadWithFilters());
  }

  onConfirm(order: OrderList): void {
    this.confirmOrderId.set(order.id);
  }

  onOrderConfirmed(id: string): void {
    this.confirmOrderId.set(null);
    this.orderService.confirm(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido confirmado exitosamente',
        });
        this.loadWithFilters();
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al confirmar el pedido. Por favor, intente nuevamente.',
        }),
    });
  }
  onCancelOrder(order: OrderList): void {
    this.orderToCancel.set(order);
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(event: { orderId: string; reason: string }): void {
    this.cancelDialogVisible.set(false);
    this.orderService.cancel(event.orderId, event.reason).subscribe({
      next: () => {
        this.orderToCancel.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido cancelado exitosamente',
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: () => {
        this.orderToCancel.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar el pedido. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
    this.orderToCancel.set(null);
  }

  onConvertToInvoice(order: OrderList): void {
    this.orderToInvoice.set(order);
    this.invoiceDialogVisible.set(true);
  }

  onInvoiceDialogConfirmed(request: ConvertToInvoiceRequest): void {
    const order = this.orderToInvoice();
    if (!order) return;
    this.invoiceDialogVisible.set(false);
    this.orderService.convertToInvoice(order.id, request).subscribe({
      next: () => {
        this.orderToInvoice.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Pedido #${order.orderNumber} convertido a factura exitosamente`,
          life: 3000,
        });
        this.loadWithFilters();
      },
      error: (err) => {
        this.orderToInvoice.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:
            err?.error?.message ||
            'Error al convertir el pedido a factura. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onInvoiceDialogDismissed(): void {
    this.invoiceDialogVisible.set(false);
    this.orderToInvoice.set(null);
  }

  onDownloadPdf(order: OrderList): void {
    const config: PdfViewerConfig = {
      url: `/api/reports/orders/${order.id}/pdf`,
      title: `Pedido #${order.orderNumber}`,
      fileName: `pedido-${order.orderNumber}.pdf`,
    };
    this.pdfViewerService.open(config);
  }

  getStatusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  getStatusVariant(status: OrderStatus): 'success' | 'warning' | 'danger' | 'info' | 'label' {
    const variants: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'info' | 'label'> = {
      [OrderStatus.DRAFT]: 'label',
      [OrderStatus.CONFIRMED]: 'info',
      [OrderStatus.CANCELLED]: 'danger',
      [OrderStatus.INVOICED]: 'success',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    const filters: OrderFilters = {};
    if (this.navigationAction()) filters.action = this.navigationAction();
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (!this.navigationAction() && this.filterStatus()) filters.status = this.filterStatus();
    filters.orderBy = this.orderBy();
    filters.orderDir = this.orderDir();
    this.listRequest?.unsubscribe();
    this.listRequest = this.orderService
      .loadAll(filters)
      .pipe(takeUntilDestroyed(this.listDestroyRef))
      .subscribe();
  }
}
