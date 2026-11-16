import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  HttpClient,
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { authInterceptor } from '@features/platform/auth/interceptors/auth.interceptor';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { signal } from '@angular/core';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceMock: {
    accessToken: ReturnType<typeof signal>;
    refreshToken: ReturnType<typeof signal>;
    clearAuthState: ReturnType<typeof vi.fn>;
    refreshTokenSilently: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let messageServiceMock: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      accessToken: signal('test-token'),
      refreshToken: signal('refresh-token'),
      clearAuthState: vi.fn(),
      refreshTokenSilently: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    messageServiceMock = {
      add: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('token injection', () => {
    it('should add Authorization header when token exists', () => {
      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
      authServiceMock.accessToken.set(null);

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('error handling - connection errors', () => {
    it('should handle status 0 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(0);
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'error',
              summary: 'Error de Conexión',
              detail: 'No se puede conectar con el servidor. Por favor, inténtelo más tarde.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 0 });

      await promise;
    });

    it('should handle status 503 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(503);
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'error',
              summary: 'Error de Conexión',
              detail: 'No se puede conectar con el servidor. Por favor, inténtelo más tarde.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 503 });

      await promise;
    });

    it('should handle status 504 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(504);
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'error',
              summary: 'Error de Conexión',
              detail: 'No se puede conectar con el servidor. Por favor, inténtelo más tarde.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 504 });

      await promise;
    });
  });

  describe('error handling - 401 unauthorized', () => {
    it('should attempt token refresh on 401 error', async () => {
      const mockRefreshResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 900000,
        user: {
          id: '1',
          email: 'test@example.com',
          userName: 'testuser',
          active: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      authServiceMock.refreshTokenSilently.mockReturnValue(of(mockRefreshResponse));

      const promise = new Promise((resolve) => {
        httpClient.get('/api/test').subscribe({
          next: (response) => {
            expect(response).toEqual({ data: 'success' });
            expect(authServiceMock.refreshTokenSilently).toHaveBeenCalled();
            resolve(undefined);
          },
        });
      });

      const req1 = httpMock.expectOne('/api/test');
      req1.error(new ProgressEvent('error'), { status: 401 });

      const req2 = httpMock.expectOne('/api/test');
      req2.flush({ data: 'success' });

      await promise;
    });

    it('should redirect to login if refresh fails', async () => {
      authServiceMock.refreshTokenSilently.mockReturnValue(
        throwError(() => new Error('Refresh failed')),
      );

      const promise = new Promise((resolve) => {
        httpClient.get('/api/test').subscribe({
          error: (error) => {
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'warn',
              summary: 'Sesión Expirada',
              detail: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 401 });

      await promise;
    });

    it('should not attempt refresh for /auth/refresh endpoint', async () => {
      const promise = new Promise((resolve) => {
        httpClient.post('/api/auth/refresh', {}).subscribe({
          error: (error) => {
            expect(error.status).toBe(401);
            expect(authServiceMock.refreshTokenSilently).not.toHaveBeenCalled();
            expect(messageServiceMock.add).not.toHaveBeenCalled();
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.error(new ProgressEvent('error'), { status: 401 });

      await promise;
    });

    it('should redirect to login if no refresh token available', async () => {
      authServiceMock.refreshToken.set(null);

      const promise = new Promise((resolve) => {
        httpClient.get('/api/test').subscribe({
          error: (error) => {
            expect(error.status).toBe(401);
            expect(authServiceMock.refreshTokenSilently).not.toHaveBeenCalled();
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'warn',
              summary: 'Sesión Expirada',
              detail: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).toHaveBeenCalled();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 401 });

      await promise;
    });
  });

  describe('error handling - server errors', () => {
    it('should handle 500 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(500);
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'error',
              summary: 'Error del Servidor',
              detail: 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.',
              life: 5000,
            });
            expect(authServiceMock.clearAuthState).not.toHaveBeenCalled();
            expect(routerMock.navigate).not.toHaveBeenCalled();
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 500 });

      await promise;
    });

    it('should handle 502 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(502);
            expect(messageServiceMock.add).toHaveBeenCalledWith({
              severity: 'error',
              summary: 'Error del Servidor',
              detail: 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.',
              life: 5000,
            });
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 502 });

      await promise;
    });
  });

  describe('error handling - other errors', () => {
    it('should not show message for 400 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(400);
            expect(messageServiceMock.add).not.toHaveBeenCalled();
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 400 });

      await promise;
    });

    it('should not show message for 404 error', async () => {
      const promise = new Promise((resolve, reject) => {
        httpClient.get('/api/test').subscribe({
          next: () => reject(new Error('Should not succeed')),
          error: (error) => {
            expect(error.status).toBe(404);
            expect(messageServiceMock.add).not.toHaveBeenCalled();
            resolve(undefined);
          },
        });
      });

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('error'), { status: 404 });

      await promise;
    });
  });

  describe('successful requests', () => {
    it('should allow successful requests to pass through', () => {
      const mockResponse = { data: 'test' };

      httpClient.get('/api/test').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/test');
      req.flush(mockResponse);
    });
  });
});
