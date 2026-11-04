import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, inject, input, output, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '@core/forms/components';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { UserValidators } from '@features/platform/auth/user/validators/user.validators';
import { MessageService } from 'primeng/api';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('confirmPassword')?.value;
  return password && confirmation && password !== confirmation ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    SubmitButtonComponent,
    CancelButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    DialogModule,
    TextInputComponent,
  ],
  templateUrl: './change-password-dialog.component.html',
})
export class ChangePasswordDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserApplicationService);
  private readonly messageService = inject(MessageService);

  userId = input.required<string>();
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  changed = output<void>();

  loading = this.service.loading;
  form!: FormGroup;

  get passwordControl(): FormControl {
    return this.form.get('password') as FormControl;
  }
  get confirmPasswordControl(): FormControl {
    return this.form.get('confirmPassword') as FormControl;
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, UserValidators.passwordStrength()]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordsMatch },
    );
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
          summary: 'OK',
          detail: 'platform.auth.user.passwordUpdatedSuccessfully',
          life: 3000,
        });
        this.resetForm();
        this.visibleChange.emit(false);
        this.changed.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'platform.auth.user.couldNotUpdateThePasswordPleaseTryAgain',
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.resetForm();
    this.visibleChange.emit(false);
  }

  private resetForm(): void {
    this.form.reset();
  }

  passwordError(): string {
    if (!this.passwordControl.touched) return '';
    const errors = this.passwordControl.errors;
    if (!errors) return '';
    if (errors['required']) return 'platform.auth.passwordIsRequired';
    return UserValidators.getPasswordErrorMessage(errors);
  }

  confirmPasswordError(): string {
    if (!this.confirmPasswordControl.touched) return '';
    if (this.confirmPasswordControl.hasError('required')) {
      return 'platform.auth.user.passwordConfirmationIsRequired';
    }
    if (this.form.hasError('passwordsMismatch')) {
      return 'platform.auth.user.passwordsDoNotMatch';
    }
    return '';
  }
}
