import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CustomerApplicationService } from '@features/customers/services/application';
import { CUSTOMER_ERROR_MESSAGES, CUSTOMER_SUCCESS_MESSAGES } from '@features/customers/messages';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 100;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

@Component({
  selector: 'app-change-portal-password-dialog',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './change-portal-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePortalPasswordDialogComponent {
  private readonly service = inject(CustomerApplicationService);
  private readonly messageService = inject(MessageService);

  readonly customerId = input.required<string>();
  readonly customerName = input.required<string>();
  readonly customerRif = input.required<string>();
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  readonly changed = output<void>();

  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly loading = signal(false);
  readonly passwordTouched = signal(false);
  readonly confirmPasswordTouched = signal(false);

  readonly passwordError = computed(() => {
    const value = this.newPassword();
    if (!value) return 'La contraseña es requerida';
    if (value === this.customerRif()) return '';
    if (value.length < PASSWORD_MIN_LENGTH)
      return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
    if (value.length > PASSWORD_MAX_LENGTH)
      return `La contraseña no puede exceder ${PASSWORD_MAX_LENGTH} caracteres`;
    if (!UPPERCASE_PATTERN.test(value)) return 'La contraseña debe contener: letra mayúscula';
    if (!LOWERCASE_PATTERN.test(value)) return 'La contraseña debe contener: letra minúscula';
    if (!DIGIT_PATTERN.test(value)) return 'La contraseña debe contener: número';
    if (!SPECIAL_CHAR_PATTERN.test(value)) return 'La contraseña debe contener: carácter especial';
    return '';
  });

  readonly confirmPasswordError = computed(() => {
    const confirm = this.confirmPassword();
    if (!confirm) return 'La confirmación de contraseña es requerida';
    if (confirm !== this.newPassword()) return 'Las contraseñas no coinciden';
    return '';
  });

  readonly isValid = computed(() => !this.passwordError() && !this.confirmPasswordError());

  onSubmit(): void {
    this.passwordTouched.set(true);
    this.confirmPasswordTouched.set(true);
    if (!this.isValid()) return;

    this.loading.set(true);
    this.service.changePortalPassword(this.customerId(), this.newPassword()).subscribe({
      next: () => {
        this.loading.set(false);
        this.messageService.add(CUSTOMER_SUCCESS_MESSAGES.portalPasswordChanged);
        this.close();
        this.changed.emit();
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add(CUSTOMER_ERROR_MESSAGES.changePortalPassword);
      },
    });
  }

  onVisibleChange(visible: boolean): void {
    if (!visible) this.reset();
    this.visibleChange.emit(visible);
  }

  close(): void {
    this.reset();
    this.visibleChange.emit(false);
  }

  private reset(): void {
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.passwordTouched.set(false);
    this.confirmPasswordTouched.set(false);
  }
}
