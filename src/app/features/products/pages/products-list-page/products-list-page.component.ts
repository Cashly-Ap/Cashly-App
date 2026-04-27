import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { ProductApplicationService } from '@features/products/services/application';
import { CategoryApplicationService } from '@features/categories/services/application';
import { ProductFilters } from '@features/products/services/api/product-api.service';
import { ProductList } from '@features/products/models/interfaces';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    ToggleSwitchModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
  ],
  templateUrl: './products-list-page.component.html',
  providers: [ConfirmationService, MessageService],
})
export class ProductsListPageComponent implements OnInit {
  private service = inject(ProductApplicationService);
  private categoryService = inject(CategoryApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  products = this.service.products;
  loading = this.service.loading;
  totalElements = this.service.totalElements;
  categories = this.categoryService.categories;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  filterActive = signal('');
  filterComposite = signal('');
  filterCategoryId = signal<string | null>(null);

  activeFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  compositeFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Simples', value: 'false' },
    { label: 'Compuestos', value: 'true' },
  ];

  showInitialLoading = computed(() => this.loading() && this.products().length === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.totalElements() === 0 && !this.filterActive() && !this.filterComposite() && !this.filterCategoryId() && !this.searchTerm());
  hasFilteredResults = computed(() => !this.loading() && this.totalElements() === 0 && (!!this.filterActive() || !!this.filterComposite() || !!this.filterCategoryId() || !!this.searchTerm()));

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterActive()) count++;
    if (this.filterComposite()) count++;
    if (this.filterCategoryId() !== null) count++;
    return count;
  });

  categoryOptions = computed(() => [
    { label: 'Todas las categorías', value: null },
    ...this.categories().map((c) => ({ label: c.name, value: c.id })),
  ]);

  ngOnInit(): void {
    this.categoryService.loadAll({ size: 1000 }).subscribe();
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

  onActiveFilterChange(value: string | null): void {
    this.filterActive.set(value ?? '');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCompositeFilterChange(value: string | null): void {
    this.filterComposite.set(value ?? '');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCategoryFilterChange(value: string | null): void {
    this.filterCategoryId.set(value);
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterActive.set('');
    this.filterComposite.set('');
    this.filterCategoryId.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/products', 'new']);
  }

  onView(product: ProductList): void {
    this.router.navigate(['/products', product.id]);
  }

  onEdit(product: ProductList): void {
    this.router.navigate(['/products', product.id, 'edit']);
  }

  onToggleActive(product: ProductList): void {
    this.service.toggleActive(product.id, !product.active).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Producto ${!product.active ? 'activado' : 'desactivado'} exitosamente`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar el estado del producto.',
          life: 5000,
        });
      },
    });
  }

  onDelete(product: ProductList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el producto "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(product.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto eliminado exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el producto. Puede tener stock asociado.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: ProductFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    if (this.filterComposite()) filters.composite = this.filterComposite() === 'true';
    if (this.filterCategoryId() !== null) filters.categoryId = this.filterCategoryId()!;
    this.service.loadAll(filters).subscribe();
  }
}
