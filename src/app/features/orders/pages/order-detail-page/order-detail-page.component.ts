import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
  DetailsSectionCardComponent,
} from '@shared/components/details';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderStatus, getOrderStatusLabel } from '@features/orders/models/enums/order-status.enum';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
  ],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderApplicationService);
  private readonly messageService = inject(MessageService);

  readonly order = this.orderService.currentOrder;
  readonly loading = this.orderService.loading;

  readonly isConfirming = signal(false);
  readonly isCancelling = signal(false);

  readonly OrderStatus = OrderStatus;

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
          this.router.navigate(['/pedidos']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/pedidos']);
  }

  onEdit(): void {
    const id = this.order()?.id;
    if (id) this.router.navigate(['/pedidos', id, 'editar']);
  }

  onConfirm(): void {
    const id = this.order()?.id;
    if (!id) return;
    this.isConfirming.set(true);
    this.orderService.confirm(id).subscribe({
      next: () => {
        this.isConfirming.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido confirmado exitosamente', life: 3000 });
      },
      error: () => {
        this.isConfirming.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al confirmar el pedido.', life: 5000 });
      },
    });
  }

  onCancel(): void {
    const id = this.order()?.id;
    if (!id) return;
    this.isCancelling.set(true);
    this.orderService.cancel(id).subscribe({
      next: () => {
        this.isCancelling.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pedido cancelado exitosamente', life: 3000 });
      },
      error: () => {
        this.isCancelling.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cancelar el pedido.', life: 5000 });
      },
    });
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
}
