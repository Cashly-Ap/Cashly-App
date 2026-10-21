import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecurityPageComponent } from './security-page.component';
import { MfaApiService } from '../../services/api/mfa-api.service';
import { AuthService } from '../../services/application/auth-application.service';

vi.mock('qrcode', () => ({ toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,qr') }));

describe('SecurityPageComponent', () => {
  const api = { status: vi.fn(), setup: vi.fn(), enable: vi.fn(), disable: vi.fn() };
  const auth = { clearAuthState: vi.fn() };
  const router = { navigate: vi.fn() };
  let component: SecurityPageComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    api.status.mockReturnValue(of({ enabled: false, recoveryCodesRemaining: 0 }));
    TestBed.configureTestingModule({
      imports: [SecurityPageComponent],
      providers: [
        { provide: MfaApiService, useValue: api },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
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
    expect(component.error()).toContain('Espera 15 minutos');
    api.enable.mockReturnValue(locked);
    component.codeForm.setValue({ code: '123456' });
    component.enable();
    expect(component.error()).toContain('Espera 15 minutos');
    api.disable.mockReturnValue(locked);
    component.disableForm.setValue({ password: 'password', code: '123456' });
    component.disable();
    expect(component.error()).toContain('Espera 15 minutos');
  });

  it('keeps MFA active after an incorrect disable code', () => {
    component.status.set({ enabled: true, recoveryCodesRemaining: 8 });
    component.disableForm.setValue({ password: 'password', code: 'wrong' });
    api.disable.mockReturnValue(throwError(() => ({ status: 401 })));
    component.disable();
    expect(component.status()?.enabled).toBe(true);
    expect(auth.clearAuthState).not.toHaveBeenCalled();
    expect(component.error()).toContain('No se pudo desactivar');
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
});
