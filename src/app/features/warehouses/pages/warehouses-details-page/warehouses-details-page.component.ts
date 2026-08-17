import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  DetailActionsMenuComponent,
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import {
  LoadingSpinnerComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
} from '@shared/components/ui';
import { WarehouseDetails } from '@features/warehouses/models/interfaces';
import {
  WarehouseStockOperation,
  WarehouseStockOperationDialogComponent,
} from '@features/warehouses/components';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import {
  WAREHOUSE_ERROR_MESSAGES,
  WAREHOUSE_SUCCESS_MESSAGES,
} from '@features/warehouses/messages';

@Component({
  selector: 'app-warehouses-details-page',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    ConfirmDialogModule,
    DetailActionsMenuComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    WarehouseStockOperationDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './warehouses-details-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehousesDetailsPageComponent implements OnInit {
  private readonly service = inject(WarehouseApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly warehouse = signal<WarehouseDetails | null>(null);
  readonly loading = signal(false);
  readonly operationDialogVisible = signal(false);
  readonly selectedOperation = signal<WarehouseStockOperation>('entry');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadWarehouse(id);
  }

  onRegisterEntry(): void {
    this.openOperation('entry');
  }

  onRegisterExit(): void {
    this.openOperation('exit');
  }

  onViewStock(): void {
    this.navigateToChild('stock');
  }

  onViewMovements(): void {
    this.navigateToChild('movements');
  }

  onEdit(): void {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/warehouses', id, 'edit']);
  }

  onDelete(): void {
    const warehouse = this.warehouse();
    if (!warehouse) return;
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el almacén "${warehouse.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(warehouse.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: WAREHOUSE_SUCCESS_MESSAGES.delete,
              life: 3000,
            });
            this.router.navigate(['/warehouses']);
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: WAREHOUSE_ERROR_MESSAGES.deleteNotAllowed,
              life: 5000,
            }),
        });
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/warehouses']);
  }

  private loadWarehouse(id: string): void {
    this.loading.set(true);
    this.service.loadById(id).subscribe({
      next: (warehouse) => {
        this.warehouse.set(warehouse);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: WAREHOUSE_ERROR_MESSAGES.loadWarehouse,
          life: 5000,
        });
        this.router.navigate(['/warehouses']);
      },
    });
  }

  private openOperation(operation: WarehouseStockOperation): void {
    this.selectedOperation.set(operation);
    this.operationDialogVisible.set(true);
  }

  private navigateToChild(path: 'stock' | 'movements'): void {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/warehouses', id, path]);
  }
}
