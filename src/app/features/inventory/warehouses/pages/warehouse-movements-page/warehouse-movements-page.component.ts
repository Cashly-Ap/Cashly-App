import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import {
  TextBadgeComponent,
  TextBadgeVariant,
} from '@shared/components/ui/text-badge/text-badge.component';
import { WarehouseMovementItem } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';

const PAGE_SIZE = 15;
const MOVEMENT_TYPE_OPTIONS = [
  { label: 'Todos los tipos', value: '' },
  { label: 'Entrada', value: 'ENTRY' },
  { label: 'Salida', value: 'EXIT' },
  { label: 'Ajuste', value: 'ADJUSTMENT' },
  { label: 'Salida por componente', value: 'COMPONENT_EXIT' },
  { label: 'Transferencia entrada', value: 'TRANSFER_IN' },
  { label: 'Transferencia salida', value: 'TRANSFER_OUT' },
  { label: 'Entrada por devolución', value: 'RETURN_ENTRY' },
  { label: 'Entrada por cancelación', value: 'CANCEL_ENTRY' },
  { label: 'Salida por venta', value: 'SALE_EXIT' },
];
const REFERENCE_TYPE_LABELS: Record<string, string> = {
  ORDER: 'Pedido',
  INVOICE: 'Factura',
  RETURN: 'Devolución',
  TRANSFER: 'Transferencia',
  PURCHASE: 'Compra',
  MANUAL: 'Manual',
};
const MOVEMENT_TYPE_VARIANTS: Record<string, TextBadgeVariant> = {
  ENTRY: 'success',
  EXIT: 'danger',
  ADJUSTMENT: 'warning',
  COMPONENT_EXIT: 'danger',
  TRANSFER_IN: 'info',
  TRANSFER_OUT: 'info',
  RETURN_ENTRY: 'success',
  CANCEL_ENTRY: 'success',
  SALE_EXIT: 'danger',
};

@Component({
  selector: 'app-warehouse-movements-page',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
  ],
  templateUrl: './warehouse-movements-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseMovementsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(WarehouseApplicationService);
  private readonly messageService = inject(MessageService);

  readonly warehouseId = signal('');
  readonly warehouseName = signal('');
  readonly movements = signal<WarehouseMovementItem[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);
  readonly movementType = signal('');
  readonly movementTypeOptions = MOVEMENT_TYPE_OPTIONS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.warehouseId.set(id);
    this.service.loadById(id).subscribe({
      next: (warehouse) => this.warehouseName.set(warehouse.name),
      error: () => this.handleLoadError(),
    });
    this.loadMovements(0);
  }

  onTypeChange(value: string): void {
    this.movementType.set(value);
    this.loadMovements(0);
  }

  onPageChange(page: number): void {
    this.loadMovements(page);
  }

  onBack(): void {
    this.router.navigate(['/inventory/warehouses', this.warehouseId()]);
  }

  getMovementTypeLabel(type: string): string {
    return MOVEMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
  }

  getMovementTypeVariant(type: string): TextBadgeVariant {
    return MOVEMENT_TYPE_VARIANTS[type] ?? 'secondary';
  }

  getReferenceTypeLabel(type: string | undefined): string {
    return type ? (REFERENCE_TYPE_LABELS[type] ?? type) : '';
  }

  private loadMovements(page: number): void {
    const id = this.warehouseId();
    if (!id) return;
    this.loading.set(true);
    this.service
      .getMovements(id, {
        page,
        size: PAGE_SIZE,
        ...(this.movementType() ? { movementType: this.movementType() } : {}),
      })
      .subscribe({
        next: (response) => {
          this.movements.set(response.content ?? []);
          this.page.set(response.number ?? page);
          this.totalPages.set(response.totalPages ?? 0);
          this.totalElements.set(response.totalElements ?? 0);
          this.loading.set(false);
        },
        error: () => this.handleLoadError(),
      });
  }

  private handleLoadError(): void {
    this.loading.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: WAREHOUSE_ERROR_MESSAGES.loadMovements,
      life: 5000,
    });
  }
}
