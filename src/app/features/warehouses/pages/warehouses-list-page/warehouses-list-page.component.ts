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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { WarehouseFilters } from '@features/warehouses/services/api/warehouse-api.service';
import { WarehouseList } from '@features/warehouses/models/interfaces';

@Component({
  selector: 'app-warehouses-list-page',
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
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  warehouses = this.service.warehouses;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  filterActive = signal('');

  activeFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  showInitialLoading = computed(() => this.loading() && this.warehouses().length === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.totalElements() === 0 && !this.filterActive() && !this.searchTerm());
  hasFilteredResults = computed(() => !this.loading() && this.totalElements() === 0 && (!!this.filterActive() || !!this.searchTerm()));

  activeFilterCount = computed(() => (this.filterActive() ? 1 : 0));

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

  onActiveFilterChange(value: string | null): void {
    this.filterActive.set(value ?? '');
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterActive.set('');
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
