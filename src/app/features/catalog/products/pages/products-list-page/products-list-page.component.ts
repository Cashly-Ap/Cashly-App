import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import {
  ListAction,
  ListActionButtonsComponent,
  ListContainerComponent,
} from '@shared/components/list';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { ProductFilters } from '@features/catalog/products/services/api/product-api.service';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
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
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './products-list-page.component.html',
  providers: [ConfirmationService],
})
export class ProductsListPageComponent implements OnInit {
  private service = inject(ProductApplicationService);
  private categoryService = inject(CategoryApplicationService);
  private priceTypeService = inject(PriceTypeApplicationService);
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
  orderBy = signal('name');
  orderDir = signal<'asc' | 'desc'>('asc');
  filterActive = signal('true');
  filterComposite = signal('');
  filterCategoryId = signal<string | null>(null);
  selectedPriceTypeId = signal<string | null>(null);

  activeFilterOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  compositeFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Simples', value: 'false' },
    { label: 'Compuestos', value: 'true' },
  ];

  showInitialLoading = computed(() => this.loading() && this.products().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.filterActive() === 'true' &&
      !this.filterComposite() &&
      !this.filterCategoryId() &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.filterActive() !== 'true' ||
        !!this.filterComposite() ||
        !!this.filterCategoryId() ||
        !!this.searchTerm()),
  );

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterActive() !== 'true') count++;
    if (this.filterComposite()) count++;
    if (this.filterCategoryId() !== null) count++;
    return count;
  });

  categoryOptions = computed(() => [
    { label: 'Todas las categorías', value: null },
    ...this.categories().map((c) => ({ label: c.name, value: c.id })),
  ]);

  priceTypeOptions = computed(() =>
    this.priceTypeService
      .priceTypes()
      .filter((pt) => pt.active)
      .map((pt) => ({ label: pt.name, value: pt.id })),
  );

  ngOnInit(): void {
    this.categoryService.loadAll({ size: 1000 }).subscribe();
    this.priceTypeService.loadAll({ size: 1000 }).subscribe(() => {
      const types = this.priceTypeService.priceTypes().filter((pt) => pt.active);
      if (types.length > 0) {
        this.selectedPriceTypeId.set(types[0].id);
      }
      this.loadWithFilters();
    });
  }

  getPriceForProduct(product: ProductList): number {
    const selected = this.selectedPriceTypeId();
    if (!selected) return product.purchasePrice ?? 0;
    return (
      product.productPrices.find((pp) => pp.priceTypeId === selected)?.price ??
      product.purchasePrice ??
      0
    );
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
    const newField = event.field ?? 'name';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
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
    this.filterActive.set('true');
    this.filterComposite.set('');
    this.filterCategoryId.set(null);
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/catalog/products', 'new']);
  }

  onView(product: ProductList): void {
    this.router.navigate(['/catalog/products', product.id]);
  }

  onEdit(product: ProductList): void {
    this.router.navigate(['/catalog/products', product.id, 'edit']);
  }

  actionsFor(product: ProductList): ListAction[] {
    const actions: ListAction[] = [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.onView(product) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.onEdit(product) },
    ];
    if (product.deletable) {
      actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(product),
      });
    }
    return actions;
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
              detail:
                'No se puede eliminar el producto porque tiene movimientos o documentos asociados.',
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
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    if (this.filterComposite()) filters.composite = this.filterComposite() === 'true';
    if (this.filterCategoryId() !== null) filters.categoryId = this.filterCategoryId()!;
    this.service.loadAll(filters).subscribe();
  }
}
