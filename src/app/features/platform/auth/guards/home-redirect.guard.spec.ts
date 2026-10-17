import { describe, it, expect, beforeEach, vi } from 'vitest';
import { homeRedirectGuard } from '@features/platform/auth/guards/home-redirect.guard';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('homeRedirectGuard', () => {
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    hasModulePermission: ReturnType<typeof vi.fn>;
    isSuperAdmin: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      hasModulePermission: vi.fn().mockReturnValue(true),
      isSuperAdmin: vi.fn().mockReturnValue(true),
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

    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({ pathFromRoot: [] } as any, {} as any),
    );

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/platform/auth/login']);
  });

  it('should redirect to dashboard when authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({ pathFromRoot: [] } as any, {} as any),
    );

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/analytics/dashboard']);
  });
});
