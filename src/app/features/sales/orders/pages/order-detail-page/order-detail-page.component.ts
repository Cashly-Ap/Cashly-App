import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { StatusVariant } from '@shared/models/status-variant';
import { orderStatusVariant } from '@features/sales/orders/models/order-status.presentation';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';

import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import {
  OrderStatus,
  getOrderStatusLabel,
} from '@features/sales/orders/models/enums/order-status.enum';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { CodeBadgeComponent } from '@shared/components/ui/code-badge/code-badge.component';
import { ConfirmOrderDialogComponent } from '@features/sales/orders/components/confirm-order-dialog/confirm-order-dialog.component';
import { CancelOrderDialogComponent } from '@features/sales/orders/components/cancel-order-dialog/cancel-order-dialog.component';
import { ConvertToInvoiceDialogComponent } from '@features/sales/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { PdfViewerService } from '@core/pdf-viewer';
import { ConvertToInvoiceRequest } from '@features/sales/orders/services/api/order-api.service';
import { OrderList } from '@features/sales/orders/models/interfaces/order-list.interface';
@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CodeBadgeComponent,
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    PermissionDirective,
    ButtonModule,
    TableModule,
    DetailActionsMenuComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    ConfirmOrderDialogComponent,
    CancelOrderDialogComponent,
    ConvertToInvoiceDialogComponent,
  ],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderApplicationService);
  private readonly messageService = inject(MessageService);
  private readonly deletion = inject(DeleteDialogService);
  private readonly pdfViewerService = inject(PdfViewerService);

  readonly order = this.orderService.currentOrder;
  readonly loading = this.orderService.loading;

  readonly OrderStatus = OrderStatus;
  readonly confirmDialogVisible = signal(false);
  readonly cancelDialogVisible = signal(false);
  readonly invoiceDialogVisible = signal(false);
  readonly orderForDialog = computed(() => this.order() as unknown as OrderList | null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar el pedido. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/sales/orders']);
        },
      });
    }
  }

  onDownloadPdf(): void {
    const order = this.order();
    if (!order) return;
    this.pdfViewerService.open({
      url: `/api/reports/orders/${order.id}/pdf`,
      title: `Pedido #${order.orderNumber}`,
      fileName: `pedido-${order.orderNumber}.pdf`,
    });
  }

  onConfirm(): void {
    this.confirmDialogVisible.set(true);
  }

  onConfirmDialogConfirmed(orderId: string): void {
    this.confirmDialogVisible.set(false);
    this.orderService.confirm(orderId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido confirmado exitosamente',
          life: 3000,
        });
        this.orderService.loadById(orderId).subscribe();
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
  }

  onConfirmDialogDismissed(): void {
    this.confirmDialogVisible.set(false);
  }

  onCancelOrder(): void {
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(event: { orderId: string; reason: string }): void {
    this.cancelDialogVisible.set(false);
    this.orderService.cancel(event.orderId, event.reason).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido cancelado exitosamente',
          life: 3000,
        });
        this.orderService.loadById(event.orderId).subscribe();
      },
      error: () => {
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
  }

  onConvertToInvoice(): void {
    this.invoiceDialogVisible.set(true);
  }

  onInvoiceDialogConfirmed(request: ConvertToInvoiceRequest): void {
    const order = this.order();
    if (!order) return;
    this.invoiceDialogVisible.set(false);
    this.orderService.convertToInvoice(order.id, request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido convertido a factura exitosamente',
          life: 3000,
        });
        this.orderService.loadById(order.id).subscribe();
      },
      error: () => {
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
  }

  onDelete(): void {
    const order = this.order();
    if (!order) return;
    this.deletion.open('orders', order.id, order.orderNumber, () =>
      this.router.navigate(['/sales/orders']),
    );
  }

  onBack(): void {
    this.navigationHistory.back(['/sales/orders']);
  }

  onEdit(): void {
    const id = this.order()?.id;
    if (id) this.router.navigate(['/sales/orders', id, 'edit']);
  }

  getStatusLabel(status: OrderStatus): string {
    return getOrderStatusLabel(status);
  }

  getStatusVariant(status: OrderStatus): StatusVariant {
    return orderStatusVariant(status);
  }
}
