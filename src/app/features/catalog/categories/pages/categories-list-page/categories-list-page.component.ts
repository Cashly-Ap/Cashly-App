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
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { CategoryFilters } from '@features/catalog/categories/services/api/category-api.service';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';

@Component({
  selector: 'app-categories-list-page',
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
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './categories-list-page.component.html',
  providers: [ConfirmationService],
})
export class CategoriesListPageComponent implements OnInit {
  private service = inject(CategoryApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  categories = this.service.categories;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  orderBy = signal('name');
  orderDir = signal<'asc' | 'desc'>('asc');
  filterActive = signal('true');

  activeFilterOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  activeFilterCount = computed(() => (this.filterActive() !== 'true' ? 1 : 0));

  showInitialLoading = computed(() => this.loading() && this.categories().length === 0);
  isEmptyDatabase = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      this.filterActive() === 'true' &&
      !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () =>
      !this.loading() &&
      this.totalElements() === 0 &&
      (this.filterActive() !== 'true' || !!this.searchTerm()),
  );

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

  clearFilters(): void {
    this.filterActive.set('true');
    this.first.set(0);
    this.loadWithFilters();
  }

  onCreate(): void {
    this.router.navigate(['/catalog/categories', 'new']);
  }

  onView(category: CategoryList): void {
    this.router.navigate(['/catalog/categories', category.id]);
  }

  onEdit(category: CategoryList): void {
    this.router.navigate(['/catalog/categories', category.id, 'edit']);
  }

  actionsFor(category: CategoryList): ListAction[] {
    const actions: ListAction[] = [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.onView(category) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.onEdit(category) },
    ];
    if (category.deletable) {
      actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(category),
      });
    }
    return actions;
  }

  onToggleActive(category: CategoryList): void {
    this.service.toggleActive(category.id, !category.active).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Categoría ${!category.active ? 'activada' : 'desactivada'} exitosamente`,
          life: 3000,
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cambiar el estado de la categoría.',
          life: 5000,
        });
      },
    });
  }

  onDelete(category: CategoryList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la categoría "${category.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(category.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría eliminada exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la categoría. Puede tener productos asociados.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: CategoryFilters = {
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
