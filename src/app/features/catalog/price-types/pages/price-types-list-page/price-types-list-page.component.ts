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
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeFilters } from '@features/catalog/price-types/services/api/price-type-api.service';
import { PriceTypeList } from '@features/catalog/price-types/models/interfaces/price-type-list.interface';

@Component({
  selector: 'app-price-types-list-page',
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
    TooltipModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    SearchFieldComponent,
    ListContainerComponent,
    ListActionButtonsComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './price-types-list-page.component.html',
  providers: [ConfirmationService],
})
export class PriceTypesListPageComponent implements OnInit {
  private service = inject(PriceTypeApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  priceTypes = this.service.priceTypes;
  isLoading = this.service.isLoading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  orderBy = signal('name');
  orderDir = signal<'asc' | 'desc'>('asc');

  showInitialLoading = computed(() => this.isLoading() && this.priceTypes().length === 0);
  isEmptyDatabase = computed(
    () => !this.isLoading() && this.totalElements() === 0 && !this.searchTerm(),
  );
  hasFilteredResults = computed(
    () => !this.isLoading() && this.totalElements() === 0 && !!this.searchTerm(),
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

  onCreate(): void {
    this.router.navigate(['/catalog/price-types', 'new']);
  }

  onView(priceType: PriceTypeList): void {
    this.router.navigate(['/catalog/price-types', priceType.id]);
  }

  onEdit(priceType: PriceTypeList): void {
    this.router.navigate(['/catalog/price-types', priceType.id, 'edit']);
  }

  actionsFor(priceType: PriceTypeList): ListAction[] {
    const actions: ListAction[] = [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.onView(priceType) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.onEdit(priceType) },
    ];
    if (priceType.deletable) {
      actions.push({
        label: 'Eliminar',
        icon: 'pi pi-trash',
        danger: true,
        command: () => this.onDelete(priceType),
      });
    }
    return actions;
  }

  onDelete(priceType: PriceTypeList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el tipo de precio "${priceType.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.remove(priceType.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Tipo de precio eliminado exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el tipo de precio.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  private loadWithFilters(): void {
    const filters: PriceTypeFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    this.service.loadAll(filters).subscribe();
  }
}
