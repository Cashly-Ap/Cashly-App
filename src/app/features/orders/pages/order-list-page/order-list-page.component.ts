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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CancelOrderDialogComponent } from '@features/orders/components/cancel-order-dialog/cancel-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderFilters } from '@features/orders/services/api/order-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { OrderStatus, ORDER_STATUS_LABELS, getOrderStatusLabel } from '@features/orders/models/enums/order-status.enum';
import { OrderList } from '@features/orders/models/interfaces';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';

@Component({
  selector: 'app-order-list-page',
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
    CancelOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
  ],
  templateUrl: './order-list-page.component.html',
  providers: [ConfirmationService],
})
export class OrderListPageComponent implements OnInit {
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

  readonly cancelDialogVisible = signal(false);
  readonly orderToCancel = signal<OrderList | null>(null);

  readonly invoiceDialogVisible = signal(false);
  readonly orderToInvoice = signal<OrderList | null>(null);

  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    ...Object.values(OrderStatus).map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
  ];

  readonly activeFilterCount = computed(() => (this.filterStatus() ? 1 : 0));

  readonly showInitialLoading = computed(() => this.loading() && (this.orders()?.length ?? 0) === 0);
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

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
  }

  clearFilters(): void {
    this.filterStatus.set('');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/pedidos', 'nuevo']);
  }

  onView(order: OrderList): void {
    this.router.navigate(['/pedidos', order.id]);
  }

  onEdit(order: OrderList): void {
    this.router.navigate(['/pedidos', order.id, 'editar']);
  }

  onDelete(order: OrderList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el pedido #${order.orderNumber}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.orderService.delete(order.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Pedido eliminado exitosamente',
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el pedido. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  onConfirm(order: OrderList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea confirmar el pedido #${order.orderNumber}?`,
      header: 'Confirmar Pedido',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.orderService.confirm(order.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Pedido #${order.orderNumber} confirmado exitosamente`,
              life: 3000,
            });
            this.loadWithFilters();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al confirmar el pedido. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
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

  onInvoiceDialogConfirmed(paymentType: string): void {
    const order = this.orderToInvoice();
    if (!order) return;
    this.invoiceDialogVisible.set(false);
    this.orderService.convertToInvoice(order.id, paymentType).subscribe({
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
      error: () => {
        this.orderToInvoice.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al convertir el pedido a factura. Por favor, intente nuevamente.',
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

  getStatusVariant(status: OrderStatus): 'success' | 'danger' | 'info' | 'label' {
    const variants: Record<OrderStatus, 'success' | 'danger' | 'info' | 'label'> = {
      [OrderStatus.DRAFT]: 'label',
      [OrderStatus.CONFIRMED]: 'info',
      [OrderStatus.CANCELLED]: 'danger',
      [OrderStatus.INVOICED]: 'success',
    };
    return variants[status] ?? 'label';
  }

  private loadWithFilters(): void {
    const filters: OrderFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterStatus()) filters.status = this.filterStatus();
    this.orderService.loadAll(filters).subscribe();
  }
}
