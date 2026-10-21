import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { DetailsCardComponent } from '@shared/components/details/details-card/details-card.component';
import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { toDataURL } from 'qrcode';
import { MfaApiService, MfaStatus, MfaSetup } from '../../services/api/mfa-api.service';
import { mfaErrorMessage } from '../../messages/mfa-error-message';
import { AuthService } from '../../services/application/auth-application.service';

@Component({
  selector: 'app-security-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PageHeaderComponent,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
  ],
  templateUrl: './security-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecurityPageComponent {
  private readonly api = inject(MfaApiService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly status = signal<MfaStatus | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly setup = signal<MfaSetup | null>(null);
  readonly qrCode = signal('');
  readonly recoveryCodes = signal<string[]>([]);
  readonly copied = signal(false);
  readonly passwordForm = this.fb.nonNullable.group({ password: ['', Validators.required] });
  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  readonly disableForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
    code: ['', [Validators.required, Validators.maxLength(64)]],
  });

  constructor() {
    this.loadStatus();
  }

  loadStatus(): void {
    this.error.set('');
    this.api.status().subscribe({
      next: (status) => this.status.set(status),
      error: () => this.error.set('No se pudo cargar la seguridad. Vuelve a intentarlo.'),
    });
  }

  startSetup(): void {
    if (this.passwordForm.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .setup(this.passwordForm.getRawValue().password)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (setup) => {
          this.passwordForm.reset();
          this.setup.set(setup);
          void toDataURL(setup.otpauthUri, { width: 240, margin: 2 })
            .then((qr) => {
              if (this.setup() === setup) this.qrCode.set(qr);
            })
            .catch(() => this.error.set('No se pudo generar el QR. Usa la clave manual.'));
        },
        error: (error: unknown) =>
          this.error.set(
            mfaErrorMessage(
              error,
              'No se pudo preparar MFA. Comprueba tu contraseña e inténtalo de nuevo.',
            ),
          ),
      });
  }

  enable(): void {
    if (this.codeForm.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .enable(this.codeForm.getRawValue().code)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (response) => {
          this.setup.set(null);
          this.qrCode.set('');
          this.codeForm.reset();
          this.status.set({ enabled: true, recoveryCodesRemaining: response.recoveryCodes.length });
          this.recoveryCodes.set(response.recoveryCodes);
        },
        error: (error: unknown) =>
          this.error.set(
            mfaErrorMessage(
              error,
              'Código incorrecto o configuración caducada. Comprueba el código o vuelve a configurar MFA.',
            ),
          ),
      });
  }

  cancelSetup(): void {
    this.setup.set(null);
    this.qrCode.set('');
    this.codeForm.reset();
    this.error.set('');
  }

  disable(): void {
    if (this.disableForm.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    const value = this.disableForm.getRawValue();
    this.api
      .disable(value.password, value.code.trim())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => this.finish(),
        error: (error: unknown) =>
          this.error.set(
            mfaErrorMessage(
              error,
              'No se pudo desactivar MFA. Comprueba la contraseña y el código.',
            ),
          ),
      });
  }

  async copyCodes(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.recoveryCodes().join('\n'));
      this.copied.set(true);
    } catch {
      this.error.set('No se pudieron copiar. Selecciona los códigos o descárgalos.');
    }
  }

  downloadCodes(): void {
    const url = URL.createObjectURL(
      new Blob(
        ['Cashly — Códigos de recuperación (un solo uso)\n\n' + this.recoveryCodes().join('\n')],
        { type: 'text/plain' },
      ),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cashly-recovery-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  finish(): void {
    this.recoveryCodes.set([]);
    this.auth.clearAuthState();
    void this.router.navigate(['/platform/auth/login']);
  }
}
