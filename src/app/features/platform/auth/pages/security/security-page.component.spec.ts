import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecurityPageComponent } from '@features/platform/auth/pages/security/security-page.component';
import { MfaApiService } from '@features/platform/auth/services/api/mfa-api.service';
import { EmailVerificationApiService } from '@features/platform/auth/services/api/email-verification-api.service';
import { SelfProfileService } from '@features/platform/auth/services/api/self-profile.service';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { MessageService } from 'primeng/api';

vi.mock('uqr', () => ({
  renderSVG: vi.fn().mockReturnValue('<svg></svg>'),
}));

describe('SecurityPageComponent', () => {
  const api = { status: vi.fn(), setup: vi.fn(), enable: vi.fn(), disable: vi.fn() };
  const auth = { clearAuthState: vi.fn() };
  const router = { navigate: vi.fn() };
  const profiles = { getProfile: vi.fn() };
  const verification = { resend: vi.fn() };
  const messages = { add: vi.fn() };
  let component: SecurityPageComponent;

  const warnedDetail = (): string => String(messages.add.mock.calls.at(-1)?.[0]?.detail ?? '');

  beforeEach(() => {
    vi.clearAllMocks();
    api.status.mockReturnValue(of({ enabled: false, recoveryCodesRemaining: 0 }));
    profiles.getProfile.mockReturnValue(
      of({
        id: 'user-id',
        firstName: 'Ana',
        lastName: 'García',
        userName: 'ana',
        email: 'ana@example.com',
        active: true,
        emailVerified: false,
        createdAt: '2026-10-15T12:00:00Z',
        updatedAt: '2026-10-19T12:00:00Z',
      }),
    );
    verification.resend.mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      imports: [SecurityPageComponent],
      providers: [
        { provide: MfaApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: SelfProfileService, useValue: profiles },
        { provide: EmailVerificationApiService, useValue: verification },
        { provide: MessageService, useValue: messages },
      ],
    });
    component = TestBed.createComponent(SecurityPageComponent).componentInstance;
  });

  it('does not activate before a valid six digit code and only shows recovery codes after success', () => {
    component.codeForm.setValue({ code: '123' });
    component.enable();
    expect(api.enable).not.toHaveBeenCalled();
    api.enable.mockReturnValue(of({ recoveryCodes: ['one-time-code'] }));
    component.setup.set({ secret: 'secret', otpauthUri: 'otpauth://totp/Cashly', expiresIn: 600 });
    component.codeForm.setValue({ code: '123456' });
    component.enable();
    expect(component.recoveryCodes()).toEqual(['one-time-code']);
    expect(component.setup()).toBeNull();
    expect(auth.clearAuthState).not.toHaveBeenCalled();
    component.finish();
    expect(component.recoveryCodes()).toEqual([]);
    expect(auth.clearAuthState).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
  });

  it('explains lockout when security setup or verification is blocked', () => {
    const locked = throwError(() => ({
      error: { message: 'Too many MFA attempts; try again in 15 minutes' },
    }));
    api.setup.mockReturnValue(locked);
    component.passwordForm.setValue({ password: 'password' });
    component.startSetup();
    expect(warnedDetail()).toContain('Espera 15 minutos');
    api.enable.mockReturnValue(locked);
    component.codeForm.setValue({ code: '123456' });
    component.enable();
    expect(warnedDetail()).toContain('Espera 15 minutos');
    api.disable.mockReturnValue(locked);
    component.disableForm.setValue({ password: 'password', code: '123456' });
    component.disable();
    expect(warnedDetail()).toContain('Espera 15 minutos');
  });

  it('keeps MFA active after an incorrect disable code', () => {
    component.status.set({ enabled: true, recoveryCodesRemaining: 8 });
    component.disableForm.setValue({ password: 'password', code: 'wrong' });
    api.disable.mockReturnValue(throwError(() => ({ status: 401 })));
    component.disable();
    expect(component.status()?.enabled).toBe(true);
    expect(auth.clearAuthState).not.toHaveBeenCalled();
    expect(warnedDetail()).toContain('No se pudo desactivar');
  });

  it('keeps the retry card when the settings cannot be loaded', () => {
    api.status.mockReturnValue(throwError(() => ({ status: 500 })));
    component.loadStatus();
    expect(component.status()).toBeNull();
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('accepts recovery codes to disable MFA then requires login', () => {
    component.disableForm.setValue({ password: 'password', code: 'recovery-code' });
    api.disable.mockReturnValue(of(undefined));
    component.disable();
    expect(api.disable).toHaveBeenCalledWith('password', 'recovery-code');
    expect(auth.clearAuthState).toHaveBeenCalled();
  });

  it('does not restore a QR after setup is cancelled', async () => {
    api.setup.mockReturnValue(
      of({ secret: 'secret', otpauthUri: 'otpauth://totp/Cashly', expiresIn: 600 }),
    );
    component.passwordForm.setValue({ password: 'password' });
    component.startSetup();
    component.cancelSetup();
    await Promise.resolve();
    expect(component.qrCode()).toBe('');
    expect(component.setup()).toBeNull();
    expect(component.passwordForm.getRawValue().password).toBe('');
  });

  it('shows the pending email badge and resends the verification link', () => {
    expect(component.profile()?.email).toBe('ana@example.com');
    expect(component.profile()?.emailVerified).toBe(false);
    component.resendVerification();
    expect(verification.resend).toHaveBeenCalledTimes(1);
    expect(component.verificationNotice()).toBe('platform.auth.verificationSent');
  });

  it('reports the resend cooldown without dropping the pending state', () => {
    verification.resend.mockReturnValue(throwError(() => ({ status: 429 })));
    component.resendVerification();
    expect(component.verificationNotice()).toBe('platform.auth.verificationRateLimited');
    expect(component.verificationBusy()).toBe(false);
  });
});
