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
import { ContentCardComponent } from '@shared/components/ui/content-card/content-card.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { ListContainerComponent } from '@shared/components/list/list-container/list-container.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserList } from '@features/users/models/interfaces';
import { getUserTypeLabel, UserType } from '@features/users/models/enums';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-users-list-page',
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
  totalRecords = computed(() => this.filteredUsers().length);

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allUsers = this.users();

    if (!term) return allUsers;

    return allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  });

  paginatedUsers = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredUsers().slice(start, end);
  });

  hasFilteredResults = computed(() => {
    return this.users().length > 0 && this.filteredUsers().length === 0;
  });

  showInitialLoading = computed(() => {
    return this.loading() && this.users().length === 0;
  });

  isEmptyDatabase = computed(() => {
    return !this.loading() && this.users().length === 0;
  });

  ngOnInit(): void {
    this.service.loadUsers().subscribe();
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
      message: `¿Está seguro de que desea eliminar el usuario "${user.displayName}"?`,
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
