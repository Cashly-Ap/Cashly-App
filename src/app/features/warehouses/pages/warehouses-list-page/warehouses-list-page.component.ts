import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { of, catchError } from 'rxjs';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { WarehouseFilters } from '@features/warehouses/services/api/warehouse-api.service';
import { WarehouseList, WarehouseStockItem } from '@features/warehouses/models/interfaces';
import { ProductApplicationService } from '@features/products/services/application';
import { ProductDetails } from '@features/products/models/interfaces';

@Component({
  selector: 'app-warehouses-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    DialogModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './warehouses-list-page.component.html',
  providers: [ConfirmationService],
})
export class WarehousesListPageComponent implements OnInit {
  private service = inject(WarehouseApplicationService);
  private productService = inject(ProductApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  warehouses = this.service.warehouses;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  filterActive = signal('true');

  showEntryDialog = signal(false);
  showExitDialog = signal(false);
  entryLoading = signal(false);
  exitLoading = signal(false);
  stockLoading = signal(false);
  selectedWarehouseId = signal<string | null>(null);
  cachedStock = signal<WarehouseStockItem[]>([]);

  entryForm: FormGroup = this.fb.group({ lines: this.fb.array([this.createEntryLine()]) });
  exitForm: FormGroup = this.fb.group({ lines: this.fb.array([this.createExitLine()]) });

  get entryLines(): FormArray {
    return this.entryForm.get('lines') as FormArray;
  }

  get exitLines(): FormArray {
    return this.exitForm.get('lines') as FormArray;
  }

  private compositeDetailsCache = new Map<string, ProductDetails>();

  productOptions = computed(() =>
    this.productService.simpleProducts().map((p) => ({
      value: p.id,
      label: p.composite ? `${p.name} [Compuesto]` : p.name,
      composite: p.composite,
    }))
  );

  exitProductOptions = computed(() => {
    const stockMap = new Map(this.cachedStock().map((s) => [s.productId, s.quantity]));
    return this.productService.simpleProducts()
      .filter((p) => (stockMap.get(p.id) ?? 0) > 0)
      .map((p) => ({
        value: p.id,
        label: p.composite ? `${p.name} [Compuesto]` : p.name,
        composite: p.composite,
      }));
  });

  isProductComposite(productId: string | null): boolean {
    if (!productId) return false;
    return this.productService.simpleProducts().find((p) => p.id === productId)?.composite ?? false;
  }

  onEntryProductSelected(productId: string | null): void {
    if (!productId || !this.isProductComposite(productId)) return;
    if (this.compositeDetailsCache.has(productId)) return;
    this.productService.getById(productId).subscribe({
      next: (details) => this.compositeDetailsCache.set(productId, details),
    });
  }

  getComponentStockImpact(productId: string | null, quantity: number | null): { name: string; current: number; resulting: number }[] {
    if (!productId || !quantity) return [];
    const details = this.compositeDetailsCache.get(productId);
    if (!details?.composite) return [];
    return details.components.map((c) => {
      const current = this.getCurrentStock(c.componentProductId);
      return {
        name: c.componentProductName,
        current,
        resulting: current - c.quantity * quantity,
      };
    });
  }

  activeFilterOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  showInitialLoading = computed(() => this.loading() && this.warehouses().length === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.totalElements() === 0 && this.filterActive() === 'true' && !this.searchTerm());
  hasFilteredResults = computed(() => !this.loading() && this.totalElements() === 0 && (this.filterActive() !== 'true' || !!this.searchTerm()));
  activeFilterCount = computed(() => (this.filterActive() !== 'true' ? 1 : 0));

  ngOnInit(): void {
    this.loadWithFilters();
    this.productService.loadSimpleProducts().subscribe();
  }

  private createEntryLine(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      notes: [''],
    });
  }

  private createExitLine(): FormGroup {
    return this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      notes: [''],
    });
  }

  getCurrentStock(productId: string | null): number {
    if (!productId) return 0;
    return this.cachedStock().find((s) => s.productId === productId)?.quantity ?? 0;
  }

  getResultingStock(productId: string | null, quantity: number | null, isEntry: boolean): number {
    const current = this.getCurrentStock(productId);
    const qty = quantity ?? 0;
    return isEntry ? current + qty : current - qty;
  }

  addEntryLine(): void {
    this.entryLines.push(this.createEntryLine());
  }

  removeEntryLine(index: number): void {
    if (this.entryLines.length > 1) this.entryLines.removeAt(index);
  }

  addExitLine(): void {
    this.exitLines.push(this.createExitLine());
  }

  removeExitLine(index: number): void {
    if (this.exitLines.length > 1) this.exitLines.removeAt(index);
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

  onOpenEntry(warehouse: WarehouseList): void {
    this.selectedWarehouseId.set(warehouse.id);
    this.entryForm.setControl('lines', this.fb.array([this.createEntryLine()]));
    this.cachedStock.set([]);
    this.showEntryDialog.set(true);
    this.loadCachedStock(warehouse.id);
  }

  onOpenExit(warehouse: WarehouseList): void {
    this.selectedWarehouseId.set(warehouse.id);
    this.exitForm.setControl('lines', this.fb.array([this.createExitLine()]));
    this.cachedStock.set([]);
    this.showExitDialog.set(true);
    this.loadCachedStock(warehouse.id);
  }

  private loadCachedStock(warehouseId: string): void {
    this.stockLoading.set(true);
    this.service.getStock(warehouseId).pipe(catchError(() => of([]))).subscribe({
      next: (stock) => {
        this.cachedStock.set(stock);
        this.stockLoading.set(false);
      },
      error: () => this.stockLoading.set(false),
    });
  }

  onSubmitEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }
    const warehouseId = this.selectedWarehouseId();
    if (!warehouseId) return;

    type LineValue = { productId: string; quantity: number; notes: string };
    const lines = this.entryForm.getRawValue().lines as LineValue[];
    const items = lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      notes: line.notes || undefined,
    }));

    this.entryLoading.set(true);
    this.service.addEntry(warehouseId, { items }).subscribe({
      next: () => {
        this.showEntryDialog.set(false);
        this.entryLoading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entradas registradas exitosamente', life: 3000 });
      },
      error: () => {
        this.entryLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar las entradas.', life: 5000 });
      },
    });
  }

  onSubmitExit(): void {
    if (this.exitForm.invalid) {
      this.exitForm.markAllAsTouched();
      return;
    }
    const warehouseId = this.selectedWarehouseId();
    if (!warehouseId) return;

    type LineValue = { productId: string; quantity: number; notes: string };
    const lines = this.exitForm.getRawValue().lines as LineValue[];
    const items = lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      notes: line.notes || undefined,
    }));

    this.exitLoading.set(true);
    this.service.addExit(warehouseId, { items }).subscribe({
      next: () => {
        this.showExitDialog.set(false);
        this.exitLoading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Salidas registradas exitosamente', life: 3000 });
      },
      error: () => {
        this.exitLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar las salidas.', life: 5000 });
      },
    });
  }

  onToggleActive(warehouse: WarehouseList): void {
    this.service.toggleActive(warehouse.id, !warehouse.active).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Almacén ${!warehouse.active ? 'activado' : 'desactivado'} exitosamente`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cambiar el estado del almacén.', life: 5000 });
      },
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
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Almacén eliminado exitosamente', life: 3000 });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el almacén.', life: 5000 });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: WarehouseFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    this.service.loadAll(filters).subscribe();
  }
}
