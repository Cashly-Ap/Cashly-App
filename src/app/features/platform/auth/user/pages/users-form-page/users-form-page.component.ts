import { TranslationService } from '@core/i18n/translation.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Language } from '@core/i18n/language';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { computed } from '@angular/core';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';
import { switchMap, of, catchError, finalize, map } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TabsModule } from 'primeng/tabs';
import { UserValidators } from '@features/platform/auth/user/validators/user.validators';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import {
  TabContentComponent,
  FormContainerComponent,
  FormHeaderComponent,
  FormActionsComponent,
  FileInputComponent,
  TextInputComponent,
  SelectInputComponent,
  CountryInputComponent,
} from '@core/forms/components';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';
import { UserProfile, SelectionOption } from '@features/platform/auth/authorization/models/access.model';
interface UserFormData extends UserProfile {
  language: Language;
  email: string;
  password: string;
  userName: string;
  active: boolean;
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
@Component({
  selector: 'app-users-form-page',
  standalone: true,
  imports: [
    PanelCardComponent,
    TranslatePipe,
    TabsModule,
    ReactiveFormsModule,
    ToggleSwitchModule,
    TabContentComponent,
    FormContainerComponent,
    FormHeaderComponent,
    FormActionsComponent,
    FileInputComponent,
    TextInputComponent,
    SelectInputComponent,
    CountryInputComponent,
  ],
  templateUrl: './users-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFormPageComponent extends BaseFormComponent<UserFormData> {
  private readonly translations = inject(TranslationService);
  private readonly service = inject(UserApplicationService);
  private readonly management = inject(AccessManagementService);
  private readonly messages = inject(MessageService);
  private readonly photos = inject(UserPhotoService);
  private readonly auth = inject(AuthService);
  private readonly preferences = inject(UserPreferencesService);
  readonly languages = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
  ];
  readonly canManagePhoto = computed(() => this.auth.hasPermission(BusinessModule.USERS, 'UPDATE'));
  private readonly photoDestroy = inject(DestroyRef);
  readonly photo = new FormControl<File | null>(null);
  readonly photoUrl = signal<string | null>(null);
  readonly removePhoto = signal(false);
  readonly savingPhoto = signal(false);
  readonly loading = this.service.loading;
  constructor() {
    super();
    this.photoDestroy.onDestroy(() => {
      const url = this.photoUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }
  readonly roles = signal<{ label: string; value: string }[]>([]);
  readonly departments = signal<{ label: string; value: string }[]>([]);
  readonly activeTab = signal('general');
  readonly addressFields = [
    { key: 'street', label: 'Dirección' },
    { key: 'city', label: 'Ciudad' },
    { key: 'region', label: 'Provincia' },
    { key: 'country', label: 'País' },
    { key: 'postalCode', label: 'Código postal' },
  ];
  override ngOnInit(): void {
    super.ngOnInit();
    const options = (items: SelectionOption[]) =>
      items.map((item) => ({ label: item.name, value: item.id }));
    this.management.roleOptions().subscribe({
      next: (items) => this.roles.set(options(items)),
      error: () => this.selectionError(),
    });
    this.management.departmentOptions().subscribe({
      next: (items) => this.departments.set(options(items)),
      error: () => this.selectionError(),
    });
  }
  private selectionError(): void {
    this.messages.add({
      severity: 'error',
      summary: this.translations.t('users.profile.error'),
      detail: this.translations.t('users.profile.could.not.load.available.roles.or.departments'),
    });
  }
  control(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }
  getConfig(): FormConfig {
    return {
      entityDisplayName: this.translations.t('users.profile.user'),
      entityArticle: 'del',
      module: 'users',
      routeBase: '/platform/users',
    };
  }
  createForm(): FormGroup {
    return this.fb.group({
      language: ['es', [Validators.required, Validators.pattern(/^(es|en)$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        this.isCreateMode() ? [Validators.required, UserValidators.passwordStrength()] : [],
      ],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      firstName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      roleId: ['', Validators.required],
      departmentId: ['', Validators.required],
      active: [true],
      phone: ['', UserValidators.phoneNumber()],
      street: ['', Validators.maxLength(200)],
      city: ['', Validators.maxLength(100)],
      region: ['', Validators.maxLength(100)],
      country: ['', Validators.maxLength(100)],
      postalCode: ['', Validators.maxLength(20)],
    });
  }
  protected override restoreFormData(data: UserFormData): void {
    this.form.patchValue(data);
  }
  protected override getPendingTabTitle(data: UserFormData): string {
    return data.userName?.trim() || super.getPendingTabTitle(data);
  }
  protected override onLoadEntity(id: string): void {
    this.service.loadUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({ ...user, ...user.address, language: user.language ?? 'es' });
        if (user.photoPath)
          this.photos
            .get(id)
            .pipe(takeUntilDestroyed(this.photoDestroy))
            .subscribe({
              next: (blob) => {
                const old = this.photoUrl();
                if (old) URL.revokeObjectURL(old);
                this.photoUrl.set(URL.createObjectURL(blob));
              },
              error: () => undefined,
            });
        this.control('password').clearValidators();
        this.control('password').updateValueAndValidity();
      },
      error: () =>
        this.messages.add({
          severity: 'error',
          summary: this.translations.t('users.profile.error'),
          detail: this.translations.t('users.profile.could.not.load.the.user'),
        }),
    });
  }
  private firstInvalidTab(): string {
    if (
      ['firstName', 'lastName', 'userName', 'email', 'password', 'language'].some(
        (key) => this.control(key).invalid,
      )
    )
      return 'general';
    if (['roleId', 'departmentId'].some((key) => this.control(key).invalid)) return 'access';
    return 'contact';
  }
  override onSubmit(): void {
    if (this.loading() || this.savingPhoto()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab.set(this.firstInvalidTab());
      return;
    }
    const v = this.form.getRawValue();
    const address = {
      street: (v.street ?? '').trim() || null,
      city: (v.city ?? '').trim() || null,
      region: (v.region ?? '').trim() || null,
      country: (v.country ?? '').trim() || null,
      postalCode: (v.postalCode ?? '').trim() || null,
    };
    const phone = (v.phone ?? '').replace(/[\s().-]/g, '') || null;
    const data = {
      email: v.email,
      userName: v.userName.trim(),
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      roleId: v.roleId,
      departmentId: v.departmentId,
      active: v.active,
      address: Object.values(address).some(Boolean) ? address : null,
      phone,
    };
    const request = this.isEditMode()
      ? this.service.updateUser(this.entityId()!, {
          language: v.language,
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phone: data.phone,
          roleId: data.roleId,
          departmentId: data.departmentId,
          active: data.active,
        })
      : this.service.createUser({
          email: data.email,
          language: v.language,
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phone: data.phone,
          roleId: data.roleId,
          departmentId: data.departmentId,
          password: v.password,
        });
    let photoFailed = false;
    this.savingPhoto.set(true);
    request
      .pipe(
        switchMap((user) =>
          (this.photo.value
            ? this.photos.upload(this.photo.value, user.id)
            : this.removePhoto()
              ? this.photos.remove(user.id)
              : of(user)
          ).pipe(
            catchError(() => {
              photoFailed = true;
              return of(user);
            }),
            map(() => user),
          ),
        ),
        finalize(() => this.savingPhoto.set(false)),
        takeUntilDestroyed(this.photoDestroy),
      )
      .subscribe({
        next: (user) => {
          if (user.id === this.auth.currentUser()?.id)
            this.preferences.syncLanguage(user.language ?? v.language);
          this.markAsSubmitted();
          this.messages.add({
            severity: photoFailed ? 'warn' : 'success',
            summary: photoFailed
              ? this.translations.t('users.profile.user.saved.without.photo')
              : this.translations.t('users.profile.saved'),
            detail: photoFailed
              ? this.translations.t(
                  'users.profile.the.user.was.saved.edit.their.profile.to.upload.the.photo.again',
                )
              : this.translations.t('users.profile.user.saved.successfully'),
          });
          this.router.navigate(['/platform/users', user.id]);
        },
        error: (error) =>
          this.messages.add({
            severity: 'error',
            summary: this.translations.t('users.profile.error'),
            detail:
              error.error?.message ??
              this.translations.t(
                'users.profile.could.not.save.check.that.the.role.and.department.are.still.available',
              ),
          }),
      });
  }
}
