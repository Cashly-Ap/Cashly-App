import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Language } from '@core/i18n/language';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { switchMap, of, finalize, tap } from 'rxjs';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
  FileInputComponent,
  CountryInputComponent,
  SelectInputComponent,
  TextInputComponent,
  TabContentComponent,
} from '@core/forms/components';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { SelfProfileService } from '@features/platform/auth/services/api/self-profile.service';
import { ChangeEmailDialogComponent } from '@features/platform/auth/user/components/change-email-dialog/change-email-dialog.component';
import { ChangePasswordDialogComponent } from '@features/platform/auth/user/components/change-password-dialog/change-password-dialog.component';
import { createUserNameForm } from '@features/platform/auth/pages/change-username/change-username-page.config';

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-change-username-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    ReactiveFormsModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    FileInputComponent,
    CountryInputComponent,
    SelectInputComponent,
    TextInputComponent,
    TabContentComponent,
    TabsModule,
    ButtonModule,
    ChangeEmailDialogComponent,
    ChangePasswordDialogComponent,
  ],
  templateUrl: './change-username-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeUsernamePageComponent {
  private readonly translations = inject(TranslationService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(SelfProfileService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly photos = inject(UserPhotoService);
  private readonly preferences = inject(UserPreferencesService);
  readonly languages = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
  ];
  readonly photo = new FormControl<File | null>(null);
  readonly photoUrl = signal<string | null>(null);
  readonly removePhoto = signal(false);
  readonly account = signal<{ id: string; email: string } | null>(null);
  readonly showEmailDialog = signal(false);
  readonly showPasswordDialog = signal(false);
  readonly form = createUserNameForm();
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal(false);
  readonly activeTab = signal('general');
  readonly addressFields = [
    { key: 'street', label: 'Calle y número' },
    { key: 'city', label: 'Ciudad' },
    { key: 'region', label: 'Provincia o región' },
    { key: 'country', label: 'País' },
    { key: 'postalCode', label: 'Código postal' },
  ];
  constructor() {
    this.destroyRef.onDestroy(() => {
      const url = this.photoUrl();
      if (url) URL.revokeObjectURL(url);
    });
    this.loadProfile();
  }
  control(field: string): FormControl {
    return this.form.get(field) as FormControl;
  }
  loadProfile(): void {
    this.loading.set(true);
    this.error.set(false);
    this.profiles
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.auth.syncProfilePhoto(user.photoPath ?? null);
          this.account.set({ id: user.id, email: user.email });
          if (user.photoPath)
            this.photos
              .get()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (blob) => {
                  const old = this.photoUrl();
                  if (old) URL.revokeObjectURL(old);
                  this.photoUrl.set(URL.createObjectURL(blob));
                },
                error: () => undefined,
              });
          this.form.patchValue({
            language: user.language ?? 'es',
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            email: user.email,
            phone: user.phone,
            street: user.address?.street ?? '',
            city: user.address?.city ?? '',
            region: user.address?.region ?? '',
            country: user.address?.country ?? '',
            postalCode: user.address?.postalCode ?? '',
          });
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
  onSubmit(): void {
    if (this.loading() || this.error() || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab.set(
        ['firstName', 'lastName', 'userName', 'language'].some(
          (field) => this.control(field).invalid,
        )
          ? 'general'
          : 'contact',
      );
      return;
    }
    const data = this.form.getRawValue();
    const optional = (value: string | null) => value?.trim() || null;
    const address = {
      street: optional(data.street),
      city: optional(data.city),
      region: optional(data.region),
      country: optional(data.country),
      postalCode: optional(data.postalCode),
    };
    this.saving.set(true);
    this.profiles
      .updateProfile({
        language: data.language as Language,
        userName: data.userName!.trim(),
        firstName: data.firstName!.trim(),
        lastName: data.lastName!.trim(),
        phone: data.phone?.replace(/[\s().-]/g, '') || null,
        address: Object.values(address).some(Boolean) ? address : null,
      })
      .pipe(
        tap((profile) => {
          this.auth.syncProfileDisplay(profile.userName);
          this.preferences.syncLanguage(profile.language ?? (data.language as Language));
        }),
        switchMap((profile) =>
          this.photo.value
            ? this.photos.upload(this.photo.value)
            : this.removePhoto()
              ? this.photos.remove()
              : of(profile),
        ),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (profile) => {
          this.saving.set(false);
          this.auth.syncProfileDisplay(profile.userName);
          this.messages.add({
            severity: 'success',
            summary: this.translations.t('auth.profile.profile.updated'),
            detail: this.translations.t('auth.profile.your.details.have.been.saved.successfully'),
          });
          void this.router.navigate(['/platform/auth/configuration']);
        },
        error: () => {
          this.saving.set(false);
          this.messages.add({
            severity: 'error',
            summary: this.translations.t('auth.profile.could.not.save'),
            detail: this.translations.t('auth.profile.check.your.details.and.try.again'),
          });
        },
      });
  }
  onCancel(): void {
    if (!this.saving()) this.navigationHistory.back(['/platform/auth/configuration']);
  }

  onEmailChanged(email: string): void {
    this.account.update((account) => (account ? { ...account, email } : account));
    this.form.patchValue({ email });
    this.loadProfile();
  }
}
