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
import { MessageService } from 'primeng/api';

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';

function normalized(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function buildValidator(expectedCurrentEmail: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const currentEmail = normalized(group.get('currentEmail')?.value);
    const email = normalized(group.get('email')?.value);
    const confirmEmail = normalized(group.get('confirmEmail')?.value);
    const errors: ValidationErrors = {};

    if (expectedCurrentEmail && currentEmail && currentEmail !== expectedCurrentEmail) {
      errors['currentEmailMismatch'] = true;
    }
    if (email && confirmEmail && email !== confirmEmail) {
      errors['emailsMismatch'] = true;
    }
    if (email && currentEmail && email === currentEmail) {
      errors['emailUnchanged'] = true;
    }
    return Object.keys(errors).length ? errors : null;
  };
}

@Component({
  selector: 'app-change-email-dialog',
  standalone: true,
  imports: [
    SubmitButtonComponent,
    CancelButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    DialogModule,
    TextInputComponent,
  ],
  templateUrl: './change-email-dialog.component.html',
})
export class ChangeEmailDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserApplicationService);
  private readonly messageService = inject(MessageService);

  userId = input.required<string>();
  currentEmail = input<string>('');
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  changed = output<string>();

  loading = this.service.loading;
  form!: FormGroup;

  get currentEmailControl(): FormControl {
    return this.form.get('currentEmail') as FormControl;
  }
  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }
  get confirmEmailControl(): FormControl {
    return this.form.get('confirmEmail') as FormControl;
  }

  ngOnInit(): void {
    const expected = normalized(this.currentEmail());
    this.form = this.fb.group(
      {
        currentEmail: [this.currentEmail(), [Validators.required, Validators.email]],
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]],
      },
      { validators: buildValidator(expected) },
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.service
      .changeEmail(this.userId(), value.email.trim(), value.currentEmail.trim())
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'OK',
            detail: 'platform.auth.user.emailUpdatedSuccessfully',
            life: 3000,
          });
          this.changed.emit(value.email.trim());
          this.resetForm();
          this.visibleChange.emit(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'platform.auth.user.couldNotUpdateTheEmailAddressPleaseTryAgain',
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
    this.form.reset({
      currentEmail: this.currentEmail(),
      email: '',
      confirmEmail: '',
    });
  }

  currentEmailError(): string {
    if (!this.currentEmailControl.touched) return '';
    if (this.currentEmailControl.hasError('required')) {
      return 'platform.auth.anEmailAddressIsRequired';
    }
    if (this.currentEmailControl.hasError('email')) {
      return 'platform.auth.theEmailAddressFormatIsInvalid';
    }
    if (this.form.hasError('currentEmailMismatch')) {
      return 'platform.auth.user.theCurrentEmailDoesNotMatch';
    }
    return '';
  }

  emailError(): string {
    if (!this.emailControl.touched) return '';
    if (this.emailControl.hasError('required')) {
      return 'platform.auth.anEmailAddressIsRequired';
    }
    if (this.emailControl.hasError('email')) {
      return 'platform.auth.theEmailAddressFormatIsInvalid';
    }
    if (this.form.hasError('emailUnchanged')) {
      return 'platform.auth.user.theNewEmailMustBeDifferent';
    }
    return '';
  }

  confirmEmailError(): string {
    if (!this.confirmEmailControl.touched) return '';
    if (this.confirmEmailControl.hasError('required')) {
      return 'platform.auth.emailConfirmationIsRequired';
    }
    if (this.confirmEmailControl.hasError('email')) {
      return 'platform.auth.theEmailAddressFormatIsInvalid';
    }
    if (this.form.hasError('emailsMismatch')) {
      return 'platform.auth.theEmailAddressesDoNotMatch';
    }
    return '';
  }
}
