import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import {
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
} from '@shared/components/list';
import {
  ContentCardComponent,
  EmptyStateComponent,
  LoadingSpinnerComponent,
  SearchFieldComponent,
  StatusBadgeComponent,
} from '@shared/components/ui';
import {
  WarehouseStockOperation,
  WarehouseStockOperationDialogComponent,
} from '@features/warehouses/components';
import { WarehouseList } from '@features/warehouses/models/interfaces';
import { WarehouseFilters } from '@features/warehouses/services/api/warehouse-api.service';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import {
  WAREHOUSE_ERROR_MESSAGES,
  WAREHOUSE_SUCCESS_MESSAGES,
} from '@features/warehouses/messages';

@Component({
  selector: 'app-warehouses-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    PopoverModule,
    SelectModule,
    TableModule,
    TooltipModule,
    ListActionButtonsComponent,
    ListContainerComponent,
    ContentCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SearchFieldComponent,
    StatusBadgeComponent,
    WarehouseStockOperationDialogComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './warehouses-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehousesListPageComponent implements OnInit {
  private readonly service = inject(WarehouseApplicationService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly warehouses = this.service.warehouses;
  readonly loading = this.service.loading;
  readonly totalElements = this.service.totalElements;
  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly orderBy = signal('name');
  readonly orderDir = signal<'asc' | 'desc'>('asc');
  readonly filterActive = signal('true');
  readonly operationDialogVisible = signal(false);
  readonly selectedWarehouse = signal<WarehouseList | null>(null);
  readonly selectedOperation = signal<WarehouseStockOperation>('entry');
  readonly activeFilterOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  readonly showInitialLoading = computed(() => this.loading() && this.warehouses().length === 0);
  readonly isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.filterActive() === 'true' &&
      !this.searchTerm(),
  );
  readonly hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.filterActive() !== 'true' || !!this.searchTerm()),
  );
  readonly activeFilterCount = computed(() => (this.filterActive() !== 'true' ? 1 : 0));

  ngOnInit(): void {
    this.loadWithFilters();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadWithFilters();
  }

  onSort(event: SortEvent): void {
    const field = event.field ?? 'name';
    const direction = event.order === 1 ? 'asc' : 'desc';
    if (field === this.orderBy() && direction === this.orderDir()) return;
    this.orderBy.set(field);
    this.orderDir.set(direction);
    this.first.set(0);
    this.loadWithFilters();
  }

  onActiveFilterChange(value: string | null): void {
    this.filterActive.set(value ?? '');
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterActive.set('true');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/warehouses', 'new']);
  }

  onView(warehouse: WarehouseList): void {
    this.router.navigate(['/warehouses', warehouse.id]);
  }

  onEdit(warehouse: WarehouseList): void {
    this.router.navigate(['/warehouses', warehouse.id, 'edit']);
  }

  onViewStock(warehouse: WarehouseList): void {
    this.router.navigate(['/warehouses', warehouse.id, 'stock']);
  }

  onViewMovements(warehouse: WarehouseList): void {
    this.router.navigate(['/warehouses', warehouse.id, 'movements']);
  }

  onOpenEntry(warehouse: WarehouseList): void {
    this.openOperation(warehouse, 'entry');
  }

  onOpenExit(warehouse: WarehouseList): void {
    this.openOperation(warehouse, 'exit');
  }

  actionsFor(warehouse: WarehouseList): ListAction[] {
    const actions: ListAction[] = [
      {
        label: 'Registrar entrada',
        icon: 'pi pi-arrow-circle-down',
        command: () => this.onOpenEntry(warehouse),
      },
      {
        label: 'Registrar salida',
        icon: 'pi pi-arrow-circle-up',
        command: () => this.onOpenExit(warehouse),
      },
      { label: 'Ver stock', icon: 'pi pi-box', command: () => this.onViewStock(warehouse) },
      {
        label: 'Historial de movimientos',
        icon: 'pi pi-history',
        command: () => this.onViewMovements(warehouse),
      },
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.onView(warehouse) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.onEdit(warehouse) },
    ];
    if (warehouse.deletable) {
      actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(warehouse),
      });
    }
    return actions;
  }

  onToggleActive(warehouse: WarehouseList): void {
    this.service.toggleActive(warehouse.id, !warehouse.active).subscribe({
      next: () =>
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: WAREHOUSE_SUCCESS_MESSAGES.toggleStatus(!warehouse.active),
          life: 3000,
        }),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: WAREHOUSE_ERROR_MESSAGES.toggleStatus,
          life: 5000,
        }),
    });
  }

  onDelete(warehouse: WarehouseList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el almacén "${warehouse.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(warehouse.id).subscribe({
          next: () =>
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: WAREHOUSE_SUCCESS_MESSAGES.delete,
              life: 3000,
            }),
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: WAREHOUSE_ERROR_MESSAGES.delete,
              life: 5000,
            }),
        });
      },
    });
  }

  private openOperation(warehouse: WarehouseList, operation: WarehouseStockOperation): void {
    this.selectedWarehouse.set(warehouse);
    this.selectedOperation.set(operation);
    this.operationDialogVisible.set(true);
  }

  private loadWithFilters(): void {
    const filters: WarehouseFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    this.service.loadAll(filters).subscribe();
  }
}
