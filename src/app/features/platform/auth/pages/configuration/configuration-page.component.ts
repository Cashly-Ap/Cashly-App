import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { UserAvatarComponent } from '@shared/components/ui/user-avatar/user-avatar.component';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { SelfProfileService } from '@features/platform/auth/services/api/self-profile.service';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { PERMISSION_CATALOG } from '@features/platform/auth/permissions/permission-catalog';
import { normalizePermissions } from '@features/platform/auth/authorization/models/legacy-permission';
import { CatalogArea } from '@features/platform/auth/permissions/permission-catalog.types';
import {
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
} from '@shared/components/details';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '@shared/components/ui/status-badge/status-badge.component';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-configuration-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    UserAvatarComponent,
    CommonModule,
    ButtonModule,
    PageHeaderComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    StatusBadgeComponent,
    TextBadgeComponent,
  ],
  templateUrl: './configuration-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationPageComponent {
  private readonly translations = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly profiles = inject(SelfProfileService);
  private readonly destroyRef = inject(DestroyRef);
  readonly profile = signal<UserDetails | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly accessLoading = signal(false);
  readonly accessError = signal(false);
  readonly access = this.authService.currentAccess;
  readonly fullName = computed(() => {
    const user = this.profile();
    return (
      [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
      user?.userName ||
      this.translations.t('auth.profile.my.account')
    );
  });
  readonly initials = computed(() =>
    this.fullName()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase(),
  );
  readonly modules = computed(() => {
    const selected = new Set(normalizePermissions(this.access()?.permissions));
    const areas = PERMISSION_CATALOG as readonly CatalogArea[];
    return areas
      .flatMap((area) => area.sections.flatMap((section) => section.modules))
      .map((module) => ({
        id: module.moduleKey,
        label: module.moduleKey,
        actions: module.permissions
          .filter((permission) => selected.has(permission.code))
          .map((permission) => permission.labelKey),
      }))
      .filter((module) => module.actions.length > 0);
  });

  constructor() {
    this.loadProfile();
    this.loadAccess();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set(false);
    this.profiles
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  loadAccess(): void {
    this.accessLoading.set(true);
    this.accessError.set(false);
    this.authService
      .ensureAccess()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.accessLoading.set(false);
          this.accessError.set(!this.access());
        },
        error: () => {
          this.accessError.set(true);
          this.accessLoading.set(false);
        },
      });
  }

  display(value: string | null | undefined): string {
    return value?.trim() || this.translations.t('auth.profile.not.provided');
  }
  onEditName(): void {
    void this.router.navigate(['/platform/auth/change-username']);
  }
  onChangePassword(): void {
    void this.router.navigate(['/platform/auth/change-password']);
  }
}
