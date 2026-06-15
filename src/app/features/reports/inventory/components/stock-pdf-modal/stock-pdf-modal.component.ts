import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
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
  ],
  templateUrl: './stock-pdf-modal.component.html',
})
export class StockPdfModalComponent implements OnInit {
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

  ngOnInit(): void {
    if (this.categoryService.categories().length === 0) {
      this.categoryService.loadAll({ size: 1000 }).subscribe();
    }
    if (this.warehouseService.simpleWarehouses().length === 0) {
      this.warehouseService.loadSimpleWarehouses().subscribe();
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
