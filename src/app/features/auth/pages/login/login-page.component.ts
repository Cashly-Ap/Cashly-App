import { Component, inject, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/auth/services';
import { AuthValidators } from '@features/auth/validators';
import { AUTH_SESSION_MESSAGES } from '@features/auth/messages';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
  ],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private messageService = inject(MessageService);
  protected authService = inject(AuthService);

  logoSrc = computed(() => (this.themeService.isDarkMode() ? '/Parsun_Black.png' : '/Parsun_White.png'));

  form = this.fb.group({
    email: ['', AuthValidators.email],
    password: ['', AuthValidators.loginPassword],
  });

  onSubmit(): void {
    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();

      this.authService
        .login({
          email: email!,
          password: password!,
        })
        .subscribe({
          next: () => {
            const redirectPath = this.getRedirectPath();
            this.router.navigate([redirectPath]);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: AUTH_SESSION_MESSAGES.loginError.summary,
              detail: this.authService.error() ?? AUTH_SESSION_MESSAGES.loginError.detail,
              life: 5000,
            });
          },
        });
    }
  }

  getEmailError(): string {
    return AuthValidators.getEmailErrorMessage(this.form.controls.email.errors);
  }

  private getRedirectPath(): string {
    if (this.authService.isMerchant()) {
      return '/orders';
    }
    if (this.authService.isDispatcher()) {
      return '/invoices';
    }
    return '/auth/configuration';
  }
}
