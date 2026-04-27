import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CatalogPdfApiService } from '../../services/api/catalog-pdf-api.service';
import { CategoryApplicationService } from '@features/categories/services/application';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { finalize } from 'rxjs';

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
  ],
  templateUrl: './catalog-pdf-modal.component.html',
})
export class CatalogPdfModalComponent implements OnInit {
  private readonly pdfApi = inject(CatalogPdfApiService);
  private readonly categoryService = inject(CategoryApplicationService);
  private readonly warehouseService = inject(WarehouseApplicationService);

  readonly visible = input(false);
  readonly visibleChange = output<boolean>();

  readonly search = signal('');
  readonly categoryId = signal<string | null>(null);
  readonly warehouseId = signal<string | null>(null);
  readonly withStock = signal<boolean | null>(null);
  readonly downloading = signal(false);

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

  onHide(): void {
    this.visibleChange.emit(false);
  }

  downloadPdf(): void {
    this.downloading.set(true);
    this.pdfApi.downloadPdf({
      search: this.search() || undefined,
      categoryId: this.categoryId() ?? undefined,
      warehouseId: this.warehouseId() ?? undefined,
      withStock: this.withStock() ?? undefined,
    }).pipe(
      finalize(() => this.downloading.set(false))
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'catalogo-productos.pdf';
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }
}
