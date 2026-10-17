import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminGuard } from '@features/auth/guards/admin.guard';
import { AuthService } from '@features/auth/services/application/auth-application.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('adminGuard', () => {
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    isSuperAdmin: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      isSuperAdmin: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should redirect to /auth/login when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should redirect to / when authenticated but not super admin', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isSuperAdmin.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return true when authenticated and super admin', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isSuperAdmin.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
