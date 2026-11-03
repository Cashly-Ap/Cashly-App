import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
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
  ListFilterComponent,
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
  viewAction,
  editAction,
  deleteAction,
  listAction,
} from '@shared/components/list';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';

import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import {
  WarehouseStockOperation,
  WarehouseStockOperationDialogComponent,
} from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { WarehouseList } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { WarehouseFilters } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';
import { WAREHOUSE_SUCCESS_MESSAGES } from '@features/inventory/warehouses/messages/success-messages';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { FilterFieldComponent } from '@shared/components/ui/filter-field/filter-field.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
@Component({
  selector: 'app-warehouses-list-page',
  standalone: true,
  imports: [
    PaginatorComponent,
    FilterFieldComponent,
    PageHeaderComponent,
    SubmitButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
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
    EmptyStateComponent,
    LoadingSpinnerComponent,
    SearchFieldComponent,
    StatusBadgeComponent,
    WarehouseStockOperationDialogComponent,
  ],
  providers: [provideTranslatedConfirmation()],
  templateUrl: './warehouses-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehousesListPageComponent implements OnInit {
  private readonly deletion = inject(DeleteDialogService);
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

  private readonly listNavigation = connectListNavigation({
    records: () => this.warehouses(),
    loading: () => this.loading(),
    total: () => this.totalElements(),
    first: () => this.first(),
    rows: () => this.rows(),
    search: (term) => this.onSearch(term),
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.name,
    description: (record) => `${record.state} · ${record.municipality}`,
    refresh: () => this.loadWithFilters(),
    acceptsAction: (label) =>
      !['Registrar entrada', 'Registrar salida', 'Historial de movimientos'].includes(label),
    actions: (record) => this.actionsFor(record),
  });

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
    this.router.navigate(['/inventory/warehouses', 'new']);
  }

  onView(warehouse: WarehouseList): void {
    this.router.navigate(['/inventory/warehouses', warehouse.id]);
  }

  onEdit(warehouse: WarehouseList): void {
    this.router.navigate(['/inventory/warehouses', warehouse.id, 'edit']);
  }

  onViewStock(warehouse: WarehouseList): void {
    this.router.navigate(['/inventory/warehouses/stock'], {
      queryParams: { warehouseId: warehouse.id },
    });
  }

  onViewMovements(warehouse: WarehouseList): void {
    this.router.navigate(['/inventory/warehouses/movements'], {
      queryParams: { warehouseId: warehouse.id },
    });
  }

  onOpenEntry(warehouse: WarehouseList): void {
    this.openOperation(warehouse, 'entry');
  }

  onOpenExit(warehouse: WarehouseList): void {
    this.openOperation(warehouse, 'exit');
  }

  actionsFor(warehouse: WarehouseList): ListAction[] {
    const actions: ListAction[] = [
      listAction('Registrar entrada', 'EXECUTE', 'arrow-circle-down', () =>
        this.onOpenEntry(warehouse),
      ),
      listAction('Registrar salida', 'EXECUTE', 'arrow-circle-up', () =>
        this.onOpenExit(warehouse),
      ),
      listAction('Ver stock', 'READ', 'box', () => this.onViewStock(warehouse)),
      listAction('Historial de movimientos', 'READ', 'history', () =>
        this.onViewMovements(warehouse),
      ),
      viewAction(() => this.onView(warehouse)),
      editAction(() => this.onEdit(warehouse)),
    ];
    actions.push(deleteAction(() => this.onDelete(warehouse)));
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
    this.deletion.open('warehouses', warehouse.id, warehouse.name, () => this.loadWithFilters());
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
