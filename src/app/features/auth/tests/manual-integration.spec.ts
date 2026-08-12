import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@features/auth/services/application';
import { AuthApiService } from '@features/auth/services/api';
import { AuthValidators } from '@features/auth/validators';
import { environment } from '@env/environment';

describe('Auth Integration - Form to API', () => {
  let authService: AuthService;
  let authApiService: AuthApiService;
  let httpMock: HttpTestingController;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        AuthService,
        AuthApiService,
        FormBuilder,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    authService = TestBed.inject(AuthService);
    authApiService = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
    formBuilder = TestBed.inject(FormBuilder);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    httpMock.verify();
  });

  describe('Login Form to Endpoint Integration', () => {
    it('should send exact form data to login endpoint', () => {
      const form = formBuilder.group({
        email: ['test@example.com', AuthValidators.email],
        password: ['mypassword', AuthValidators.loginPassword],
      });

      expect(form.valid).toBe(true);

      const formData = form.getRawValue();
      expect(formData.email).toBe('test@example.com');
      expect(formData.password).toBe('mypassword');

      authApiService
        .login({
          email: formData.email!,
          password: formData.password!,
        })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'test@example.com',
        password: 'mypassword',
      });
      expect(req.request.body.email).toBe('test@example.com');
      expect(req.request.body.password).toBe('mypassword');

      req.flush({
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: '1',
          email: 'test@example.com',
          active: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    it('should validate and send password with special characters', () => {
      const form = formBuilder.group({
        email: ['user@domain.com', AuthValidators.email],
        password: ['P@ssw0rd!123', AuthValidators.loginPassword],
      });

      expect(form.valid).toBe(true);

      const { email, password } = form.getRawValue();

      authApiService
        .login({
          email: email!,
          password: password!,
        })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.body).toEqual({
        email: 'user@domain.com',
        password: 'P@ssw0rd!123',
      });

      req.flush({
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: '1',
          email: 'user@domain.com',
          active: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    it('should handle complete login flow with validation', () => {
      const form = formBuilder.group({
        email: ['admin@parsun.com', AuthValidators.email],
        password: ['SecurePass123!', AuthValidators.loginPassword],
      });

      expect(form.controls.email.valid).toBe(true);
      expect(form.controls.password.valid).toBe(true);
      expect(form.valid).toBe(true);

      const loginRequest = {
        email: form.controls.email.value!,
        password: form.controls.password.value!,
      };

      authService.login(loginRequest).subscribe((response) => {
        expect(response.user.email).toBe('admin@parsun.com');
        expect(response.accessToken).toBe('jwt-token');
        expect(authService.currentUser()?.email).toBe('admin@parsun.com');
        expect(authService.accessToken()).toBe('jwt-token');
        expect(authService.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('admin@parsun.com');
      expect(req.request.body.password).toBe('SecurePass123!');

      req.flush({
        accessToken: 'jwt-token',
        refreshToken: 'refresh-jwt',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: '1',
          email: 'admin@parsun.com',
          active: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    it('should not accept invalid email format', () => {
      const form = formBuilder.group({
        email: ['invalid-email', AuthValidators.email],
        password: ['password', AuthValidators.loginPassword],
      });

      expect(form.controls.email.valid).toBe(false);
      expect(form.controls.email.hasError('email')).toBe(true);
      expect(form.valid).toBe(false);
    });

    it('should not accept empty password', () => {
      const form = formBuilder.group({
        email: ['test@example.com', AuthValidators.email],
        password: ['', AuthValidators.loginPassword],
      });

      expect(form.controls.password.valid).toBe(false);
      expect(form.controls.password.hasError('required')).toBe(true);
      expect(form.valid).toBe(false);
    });

    it('should send data with exact types from form', () => {
      const form = formBuilder.group({
        email: ['integration@test.com', AuthValidators.email],
        password: ['TestPassword123!', AuthValidators.loginPassword],
      });

      const rawValue = form.getRawValue();
      expect(typeof rawValue.email).toBe('string');
      expect(typeof rawValue.password).toBe('string');
      expect(rawValue.email).toBe('integration@test.com');
      expect(rawValue.password).toBe('TestPassword123!');

      authApiService
        .login({
          email: rawValue.email!,
          password: rawValue.password!,
        })
        .subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      const body = req.request.body;

      expect(typeof body.email).toBe('string');
      expect(typeof body.password).toBe('string');
      expect(body.email).toBe('integration@test.com');
      expect(body.password).toBe('TestPassword123!');

      req.flush({
        accessToken: 'token',
        refreshToken: 'refresh',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: '1',
          email: 'integration@test.com',
          active: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });
  });
});
