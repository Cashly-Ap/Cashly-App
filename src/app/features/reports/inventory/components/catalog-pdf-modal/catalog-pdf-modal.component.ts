import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CategoryApplicationService } from '@features/categories/services/application/category-application.service';
import { WarehouseApplicationService } from '@features/warehouses/services/application/warehouse-application.service';
import { CatalogPdfFilters } from '@features/reports/inventory/models/interfaces/catalog-pdf-filters.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

@Component({
  selector: 'app-catalog-pdf-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ProgressSpinnerModule,
    SearchFieldComponent,
  ],
  templateUrl: './catalog-pdf-modal.component.html',
})
export class CatalogPdfModalComponent {
  private readonly categoryService = inject(CategoryApplicationService);
  private readonly warehouseService = inject(WarehouseApplicationService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();
  readonly onGeneratePdf = output<CatalogPdfFilters>();

  readonly search = signal('');
  readonly categoryId = signal<string | null>(null);
  readonly warehouseId = signal<string | null>(null);
  readonly withStock = signal<boolean | null>(null);
  readonly loading = signal(false);

  readonly stockOptions = [
    { value: null, label: 'Todos' },
    { value: true, label: 'Con Stock' },
    { value: false, label: 'Sin Stock' },
  ];

  readonly categoryOptions = computed(() => [
    { value: null, label: 'Todas las categorías' },
    ...this.categoryService.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly warehouseOptions = computed(() => [
    { value: null, label: 'Todos los almacenes' },
    ...this.warehouseService
      .simpleWarehouses()
      .map((w) => ({ value: w.id, label: `${w.name} (${w.state})` })),
  ]);

  loadFilters(): void {
    const needsCategories = this.categoryService.categories().length === 0;
    const needsWarehouses = this.warehouseService.simpleWarehouses().length === 0;
    if (!needsCategories && !needsWarehouses) return;
    this.loading.set(true);

    if (needsCategories) {
      this.categoryService.loadAll({ size: 1000 }).subscribe(() => this.checkLoadingDone());
    }
    if (needsWarehouses) {
      this.warehouseService.loadSimpleWarehouses().subscribe(() => this.checkLoadingDone());
    }
  }

  private checkLoadingDone(): void {
    this.loading.set(false);
  }

  onHide(): void {
    this.visibleChange.emit(false);
  }

  generatePdf(): void {
    this.onGeneratePdf.emit({
      search: this.search() || undefined,
      categoryId: this.categoryId() ?? undefined,
      warehouseId: this.warehouseId() ?? undefined,
      withStock: this.withStock() ?? undefined,
    });
  }
}
