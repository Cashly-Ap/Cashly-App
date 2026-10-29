import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { WarehouseDetails } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import {
  WarehouseStockOperation,
  WarehouseStockOperationDialogComponent,
} from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';
import { WAREHOUSE_SUCCESS_MESSAGES } from '@features/inventory/warehouses/messages/success-messages';

@Component({
  selector: 'app-warehouses-details-page',
  standalone: true,
  imports: [
    PermissionDirective,
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
  private readonly navigationHistory = inject(NavigationHistoryService);
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
    if (id) this.router.navigate(['/inventory/warehouses', id, 'edit']);
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
            this.router.navigate(['/inventory/warehouses']);
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
    this.navigationHistory.back(['/inventory/warehouses']);
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
        this.router.navigate(['/inventory/warehouses']);
      },
    });
  }

  private openOperation(operation: WarehouseStockOperation): void {
    this.selectedOperation.set(operation);
    this.operationDialogVisible.set(true);
  }

  private navigateToChild(path: 'stock' | 'movements'): void {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/inventory/warehouses', id, path]);
  }
}
