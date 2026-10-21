import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { AuthValidators } from '@features/platform/auth/validators/auth-validators';
import { AUTH_SESSION_MESSAGES } from '@features/platform/auth/messages/error-messages';
import { authorizedDestination } from '@features/platform/auth/routing/authorized-destination';
import { requiresMfa } from '../../models/interfaces/auth-response.interface';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  logoSrc = computed(() => '/cashly-logo.svg');

  form = this.fb.group({
    email: ['', AuthValidators.email],
    password: ['', AuthValidators.loginPassword],
  });

  readonly challengeToken = signal<string | null>(null);
  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(64)]],
  });

  verifyMfa(): void {
    const token = this.challengeToken();
    if (!token || this.codeForm.invalid || this.authService.loading()) return;
    this.authService.verifyMfa(token, this.codeForm.getRawValue().code.trim()).subscribe({
      next: () => this.router.navigate([this.getRedirectPath()]),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'No se pudo verificar',
          detail: this.authService.error() ?? undefined,
        }),
    });
  }

  restartLogin(): void {
    this.challengeToken.set(null);
    this.codeForm.reset();
    this.authService.error.set(null);
  }

  onSubmit(): void {
    if (this.form.valid && !this.authService.loading()) {
      const { email, password } = this.form.getRawValue();

      this.authService
        .login({
          email: email!,
          password: password!,
        })
        .subscribe({
          next: (response) => {
            if (requiresMfa(response)) {
              this.challengeToken.set(response.challengeToken);
              this.form.controls.password.reset();
              return;
            }
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
    return authorizedDestination(this.authService);
  }
}
