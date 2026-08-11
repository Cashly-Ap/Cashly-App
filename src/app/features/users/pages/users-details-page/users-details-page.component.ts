import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { UserApplicationService } from '@features/users/services/application';
import { UserDetails } from '@features/users/models/interfaces';
import { getUserTypeLabel, UserType, BusinessModule, BUSINESS_MODULE_LABELS } from '@features/users/models/enums';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangePasswordDialogComponent, ChangeEmailDialogComponent } from '@features/users/components';

@Component({
  selector: 'app-users-details-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    ChangePasswordDialogComponent,
    ChangeEmailDialogComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './users-details-page.component.html',
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersDetailsPageComponent implements OnInit {
  private service = inject(UserApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  user = signal<UserDetails | null>(null);
  loading = signal(false);
  showChangePasswordDialog = signal(false);
  showChangeEmailDialog = signal(false);

  readonly allModules = Object.values(BusinessModule);
  readonly moduleLabels = BUSINESS_MODULE_LABELS;

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

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEmailChanged(newEmail: string): void {
    this.user.update((u) => (u ? { ...u, email: newEmail } : null));
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }

  isModuleAssigned(module: BusinessModule): boolean {
    return this.user()?.modulePermissions?.includes(module) ?? false;
  }
}
