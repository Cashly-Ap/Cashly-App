import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, firstValueFrom, isObservable } from 'rxjs';
import { homeRedirectGuard } from './home-redirect.guard';
import { AuthService } from '../services/application/auth-application.service';
import { BusinessModule } from '../user/models/enums/business-module.enum';
describe('homeRedirectGuard', () => {
  const auth = {
    isAuthenticated: vi.fn(),
    ensureAccess: vi.fn(),
    hasModulePermission: vi.fn(),
    isSuperAdmin: () => false,
  };
  beforeEach(() => {
    auth.isAuthenticated.mockReturnValue(true);
    auth.ensureAccess.mockReturnValue(of({}));
    auth.hasModulePermission.mockImplementation((module) => module === BusinessModule.CATALOG_PRODUCTS);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });
  it('waits for current permissions and opens the accessible catalog separately from inventory', async () => {
    const result = TestBed.runInInjectionContext(() =>
      homeRedirectGuard({ pathFromRoot: [] } as never, {} as never),
    );
    expect(isObservable(result)).toBe(true);
    const destination = await firstValueFrom(result as ReturnType<typeof of>);
    expect(TestBed.inject(Router).serializeUrl(destination)).toBe('/catalog/products');
    expect(auth.ensureAccess).toHaveBeenCalled();
  });
  it('redirects an unauthenticated session to login', () => {
    auth.isAuthenticated.mockReturnValue(false);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    expect(
      TestBed.runInInjectionContext(() =>
        homeRedirectGuard({ pathFromRoot: [] } as never, {} as never),
      ),
    ).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/platform/auth/login']);
  });
});
