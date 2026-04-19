import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import {
  FormContainerComponent,
  FormHeaderComponent,
  FormCardComponent,
  FormActionsComponent,
} from '@core/forms/components';
import { UserApplicationService } from '@features/users/services/application';
import { UserType, USER_TYPES } from '@features/users/models/enums';
import { UserValidators } from '@features/users/validators';
import { ChangePasswordDialogComponent, ChangeEmailDialogComponent } from '@features/users/components';

@Component({
  selector: 'app-users-form-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    InputTextModule,
    PasswordModule,
    SelectModule,
    SelectButtonModule,
    ButtonModule,
    FormContainerComponent,
    FormHeaderComponent,
    FormCardComponent,
    FormActionsComponent,
    ChangePasswordDialogComponent,
    ChangeEmailDialogComponent,
  ],
  templateUrl: './users-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFormPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(UserApplicationService);
  private messageService = inject(MessageService);

  loading = this.service.loading;
  isEditMode = signal(false);
  userId = signal<string | null>(null);

  showChangePasswordDialog = signal(false);
  showChangeEmailDialog = signal(false);

  title = computed(() => (this.isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario'));
  subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualice la información del usuario'
      : 'Complete la información del nuevo usuario',
  );
  submitLabel = computed(() => (this.isEditMode() ? 'Actualizar' : 'Crear'));

  userTypes = [...USER_TYPES];

  activeOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', this.isEditMode() ? [] : [Validators.required, UserValidators.passwordStrength()]],
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    role: ['', Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  private loadUser(id: string): void {
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

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      if (this.isEditMode() && this.userId()) {
        const editData = {
          id: this.userId()!,
          email: formValue.email,
          userName: formValue.userName,
          role: formValue.role,
          active: formValue.active,
        };

        this.service.updateUser(this.userId()!, editData).subscribe({
          next: () => {
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

        this.service.createUser(createData).subscribe({
          next: () => {
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

  onCancel(): void {
    this.router.navigate(['/users']);
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
