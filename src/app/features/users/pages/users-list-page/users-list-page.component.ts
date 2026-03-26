import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
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

  ngOnInit(): void {
    this.service.loadUsers().subscribe();
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
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
