import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { DetailsCardComponent } from '@shared/components/details';
import { DetailsInfoFieldComponent } from '@shared/components/details';
import { DetailsInfoGridComponent } from '@shared/components/details';
import { UserApplicationService } from '@features/users/services/application';
import { UserDetails } from '@features/users/models/interfaces';
import { getUserTypeLabel, UserType } from '@features/users/models/enums';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-users-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardModule,
    ButtonModule,
    DividerModule,
    AvatarModule,
    DetailsCardComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
  ],
  templateUrl: './users-details-page.component.html',
  providers: [ConfirmationService, MessageService],
})
export class UsersDetailsPageComponent implements OnInit {
  private service = inject(UserApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  user = signal<UserDetails | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    }
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.service.loadUserById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el usuario. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/users']);
      },
    });
  }

  onEdit(): void {
    const id = this.user()?.id;
    if (id) {
      this.router.navigate(['/users', id, 'edit']);
    }
  }

  onDelete(): void {
    const userToDelete = this.user();
    if (!userToDelete) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el usuario "${userToDelete.displayName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deleteUser(userToDelete.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/users']);
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

  onBack(): void {
    this.router.navigate(['/users']);
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }

  getInitials(): string {
    const displayName = this.user()?.displayName || '';
    return displayName.charAt(0).toUpperCase();
  }
}
