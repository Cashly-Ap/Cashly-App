import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
  TextInputComponent,
  SelectInputComponent,
} from '@core/forms/components';
import { UserApplicationService } from '@features/users/services/application';
import { UserType, USER_TYPES, BusinessModule, BUSINESS_MODULE_LABELS } from '@features/users/models/enums';
import { UserValidators } from '@features/users/validators';
import { ChangePasswordDialogComponent, ChangeEmailDialogComponent } from '@features/users/components';
import { BaseFormComponent, FormConfig } from '@core/forms/base/base-form.component';
import { AuthService } from '@features/auth/services';
import { forkJoin, of, switchMap } from 'rxjs';

interface UserFormData {
  email: string;
  password: string;
  userName: string;
  role: UserType | string;
  active: boolean;
}

@Component({
  selector: 'app-users-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MainLayoutComponent,
    ButtonModule,
    CheckboxModule,
    TabsModule,
    ToggleSwitchModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    TextInputComponent,
    SelectInputComponent,
    ChangePasswordDialogComponent,
    ChangeEmailDialogComponent,
  ],
  templateUrl: './users-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class UsersFormPageComponent extends BaseFormComponent<UserFormData> {
  private service = inject(UserApplicationService);
  private messageService = inject(MessageService);
  readonly authService = inject(AuthService);

  loading = this.service.loading;

  submitTooltip = signal('');

  private readonly FIELD_LABELS: Record<string, string> = {
    email: 'Correo electrónico',
    password: 'Contraseña',
    userName: 'Nombre de usuario',
    role: 'Rol',
  };

  override ngOnInit(): void {
    super.ngOnInit?.();
    this.form.statusChanges.subscribe(() => this.updateSubmitTooltip());
    this.updateSubmitTooltip();
  }

  private updateSubmitTooltip(): void {
    const invalid = Object.entries(this.FIELD_LABELS)
      .filter(([key]) => this.form.get(key)?.invalid)
      .map(([, label]) => label);
    this.submitTooltip.set(invalid.length ? `Campos requeridos: ${invalid.join(', ')}` : '');
  }

  showChangePasswordDialog = signal(false);
  showChangeEmailDialog = signal(false);
  selectedModules = signal<BusinessModule[]>([]);

  readonly allModules = Object.values(BusinessModule);
  readonly moduleLabels = BUSINESS_MODULE_LABELS;

  userTypes = [...USER_TYPES];

  get emailControl(): FormControl { return this.form.get('email') as FormControl; }
  get passwordControl(): FormControl { return this.form.get('password') as FormControl; }
  get userNameControl(): FormControl { return this.form.get('userName') as FormControl; }
  get roleControl(): FormControl { return this.form.get('role') as FormControl; }
  get activeControl(): FormControl { return this.form.get('active') as FormControl; }

  getConfig(): FormConfig {
    return {
      entityDisplayName: 'Usuario',
      entityArticle: 'del',
      module: 'users',
      routeBase: '/users',
    };
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isCreateMode() ? [Validators.required, UserValidators.passwordStrength()] : []],
      userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      role: ['', Validators.required],
      active: [true],
    });
  }

  protected override getPendingTabTitle(formData: UserFormData): string {
    return formData.userName?.trim() || super.getPendingTabTitle(formData);
  }

  protected override restoreFormData(data: UserFormData): void {
    this.form.patchValue({
      email: data.email,
      userName: data.userName,
      role: data.role,
      active: data.active,
    });
  }

  protected override onLoadEntity(id: string): void {
    this.service.loadUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          email: user.email,
          userName: user.userName,
          role: user.role,
          active: user.active,
        });
        this.form.get('password')?.setValidators([]);
        this.form.get('password')?.updateValueAndValidity();
        this.selectedModules.set([...(user.modulePermissions ?? [])]);
      },
      error: () => {
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

  override onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      if (this.isEditMode() && this.entityId()) {
        const editData = {
          id: this.entityId()!,
          email: formValue.email,
          userName: formValue.userName,
          role: formValue.role,
          active: formValue.active,
        };

        const updateUser$ = this.service.updateUser(this.entityId()!, editData);
        const updatePermissions$ = this.authService.isSuperAdmin()
          ? this.service.updateModulePermissions(this.entityId()!, this.selectedModules())
          : of(null);

        forkJoin([updateUser$, updatePermissions$]).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/users']);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el usuario. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      } else {
        const createData = {
          email: formValue.email,
          password: formValue.password,
          userName: formValue.userName,
          role: formValue.role,
          active: formValue.active,
        };

        this.service.createUser(createData).pipe(
          switchMap((createdUser) => {
            if (this.authService.isSuperAdmin() && this.selectedModules().length > 0) {
              return this.service.updateModulePermissions(createdUser.id, this.selectedModules());
            }
            return of(null);
          }),
        ).subscribe({
          next: () => {
            this.markAsSubmitted();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado exitosamente',
              life: 3000,
            });
            this.router.navigate(['/users']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || 'Error al crear el usuario. Por favor, intente nuevamente.',
              life: 5000,
            });
          },
        });
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor, complete todos los campos requeridos correctamente',
        life: 5000,
      });
    }
  }

  toggleModule(module: BusinessModule): void {
    this.selectedModules.update((current) =>
      current.includes(module)
        ? current.filter((m) => m !== module)
        : [...current, module],
    );
  }

  isModuleSelected(module: BusinessModule): boolean {
    return this.selectedModules().includes(module);
  }

  onEmailChanged(newEmail: string): void {
    this.form.patchValue({ email: newEmail });
  }

  getEmailError(): string {
    const errors = this.form.get('email')?.errors;
    if (errors?.['required']) return 'El correo electrónico es requerido';
    if (errors?.['email']) return 'El formato del correo electrónico es inválido';
    return '';
  }

  getPasswordError(): string {
    const errors = this.form.get('password')?.errors;
    if (!errors) return '';
    return UserValidators.getPasswordErrorMessage(errors);
  }

  getUserNameError(): string {
    const errors = this.form.get('userName')?.errors;
    if (errors?.['required']) return 'El nombre de usuario es requerido';
    if (errors?.['minlength']) return 'El nombre debe tener al menos 3 caracteres';
    if (errors?.['maxlength']) return 'El nombre debe tener como máximo 100 caracteres';
    return '';
  }
}
