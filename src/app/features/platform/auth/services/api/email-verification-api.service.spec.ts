import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EmailVerificationApiService } from '@features/platform/auth/services/api/email-verification-api.service';

describe('EmailVerificationApiService', () => {
  let service: EmailVerificationApiService;
  let httpMock: HttpTestingController;
  const baseUrl = '/api/auth/email-verification';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EmailVerificationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('confirms a token against the public endpoint', () => {
    let verified = false;
    service.confirm('token-value').subscribe((response) => {
      verified = response.emailVerified;
    });

    const request = httpMock.expectOne(`${baseUrl}/confirm`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'token-value' });
    request.flush({ emailVerified: true });
    expect(verified).toBe(true);
  });

  it('requests a new verification email for the authenticated user', () => {
    service.resend().subscribe();

    const request = httpMock.expectOne(`${baseUrl}/resend`);
    expect(request.request.method).toBe('POST');
    request.flush(null, { status: 202, statusText: 'Accepted' });
  });
});
