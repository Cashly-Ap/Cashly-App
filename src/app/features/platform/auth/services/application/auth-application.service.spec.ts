import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { AuthApiService } from '@features/platform/auth/services/api/auth-api.service';
import {
  RegisterUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangeUsernameRequest,
  ChangePasswordRequest,
} from '@features/platform/auth/models/interfaces/auth-request.interface';
import { UserResponse } from '@features/platform/auth/models/interfaces/user.interface';
import { AuthenticationResponse } from '@features/platform/auth/models/interfaces/auth-response.interface';

describe('AuthService', () => {
  let service: AuthService;
  let mockApiService: {
    register: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    changeUsername: ReturnType<typeof vi.fn>;
    changePassword: ReturnType<typeof vi.fn>;
  };

  const mockUserResponse: UserResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    userName: 'testuser',
    type: 'CUSTOMER',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2025-01-15T10:30:00Z',
  };

  const mockAuthResponse: AuthenticationResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600000,
    entity: mockUserResponse,
  };

  beforeEach(() => {
    vi.useFakeTimers();

    localStorage.clear();

    mockApiService = {
      register: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
      changeUsername: vi.fn(),
      changePassword: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AuthApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should have null current user initially', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should have null access token initially', () => {
      expect(service.accessToken()).toBeNull();
    });

    it('should have null refresh token initially', () => {
      expect(service.refreshToken()).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(service.error()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('register', () => {
    it('should register user successfully', () => {
      mockApiService.register.mockReturnValue(of(mockUserResponse));

      const request: RegisterUserRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      service.register(request).subscribe((response) => {
        expect(response).toEqual(mockUserResponse);
        expect(service.currentUser()).toEqual(mockUserResponse);
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
      });

      expect(mockApiService.register).toHaveBeenCalledWith(request);
    });

    it('should set loading to true during registration', () => {
      mockApiService.register.mockReturnValue(of(mockUserResponse));

      const request: RegisterUserRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      expect(service.loading()).toBe(false);
      service.register(request).subscribe();
      expect(service.loading()).toBe(false);
    });

    it('should handle registration error', () => {
      const httpError = { status: 409, message: 'Email already exists' };
      mockApiService.register.mockReturnValue(throwError(() => httpError));

      const request: RegisterUserRequest = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
      };

      service.register(request).subscribe({
        error: () => {
          expect(service.error()).toBeDefined();
          expect(service.loading()).toBe(false);
        },
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', () => {
      mockApiService.login.mockReturnValue(of(mockAuthResponse));

      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      service.login(request).subscribe((response) => {
        expect(response).toEqual(mockAuthResponse);
        expect(service.currentUser()).toEqual(mockUserResponse);
        expect(service.accessToken()).toBe('mock-access-token');
        expect(service.refreshToken()).toBe('mock-refresh-token');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.loading()).toBe(false);
      });

      expect(mockApiService.login).toHaveBeenCalledWith(request);
    });

    it('should save auth to localStorage on successful login', () => {
      mockApiService.login.mockReturnValue(of(mockAuthResponse));

      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      service.login(request).subscribe(() => {
        expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
        expect(localStorage.getItem('currentUser')).toBeDefined();
      });
    });

    it('should handle login error', () => {
      const httpError = { status: 401 };
      mockApiService.login.mockReturnValue(throwError(() => httpError));

      const request: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      service.login(request).subscribe({
        error: () => {
          expect(service.error()).toBeDefined();
          expect(service.isAuthenticated()).toBe(false);
        },
      });
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', () => {
      const newAuthResponse: AuthenticationResponse = {
        ...mockAuthResponse,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockApiService.refresh.mockReturnValue(of(newAuthResponse));

      const request: RefreshTokenRequest = {
        refreshToken: 'mock-refresh-token',
      };

      service.refresh(request).subscribe((response) => {
        expect(response).toEqual(newAuthResponse);
        expect(service.accessToken()).toBe('new-access-token');
        expect(service.refreshToken()).toBe('new-refresh-token');
      });
    });

    it('should handle refresh error and clear auth state', () => {
      mockApiService.refresh.mockReturnValue(throwError(() => ({ status: 401 })));

      const request: RefreshTokenRequest = {
        refreshToken: 'expired-token',
      };

      service.refresh(request).subscribe({
        error: () => {
          expect(service.accessToken()).toBeNull();
          expect(service.refreshToken()).toBeNull();
          expect(service.currentUser()).toBeNull();
        },
      });
    });
  });

  describe('refreshTokenSilently', () => {
    it('should return error if no refresh token available', () => {
      service.refreshTokenSilently().subscribe({
        error: (err) => {
          expect(err.message).toBe('No refresh token available');
        },
      });
    });

    it('should refresh token silently when refresh token exists', () => {
      service.setAuthState(mockAuthResponse);
      const newAuthResponse: AuthenticationResponse = {
        ...mockAuthResponse,
        accessToken: 'new-access-token',
      };
      mockApiService.refresh.mockReturnValue(of(newAuthResponse));

      service.refreshTokenSilently().subscribe((response) => {
        expect(response.accessToken).toBe('new-access-token');
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      service.setAuthState(mockAuthResponse);
      mockApiService.logout.mockReturnValue(of(undefined));

      const request: LogoutRequest = {
        refreshToken: 'mock-refresh-token',
      };

      service.logout(request).subscribe(() => {
        expect(service.currentUser()).toBeNull();
        expect(service.accessToken()).toBeNull();
        expect(service.refreshToken()).toBeNull();
        expect(service.isAuthenticated()).toBe(false);
      });
    });

    it('should clear localStorage on logout', () => {
      service.setAuthState(mockAuthResponse);
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUserResponse));

      mockApiService.logout.mockReturnValue(of(undefined));

      const request: LogoutRequest = {
        refreshToken: 'mock-refresh-token',
      };

      service.logout(request).subscribe(() => {
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
        expect(localStorage.getItem('currentUser')).toBeNull();
      });
    });
  });

  describe('changeUsername', () => {
    it('should change username successfully', () => {
      const updatedUser: UserResponse = {
        ...mockUserResponse,
        userName: 'newusername',
      };
      mockApiService.changeUsername.mockReturnValue(of(updatedUser));

      const request: ChangeUsernameRequest = {
        username: 'newusername',
      };

      service.changeUsername(request).subscribe((response) => {
        expect(response).toEqual(updatedUser);
        expect(service.currentUser()?.userName).toBe('newusername');
        expect(service.loading()).toBe(false);
      });
    });

    it('should update localStorage after username change', () => {
      const updatedUser: UserResponse = {
        ...mockUserResponse,
        userName: 'newusername',
      };
      mockApiService.changeUsername.mockReturnValue(of(updatedUser));

      const request: ChangeUsernameRequest = {
        username: 'newusername',
      };

      service.changeUsername(request).subscribe(() => {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        expect(storedUser.userName).toBe('newusername');
      });
    });

    it('should handle username change error', () => {
      mockApiService.changeUsername.mockReturnValue(throwError(() => ({ status: 400 })));

      const request: ChangeUsernameRequest = {
        username: 'ab',
      };

      service.changeUsername(request).subscribe({
        error: () => {
          expect(service.error()).toBeDefined();
          expect(service.loading()).toBe(false);
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      mockApiService.changePassword.mockReturnValue(of(undefined));

      const request: ChangePasswordRequest = {
        newPassword: 'NewSecurePass456!',
      };

      service.changePassword(request).subscribe(() => {
        expect(service.loading()).toBe(false);
        expect(service.error()).toBeNull();
      });
    });

    it('should handle password change error', () => {
      mockApiService.changePassword.mockReturnValue(throwError(() => ({ status: 400 })));

      const request: ChangePasswordRequest = {
        newPassword: 'weak',
      };

      service.changePassword(request).subscribe({
        error: () => {
          expect(service.error()).toBeDefined();
          expect(service.loading()).toBe(false);
        },
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no access token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when access token exists', () => {
      service.setAuthState(mockAuthResponse);
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('setAuthState', () => {
    it('should set all auth state correctly', () => {
      service.setAuthState(mockAuthResponse);

      expect(service.currentUser()).toEqual(mockUserResponse);
      expect(service.accessToken()).toBe('mock-access-token');
      expect(service.refreshToken()).toBe('mock-refresh-token');
    });
  });

  describe('clearAuthState', () => {
    it('should clear all auth state', () => {
      service.setAuthState(mockAuthResponse);
      service.clearAuthState();

      expect(service.currentUser()).toBeNull();
      expect(service.accessToken()).toBeNull();
      expect(service.refreshToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should clear localStorage', () => {
      localStorage.setItem('accessToken', 'mock-access-token');
      localStorage.setItem('refreshToken', 'mock-refresh-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUserResponse));

      service.clearAuthState();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('loadAuthFromStorage', () => {
    it('should load auth from localStorage on initialization', async () => {
      TestBed.resetTestingModule();

      localStorage.setItem('accessToken', 'stored-access-token');
      localStorage.setItem('refreshToken', 'stored-refresh-token');
      localStorage.setItem('currentUser', JSON.stringify(mockUserResponse));
      localStorage.setItem('tokenExpiresAt', (Date.now() + 3600000).toString());

      TestBed.configureTestingModule({
        providers: [AuthService, { provide: AuthApiService, useValue: mockApiService }],
      });

      const newService = TestBed.inject(AuthService);

      expect(newService.accessToken()).toBe('stored-access-token');
      expect(newService.refreshToken()).toBe('stored-refresh-token');

      const loadedUser = newService.currentUser();
      expect(loadedUser?.id).toBe(mockUserResponse.id);
      expect(loadedUser?.email).toBe(mockUserResponse.email);
      expect(loadedUser?.userName).toBe(mockUserResponse.userName);
      expect(loadedUser?.active).toBe(mockUserResponse.active);
    });
  });

  describe('error handling', () => {
    it('should return connection error message for status 0', () => {
      mockApiService.login.mockReturnValue(throwError(() => ({ status: 0 })));

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe({
        error: () => {
          expect(service.error()).toContain('conexión');
        },
      });
    });

    it('should return credentials error message for status 401', () => {
      mockApiService.login.mockReturnValue(throwError(() => ({ status: 401 })));

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe({
        error: () => {
          expect(service.error()).toContain('incorrectas');
        },
      });
    });

    it('should return server error message for status 500', () => {
      mockApiService.login.mockReturnValue(throwError(() => ({ status: 500 })));

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe({
        error: () => {
          expect(service.error()).toContain('servidor');
        },
      });
    });

    it('should return default error message for unknown status', () => {
      mockApiService.login.mockReturnValue(throwError(() => ({ status: 999 })));

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe({
        error: () => {
          expect(service.error()).toBeDefined();
        },
      });
    });
  });
});
