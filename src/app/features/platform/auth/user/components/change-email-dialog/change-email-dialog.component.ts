import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { Component, inject, input, output, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextInputComponent } from '@core/forms/components';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';
import { MessageService } from 'primeng/api';

function emailsMatch(group: AbstractControl): ValidationErrors | null {
  const email = group.get('email')?.value;
  const confirm = group.get('confirmEmail')?.value;
  return email && confirm && email !== confirm ? { emailsMismatch: true } : null;
}

@Component({
  selector: 'app-change-email-dialog',
  standalone: true,
  imports: [ShortcutDirective, ReactiveFormsModule, DialogModule, ButtonModule, TextInputComponent],
  templateUrl: './change-email-dialog.component.html',
})
export class ChangeEmailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(UserApplicationService);
  private messageService = inject(MessageService);

  userId = input.required<string>();
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  changed = output<string>();

  loading = this.service.loading;

  form!: FormGroup;

  get emailControl() {
    return this.form.get('email') as import('@angular/forms').FormControl;
  }
  get confirmEmailControl() {
    return this.form.get('confirmEmail') as import('@angular/forms').FormControl;
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required, Validators.email]],
      },
      { validators: emailsMatch },
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email;

    this.service.changeEmail(this.userId(), email).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Correo electrónico actualizado exitosamente',
          life: 3000,
        });
        this.form.reset();
        this.visibleChange.emit(false);
        this.changed.emit(email);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar el correo electrónico. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancel(): void {
    this.form.reset();
    this.visibleChange.emit(false);
  }

  getEmailError(): string {
    const errors = this.form.get('email')?.errors;
    if (errors?.['required']) return 'El correo electrónico es requerido';
    if (errors?.['email']) return 'El formato del correo electrónico es inválido';
    return '';
  }

  getConfirmEmailError(): string {
    const controlErrors = this.form.get('confirmEmail')?.errors;
    if (controlErrors?.['required']) return 'La confirmación del correo es requerida';
    if (controlErrors?.['email']) return 'El formato del correo electrónico es inválido';
    if (this.form.errors?.['emailsMismatch']) return 'Los correos electrónicos no coinciden';
    return '';
  }
}
