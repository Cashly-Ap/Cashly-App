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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserFilters } from '@features/users/services/api/user-api.service';
import { UserList } from '@features/users/models/interfaces';
import { getUserTypeLabel, UserType, USER_TYPES } from '@features/users/models/enums';

@Component({
  selector: 'app-users-list-page',
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
  ],
  templateUrl: './users-list-page.component.html',
  providers: [ConfirmationService, MessageService],
})
export class UsersListPageComponent implements OnInit {
  private service = inject(UserApplicationService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  users = this.service.users;
  loading = this.service.loading;

  searchTerm = signal('');
  first = signal(0);
  rows = signal(10);

  filterRole = signal<string>('');
  filterActive = signal<string>('');

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterRole()) count++;
    if (this.filterActive()) count++;
    return count;
  });

  roleOptions = [
    { label: 'Todos los roles', value: '' },
    ...USER_TYPES.map((t) => ({ label: t.label, value: t.value })),
  ];

  activeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' },
  ];

  paginatedUsers = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.users().slice(start, end);
  });

  totalRecords = computed(() => this.users().length);

  showInitialLoading = computed(() => this.loading() && this.users().length === 0);
  isEmptyDatabase = computed(() => !this.loading() && this.users().length === 0 && this.activeFilterCount() === 0 && !this.searchTerm());
  hasFilteredResults = computed(() => !this.loading() && this.users().length === 0 && (this.activeFilterCount() > 0 || !!this.searchTerm()));

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
  }

  applyFilters(): void {
    this.first.set(0);
    this.loadWithFilters();
  }

  clearFilters(): void {
    this.filterRole.set('');
    this.filterActive.set('');
    this.first.set(0);
    this.loadWithFilters();
  }

  private loadWithFilters(): void {
    const filters: UserFilters = {};
    if (this.searchTerm()) filters.search = this.searchTerm();
    if (this.filterRole()) filters.role = this.filterRole();
    if (this.filterActive()) filters.active = this.filterActive() === 'true';
    this.service.loadUsers(filters).subscribe();
  }

  onCreate(): void {
    this.router.navigate(['/users', 'new']);
  }

  onView(user: UserList): void {
    this.router.navigate(['/users', user.id]);
  }

  onEdit(user: UserList): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  onDelete(user: UserList): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el usuario "${user.userName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado exitosamente',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el usuario. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      },
    });
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }
}
