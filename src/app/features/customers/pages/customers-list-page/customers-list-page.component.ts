import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerFilters } from '@features/customers/services/api/customer-api.service';
import { CustomerList } from '@features/customers/models/interfaces';
import { getCustomerTypeLabel, CUSTOMER_TYPES } from '@features/customers/models/enums';
import { VENEZUELA_STATE_NAMES, getMunicipalitiesForState } from '@features/customers/data/venezuela-geo.data';

@Component({
  selector: 'app-customers-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MainLayoutComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    PaginatorModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    PopoverModule,
    SelectModule,
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './customers-list-page.component.html',
  providers: [ConfirmationService],
})
export class CustomersListPageComponent implements OnInit {
  private service = inject(CustomerApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  customers = this.service.customers;
  loading = this.service.loading;
  totalElements = this.service.totalElements;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);
  orderBy = signal('legalName');
  orderDir = signal<'asc' | 'desc'>('asc');

  filterType = signal<string>('');
  filterActive = signal<string>('true');
  filterPortalAccess = signal<string>('');
  filterState = signal<string>('');
  filterMunicipality = signal<string>('');

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterType()) count++;
    if (this.filterActive() !== 'true') count++;
    if (this.filterPortalAccess()) count++;
    if (this.filterState()) count++;
    if (this.filterMunicipality()) count++;
    return count;
  });

  municipalityOptions = computed(() => {
    return this.filterState() ? getMunicipalitiesForState(this.filterState()) : [];
  });

  customerTypeOptions = [
    { label: 'Todos los tipos', value: '' },
    ...CUSTOMER_TYPES.map((t) => ({ label: t.label, value: t.value })),
  ];

  activeOptions = [
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  portalAccessOptions = [
    { label: 'Todos', value: '' },
    { label: 'Con acceso', value: 'true' },
    { label: 'Sin acceso', value: 'false' },
  ];

  stateOptions = VENEZUELA_STATE_NAMES;

  showInitialLoading = computed(() => this.loading() && (this.customers()?.length ?? 0) === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.totalElements() === 0 && this.activeFilterCount() === 0 && !this.searchTerm());
  hasFilteredResults = computed(() => !this.loading() && this.totalElements() === 0 && (this.activeFilterCount() > 0 || !!this.searchTerm()));

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
    const newField = event.field ?? 'legalName';
    const newDir = event.order === 1 ? 'asc' : 'desc';
    if (newField === this.orderBy() && newDir === this.orderDir()) return;
    this.orderBy.set(newField);
    this.orderDir.set(newDir);
    this.first.set(0);
    this.loadWithFilters();
  }

  applyFilters(): void {
    this.first.set(0);
    this.loadWithFilters();
  }

  onTypeFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterType()) return;
    this.filterType.set(normalized);
    this.applyFilters();
  }

  onActiveFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterActive()) return;
    this.filterActive.set(normalized);
    this.applyFilters();
  }

  onPortalAccessFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterPortalAccess()) return;
    this.filterPortalAccess.set(normalized);
    this.applyFilters();
  }

  onStateFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterState()) return;
    this.filterState.set(normalized);
    this.filterMunicipality.set('');
    this.applyFilters();
  }

  onMunicipalityFilterChange(value: string | null): void {
    const normalized = value ?? '';
    if (normalized === this.filterMunicipality()) return;
    this.filterMunicipality.set(normalized);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterType.set('');
    this.filterActive.set('true');
    this.filterPortalAccess.set('');
    this.filterState.set('');
    this.filterMunicipality.set('');
    this.first.set(0);
    this.loadWithFilters();
  }

  private loadWithFilters(): void {
    const filters: CustomerFilters = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      orderBy: this.orderBy(),
      orderDir: this.orderDir(),
    };
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterType()) filters.type = this.filterType();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    if (this.filterPortalAccess()) filters.portalAccess = this.filterPortalAccess() === 'true';
    if (this.filterState()) filters.state = this.filterState();
    if (this.filterMunicipality()) filters.municipality = this.filterMunicipality();
    this.service.loadAll(filters).subscribe();
  }

  onCreate(): void {
    this.router.navigate(['/customers', 'new']);
  }

  onView(customer: CustomerList): void {
    this.router.navigate(['/customers', customer.id]);
  }

  onEdit(customer: CustomerList): void {
    this.router.navigate(['/customers', customer.id, 'edit']);
  }

  onDelete(customer: CustomerList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el cliente "${customer.legalName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(customer.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el cliente. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  getTypeLabel(type: string): string {
    return getCustomerTypeLabel(type as Parameters<typeof getCustomerTypeLabel>[0]);
  }
}
