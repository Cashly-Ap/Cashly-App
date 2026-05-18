import { describe, it, expect, beforeEach, vi } from 'vitest';
import { modulePermissionGuard } from './module-permission.guard';
import { AuthService } from '@features/auth/services';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { BusinessModule } from '@features/users/models/enums';

describe('modulePermissionGuard', () => {
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn>; hasModulePermission: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      hasModulePermission: vi.fn(),
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

  function createRoute(module?: BusinessModule): ActivatedRouteSnapshot {
    return { data: { module } } as unknown as ActivatedRouteSnapshot;
  }

  it('should redirect to /auth/login when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => modulePermissionGuard(createRoute(BusinessModule.USERS), {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should return true when no module is specified in route data', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => modulePermissionGuard(createRoute(undefined), {} as any));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return true when user has module permission', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.hasModulePermission.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => modulePermissionGuard(createRoute(BusinessModule.USERS), {} as any));

    expect(result).toBe(true);
    expect(mockAuthService.hasModulePermission).toHaveBeenCalledWith(BusinessModule.USERS);
  });

  it('should redirect to / when user lacks module permission', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.hasModulePermission.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => modulePermissionGuard(createRoute(BusinessModule.FINANCE), {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
