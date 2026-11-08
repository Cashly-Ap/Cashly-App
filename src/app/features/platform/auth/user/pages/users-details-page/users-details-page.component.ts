import { provideTranslatedConfirmation } from '@core/i18n/translated-feedback.service';
import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';
import { UserAvatarComponent } from '@shared/components/ui/user-avatar/user-avatar.component';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DetailActionsMenuComponent } from '@shared/components/details/detail-actions-menu/detail-actions-menu.component';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { DetailsInfoFieldComponent } from '@shared/components/details/details-info-field/details-info-field.component';
import { DetailsInfoGridComponent } from '@shared/components/details/details-info-grid/details-info-grid.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import {
  getUserTypeLabel,
  UserType,
} from '@features/platform/auth/user/models/enums/user-type.enum';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangePasswordDialogComponent } from '@features/platform/auth/user/components/change-password-dialog/change-password-dialog.component';
import { ChangeEmailDialogComponent } from '@features/platform/auth/user/components/change-email-dialog/change-email-dialog.component';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
@Component({
  selector: 'app-users-details-page',
  standalone: true,
  imports: [
    BackButtonComponent,
    PanelCardComponent,
    TranslatePipe,
    UserAvatarComponent,
    PermissionDirective,
    CommonModule,
    ButtonModule,
    DetailActionsMenuComponent,
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
  providers: [provideTranslatedConfirmation()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersDetailsPageComponent implements OnInit {
  private readonly translations = inject(TranslationService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private service = inject(UserApplicationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly deletion = inject(DeleteDialogService);

  user = signal<UserDetails | null>(null);
  loading = signal(false);
  showChangePasswordDialog = signal(false);
  showChangeEmailDialog = signal(false);

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
          summary: this.translations.t('users.profile.error'),
          detail: 'Error al cargar el usuario. Es posible que no exista.',
          life: 5000,
        });
        this.router.navigate(['/platform/users']);
      },
    });
  }

  onEdit(): void {
    const id = this.user()?.id;
    if (id) {
      this.router.navigate(['/platform/users', id, 'edit']);
    }
  }

  onDelete(): void {
    const item = this.user();
    if (!item) return;
    this.deletion.open('users', item.id, item.userName, () =>
      this.router.navigate(['/platform/users']),
    );
  }

  onBack(): void {
    this.navigationHistory.back(['/platform/users']);
  }

  onEmailChanged(newEmail: string): void {
    this.user.update((u) => (u ? { ...u, email: newEmail } : null));
  }

  getTypeLabel(type: UserType): string {
    return getUserTypeLabel(type);
  }
}
