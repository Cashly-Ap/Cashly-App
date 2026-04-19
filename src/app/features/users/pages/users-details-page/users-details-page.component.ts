import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserDetails } from '@features/users/models/interfaces';
import { getUserTypeLabel, UserType, BusinessModule, BUSINESS_MODULE_LABELS } from '@features/users/models/enums';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangePasswordDialogComponent, ChangeEmailDialogComponent } from '@features/users/components';
import { AuthService } from '@features/auth/services';

@Component({
  selector: 'app-users-details-page',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    ButtonModule,
    CheckboxModule,
    FormsModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    ChangePasswordDialogComponent,
    ChangeEmailDialogComponent,
  ],
  templateUrl: './users-details-page.component.html',
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersDetailsPageComponent implements OnInit {
  private service = inject(UserApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  readonly authService = inject(AuthService);

  user = signal<UserDetails | null>(null);
  loading = signal(false);
  savingPermissions = signal(false);
  showChangePasswordDialog = signal(false);
  showChangeEmailDialog = signal(false);
  selectedModules = signal<BusinessModule[]>([]);

  readonly allModules = [BusinessModule.USERS];
  readonly moduleLabels = BUSINESS_MODULE_LABELS;
  readonly hasNoPermissionsSelected = computed(() => this.selectedModules().length === 0);
  readonly moduleSelectionMap = computed(() => {
    const selected = this.selectedModules();
    return new Map(this.allModules.map((m) => [m, selected.includes(m)]));
  });

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
        this.selectedModules.set([...(user.modulePermissions ?? [])]);
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
      message: `¿Está seguro de que desea eliminar el usuario "${userToDelete.userName}"?`,
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

  onEmailChanged(newEmail: string): void {
    this.user.update((u) => (u ? { ...u, email: newEmail } : null));
  }

  onSavePermissions(): void {
    const userId = this.user()?.id;
    if (!userId) return;
    if (this.selectedModules().length === 0) return;

    this.savingPermissions.set(true);
    this.service.updateModulePermissions(userId, this.selectedModules()).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.savingPermissions.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Permisos de módulo actualizados correctamente',
          life: 3000,
        });
      },
      error: () => {
        this.savingPermissions.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar los permisos. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  isModuleSelected(module: BusinessModule): boolean {
    return this.selectedModules().includes(module);
  }

  toggleModule(module: BusinessModule): void {
    this.selectedModules.update((current) =>
      current.includes(module)
        ? current.filter((m) => m !== module)
        : [...current, module],
    );
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }

  getInitials(): string {
    const userName = this.user()?.userName || '';
    return userName.charAt(0).toUpperCase();
  }
}
