import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CustomerList } from '@features/customers/models/interfaces';
import { getCustomerTypeLabel } from '@features/customers/models/enums';

@Component({
  selector: 'app-customers-list-page',
  standalone: true,
  imports: [
    CommonModule,
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
    ContentCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ListContainerComponent,
  ],
  templateUrl: './customers-list-page.component.html',
  providers: [ConfirmationService, MessageService],
})
export class CustomersListPageComponent implements OnInit {
  private service = inject(CustomerApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  customers = this.service.customers;
  loading = this.service.loading;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);

  filteredCustomers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.customers();
    if (!term) return all;
    return all.filter(
      (c) =>
        c.legalName.toLowerCase().includes(term) ||
        c.alias.toLowerCase().includes(term) ||
        c.rif.toLowerCase().includes(term),
    );
  });

  paginatedCustomers = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredCustomers().slice(start, end);
  });

  totalRecords = computed(() => this.filteredCustomers().length);

  showInitialLoading = computed(() => this.loading() && this.customers().length === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.customers().length === 0);
  hasFilteredResults = computed(() => this.customers().length > 0 && this.filteredCustomers().length === 0);

  ngOnInit(): void {
    this.service.loadAll().subscribe();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
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
