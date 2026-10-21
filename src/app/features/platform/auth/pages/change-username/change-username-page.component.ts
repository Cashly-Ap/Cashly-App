import { switchMap, of, finalize, tap } from 'rxjs';
import { UserPhotoService } from '../../services/api/user-photo.service';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import {
  FormContainerComponent,
  FormCardComponent,
  FormHeaderComponent,
  FormActionsComponent,
  FileInputComponent,
  CountryInputComponent,
  TextInputComponent,
  TabContentComponent,
} from '@core/forms/components';
import { AuthService } from '../../services/application/auth-application.service';
import { SelfProfileService } from '../../services/api/self-profile.service';
import { createUserNameForm } from './change-username-page.config';

@Component({
  selector: 'app-change-username-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormContainerComponent,
    FormCardComponent,
    FormHeaderComponent,
    FormActionsComponent,
    FileInputComponent,
    CountryInputComponent,
    TextInputComponent,
    TabContentComponent,
    TabsModule,
    ButtonModule,
  ],
  templateUrl: './change-username-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeUsernamePageComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(SelfProfileService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly photos = inject(UserPhotoService);
  readonly photo = new FormControl<File | null>(null);
  readonly photoUrl = signal<string | null>(null);
  readonly removePhoto = signal(false);
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
        ['firstName', 'lastName', 'userName'].some((field) => this.control(field).invalid)
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
        userName: data.userName!.trim(),
        firstName: data.firstName!.trim(),
        lastName: data.lastName!.trim(),
        phone: data.phone?.replace(/[\s().-]/g, '') || null,
        address: Object.values(address).some(Boolean) ? address : null,
      })
      .pipe(
        tap((profile) => this.auth.syncProfileDisplay(profile.userName)),
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
            summary: 'Perfil actualizado',
            detail: 'Tus datos se han guardado correctamente',
          });
          void this.router.navigate(['/platform/auth/configuration']);
        },
        error: () => {
          this.saving.set(false);
          this.messages.add({
            severity: 'error',
            summary: 'No se pudo guardar',
            detail: 'Revisa los datos e inténtalo de nuevo',
          });
        },
      });
  }
  onCancel(): void {
    if (!this.saving()) void this.router.navigate(['/platform/auth/configuration']);
  }
}
