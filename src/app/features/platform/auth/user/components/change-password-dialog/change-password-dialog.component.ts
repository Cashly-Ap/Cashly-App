import { Component, inject, input, output, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserValidators } from '@features/platform/auth/user/validators/user.validators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, DialogModule, ButtonModule, PasswordModule],
  templateUrl: './change-password-dialog.component.html',
})
export class ChangePasswordDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UserApplicationService);
  private messageService = inject(MessageService);

  userId = input.required<string>();
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  changed = output<void>();

  loading = this.service.loading;

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, UserValidators.passwordStrength()]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  private passwordsMatchValidator(group: AbstractControl): Record<string, boolean> | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.service.changePassword(this.userId(), this.form.value.password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Contraseña actualizada exitosamente',
          life: 3000,
        });
        this.form.reset();
        this.visibleChange.emit(false);
        this.changed.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la contraseña. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.form.reset();
    this.visibleChange.emit(false);
  }

  getPasswordError(): string {
    const errors = this.form.get('password')?.errors;
    if (!errors) return '';
    return UserValidators.getPasswordErrorMessage(errors);
  }
}
