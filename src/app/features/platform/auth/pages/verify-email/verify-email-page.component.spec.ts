import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyEmailPageComponent } from '@features/platform/auth/pages/verify-email/verify-email-page.component';
import { EmailVerificationApiService } from '@features/platform/auth/services/api/email-verification-api.service';

describe('VerifyEmailPageComponent', () => {
  const api = { confirm: vi.fn(), resend: vi.fn() };

  function render(token: string | null) {
    TestBed.configureTestingModule({
      imports: [VerifyEmailPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(token ? { token } : {}) } },
        },
        { provide: EmailVerificationApiService, useValue: api },
      ],
    });
    return TestBed.createComponent(VerifyEmailPageComponent).componentInstance;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/platform/auth/verify-email');
  });

  it('marks the email as verified when the token is accepted', () => {
    api.confirm.mockReturnValue(of({ emailVerified: true }));

    const component = render('token-value');

    expect(api.confirm).toHaveBeenCalledWith('token-value');
    expect(component.status()).toBe('success');
  });

  it('reports a missing token without calling the backend', () => {
    const component = render(null);

    expect(api.confirm).not.toHaveBeenCalled();
    expect(component.status()).toBe('invalid');
  });

  it('reports an expired link', () => {
    api.confirm.mockReturnValue(
      throwError(() => ({ status: 410, error: { code: 'EMAIL_VERIFICATION_EXPIRED' } })),
    );

    const component = render('expired-token');

    expect(component.status()).toBe('expired');
  });

  it('reports an already used link', () => {
    api.confirm.mockReturnValue(
      throwError(() => ({ status: 409, error: { code: 'EMAIL_VERIFICATION_USED' } })),
    );

    const component = render('used-token');

    expect(component.status()).toBe('used');
  });

  it('removes the token from the address bar before confirming', () => {
    window.history.replaceState({}, '', '/platform/auth/verify-email?token=secret-token');
    api.confirm.mockReturnValue(of({ emailVerified: true }));

    render('secret-token');

    expect(window.location.search).not.toContain('secret-token');
  });
});
