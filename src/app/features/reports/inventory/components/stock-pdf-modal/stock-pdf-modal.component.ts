import { Component, ChangeDetectionStrategy, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryApplicationService } from '@features/categories/services/application';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { StockPdfFilters } from '@features/reports/inventory/models/interfaces';

@Component({
  selector: 'app-stock-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './stock-pdf-modal.component.html',
})
export class StockPdfModalComponent {
  private readonly categoryService = inject(CategoryApplicationService);
  private readonly warehouseService = inject(WarehouseApplicationService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<StockPdfFilters>();
  readonly onGenerateExcel = output<StockPdfFilters>();

  readonly warehouseId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly withStock = signal<boolean | null>(null);
  readonly lowStock = signal<boolean | null>(null);
  readonly loading = signal(false);

  readonly withStockOptions = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Con Stock' },
    { value: false, label: 'Sin Stock' },
  ];

  readonly lowStockOptions = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Stock Bajo' },
  ];

  readonly categoryOptions = computed(() => [
    { value: null, label: 'Todas las categorías' },
    ...this.categoryService.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly warehouseOptions = computed(() => [
    { value: null, label: 'Todos los almacenes' },
    ...this.warehouseService.simpleWarehouses().map((w) => ({ value: w.id, label: `${w.name} (${w.state})` })),
  ]);

  loadFilters(): void {
    const needsCategories = this.categoryService.categories().length === 0;
    const needsWarehouses = this.warehouseService.simpleWarehouses().length === 0;
    if (!needsCategories && !needsWarehouses) return;
    this.loading.set(true);

    if (needsCategories) {
      this.categoryService.loadAll({ size: 1000 }).subscribe(() => this.loading.set(false));
    }
    if (needsWarehouses) {
      this.warehouseService.loadSimpleWarehouses().subscribe(() => this.loading.set(false));
    }
  }

  private buildFilters(): StockPdfFilters {
    return {
      warehouseId: this.warehouseId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
      withStock: this.withStock() ?? undefined,
      lowStock: this.lowStock() ?? undefined,
    };
  }

  generatePdf(): void {
    this.onGeneratePdf.emit(this.buildFilters());
  }

  generateExcel(): void {
    this.onGenerateExcel.emit(this.buildFilters());
  }
}
