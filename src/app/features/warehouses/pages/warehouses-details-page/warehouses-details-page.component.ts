import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { WarehouseDetails, WarehouseMovementItem } from '@features/warehouses/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

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
  MANUAL: 'Manual',
};

const MOVEMENTS_PAGE_SIZE = 15;
const STOCK_PAGE_SIZE = 10;

@Component({
  selector: 'app-warehouses-details-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './warehouses-details-page.component.html',
})
export class WarehousesDetailsPageComponent implements OnInit {
  private service = inject(WarehouseApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  warehouse = signal<WarehouseDetails | null>(null);
  loading = signal(false);

  stockSearch = signal('');
  stockPage = signal(0);
  readonly stockPageSize = STOCK_PAGE_SIZE;

  filteredStock = computed(() => {
    const search = this.stockSearch().toLowerCase().trim();
    const stock = this.warehouse()?.stock ?? [];
    return search ? stock.filter((s) => s.productName.toLowerCase().includes(search)) : stock;
  });

  pagedStock = computed(() => {
    const page = this.stockPage();
    const all = this.filteredStock();
    return all.slice(page * STOCK_PAGE_SIZE, (page + 1) * STOCK_PAGE_SIZE);
  });

  stockTotalPages = computed(() => Math.ceil(this.filteredStock().length / STOCK_PAGE_SIZE));

  showMovements = signal(false);
  movementsLoading = signal(false);
  movementsPage = signal(0);
  movementsTotalPages = signal(0);
  movementsTotalElements = signal(0);
  movementsList = signal<WarehouseMovementItem[]>([]);
  movementTypeFilter = signal('');

  readonly movementTypeOptions = MOVEMENT_TYPE_OPTIONS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadWarehouse(id);
  }

  private loadWarehouse(id: string): void {
    this.loading.set(true);
    forkJoin({
      warehouse: this.service.loadById(id),
      stock: this.service.getStock(id).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ warehouse, stock }) => {
        this.warehouse.set({ ...warehouse, stock, recentMovements: [] });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el almacén.', life: 5000 });
        this.router.navigate(['/warehouses']);
      },
    });
  }

  onStockSearchChange(): void {
    this.stockPage.set(0);
  }

  onStockPageChange(page: number): void {
    this.stockPage.set(page);
  }

  onToggleMovements(): void {
    const showing = this.showMovements();
    if (!showing && this.movementsList().length === 0) {
      this.loadMovements(0);
    }
    this.showMovements.set(!showing);
  }

  onMovementTypeChange(): void {
    this.movementsPage.set(0);
    this.loadMovements(0);
  }

  onMovementsPageChange(page: number): void {
    this.movementsPage.set(page);
    this.loadMovements(page);
  }

  private loadMovements(page: number): void {
    const id = this.warehouse()?.id;
    if (!id) return;
    this.movementsLoading.set(true);
    this.service.getMovements(id, { page, size: MOVEMENTS_PAGE_SIZE }).subscribe({
      next: (res: PagedResponse<WarehouseMovementItem>) => {
        const type = this.movementTypeFilter();
        const items = res.content ?? [];
        this.movementsList.set(type ? items.filter((m) => m.movementType === type) : items);
        this.movementsTotalPages.set(res.totalPages ?? 0);
        this.movementsTotalElements.set(res.totalElements ?? 0);
        this.movementsLoading.set(false);
      },
      error: () => {
        this.movementsLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los movimientos.', life: 5000 });
      },
    });
  }

  onEdit(): void {
    const id = this.warehouse()?.id;
    if (id) this.router.navigate(['/warehouses', id, 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/warehouses']);
  }

  getMovementTypeLabel(type: string): string {
    const found = MOVEMENT_TYPE_OPTIONS.find((o) => o.value === type);
    return found?.label ?? type;
  }

  getMovementTypeBadgeClass(type: string): string {
    const base = 'px-2 py-0.5 rounded text-xs font-medium';
    const map: Record<string, string> = {
      ENTRY: `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`,
      EXIT: `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`,
      ADJUSTMENT: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`,
      COMPONENT_EXIT: `${base} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`,
      TRANSFER_IN: `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`,
      TRANSFER_OUT: `${base} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`,
      RETURN_ENTRY: `${base} bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300`,
      CANCEL_ENTRY: `${base} bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300`,
      SALE_EXIT: `${base} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`,
    };
    return map[type] ?? `${base} bg-surface-100 text-surface-700`;
  }

  getReferenceTypeLabel(type: string | undefined): string {
    if (!type) return '';
    return REFERENCE_TYPE_LABELS[type] ?? type;
  }
}
