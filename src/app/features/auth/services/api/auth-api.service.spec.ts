import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthApiService } from './auth-api.service';
import {
  RegisterUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangeUsernameRequest,
  ChangePasswordRequest,
  UserResponse,
  AuthenticationResponse,
} from '@features/auth/models';
import { environment } from '@env/environment';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  const mockUserResponse: UserResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    userName: 'testuser',
    active: true,
    emailVerified: false,
    createdAt: new Date('2025-01-15T10:30:00Z'),
    updatedAt: new Date('2025-01-15T10:30:00Z'),
  };

  const mockAuthResponse: AuthenticationResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: mockUserResponse,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('register', () => {
    it('should send POST request to /auth/register', () => {
      const request: RegisterUserRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      service.register(request).subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockUserResponse);
    });

    it('should handle registration error', () => {
      const request: RegisterUserRequest = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
      };

      service.register(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/register`);
      req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('login', () => {
    it('should send POST request to /auth/login', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      service.login(request).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAuthResponse);
    });

    it('should handle invalid credentials error', () => {
      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      service.login(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle inactive user error', () => {
      const request: LoginRequest = {
        email: 'inactive@example.com',
        password: 'SecurePass123!',
      };

      service.login(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      req.flush({ message: 'User is inactive' }, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('refresh', () => {
    it('should send POST request to /auth/refresh', () => {
      const request: RefreshTokenRequest = {
        refreshToken: 'mock-refresh-token',
      };

      service.refresh(request).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockAuthResponse);
    });

    it('should handle expired refresh token error', () => {
      const request: RefreshTokenRequest = {
        refreshToken: 'expired-token',
      };

      service.refresh(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/refresh`);
      req.flush({ message: 'Invalid or expired refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should send POST request to /auth/logout', () => {
      const request: LogoutRequest = {
        refreshToken: 'mock-refresh-token',
      };

      service.logout(request).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/auth/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('changeUsername', () => {
    it('should send PATCH request to /auth/change-username', () => {
      const request: ChangeUsernameRequest = {
        username: 'newusername',
      };

      const updatedUser: UserResponse = {
        ...mockUserResponse,
        userName: 'newusername',
        updatedAt: new Date('2025-01-15T12:45:00Z'),
      };

      service.changeUsername(request).subscribe((response) => {
        expect(response).toEqual(updatedUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/change-username`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(request);
      req.flush(updatedUser);
    });

    it('should handle username change error', () => {
      const request: ChangeUsernameRequest = {
        username: 'ab',
      };

      service.changeUsername(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/change-username`);
      req.flush({ message: 'Username too short' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('changePassword', () => {
    it('should send PATCH request to /auth/change-password', () => {
      const request: ChangePasswordRequest = {
        newPassword: 'NewSecurePass456!',
      };

      service.changePassword(request).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/auth/change-password`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(request);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle weak password error', () => {
      const request: ChangePasswordRequest = {
        newPassword: 'weak',
      };

      service.changePassword(request).subscribe({
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/change-password`);
      req.flush({ message: 'Password does not meet requirements' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
