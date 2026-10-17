import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormContainerComponent, FormCardComponent } from '@core/forms/components/cards';
import { FormHeaderComponent, FormActionsComponent } from '@core/forms/components/headers';
import { TextInputComponent } from '@core/forms/components/inputs';
import { AuthValidators } from '@features/platform/auth/validators/auth-validators';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { AUTH_SUCCESS_MESSAGES } from '@features/platform/auth/messages/success-messages';
import { AUTH_ERROR_MESSAGES } from '@features/platform/auth/messages/error-messages';
import { createPasswordForm } from '@features/platform/auth/pages/change-password/change-password-page.config';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormContainerComponent,
    FormCardComponent,
    FormHeaderComponent,
    FormActionsComponent,
    TextInputComponent,
  ],
  templateUrl: './change-password-page.component.html',
})
export class ChangePasswordPageComponent {
  private router = inject(Router);
  protected authService = inject(AuthService);
  private messageService = inject(MessageService);

  form: FormGroup = createPasswordForm();

  protected control(field: string): AbstractControl | null {
    return this.form.get(field);
  }

  protected asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  onSubmit(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const newPassword = this.form.value.newPassword!;

    this.authService.changePassword({ newPassword }).subscribe({
      next: () => {
        this.messageService.add(AUTH_SUCCESS_MESSAGES.passwordChanged);
        this.form.reset();
        this.router.navigate(['/auth/configuration']);
      },
      error: () => this.messageService.add(AUTH_ERROR_MESSAGES.changePassword),
    });
  }

  onCancel(): void {
    this.router.navigate(['/auth/configuration']);
  }

  getPasswordError(): string {
    return AuthValidators.getPasswordErrorMessage(this.form.controls['newPassword'].errors);
  }

  getConfirmPasswordError(): string {
    const control = this.form.controls['confirmPassword'];
    if (control.touched && control.hasError('required')) {
      return 'La confirmación de contraseña es requerida';
    }
    if (this.form.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}
