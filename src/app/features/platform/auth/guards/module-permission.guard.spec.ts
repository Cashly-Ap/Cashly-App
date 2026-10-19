import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, provideRouter } from '@angular/router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError, firstValueFrom, isObservable } from 'rxjs';
import { modulePermissionGuard } from './module-permission.guard';
import { AuthService } from '../services/application/auth-application.service';
import { BusinessModule } from '../user/models/enums/business-module.enum';
describe('modulePermissionGuard', () => {
  const auth = { isAuthenticated: vi.fn(), ensureAccess: vi.fn(), hasPermission: vi.fn() };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    auth.isAuthenticated.mockReturnValue(true);
    auth.ensureAccess.mockReturnValue(of({}));
    auth.hasPermission.mockReturnValue(false);
  });
  function route(path: string, module = BusinessModule.CATALOG): ActivatedRouteSnapshot {
    return {
      data: {},
      routeConfig: { path },
      pathFromRoot: [{ data: { module } }, { data: {} }],
    } as ActivatedRouteSnapshot;
  }
  async function run(path: string) {
    const result = TestBed.runInInjectionContext(() =>
      modulePermissionGuard(route(path), {} as never),
    );
    return isObservable(result) ? firstValueFrom(result) : result;
  }
  it('checks CREATE and UPDATE on direct child URLs using the parent module', async () => {
    auth.hasPermission.mockReturnValue(true);
    expect(await run('new')).toBe(true);
    expect(auth.hasPermission).toHaveBeenLastCalledWith(BusinessModule.CATALOG, 'CREATE');
    expect(await run(':id/edit')).toBe(true);
    expect(auth.hasPermission).toHaveBeenLastCalledWith(BusinessModule.CATALOG, 'UPDATE');
  });
  it('checks READ for details and redirects denied actions', async () => {
    const result = await run(':id');
    expect(auth.hasPermission).toHaveBeenCalledWith(BusinessModule.CATALOG, 'READ');
    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe(
      '/platform/auth/configuration',
    );
  });
  it('fails closed if server access cannot be loaded', async () => {
    auth.ensureAccess.mockReturnValue(throwError(() => new Error('unavailable')));
    expect(TestBed.inject(Router).serializeUrl((await run('new')) as never)).toBe(
      '/platform/auth/login',
    );
  });
  it('requires explicit cross-owner stock grants before activating a write route', async () => {
    const snapshot = route('new', BusinessModule.SALES);
    snapshot.data = { requiredPermissions: ['INVENTORY:EXECUTE'] };
    auth.hasPermission.mockImplementation((module) => module === BusinessModule.SALES);
    const result = TestBed.runInInjectionContext(() =>
      modulePermissionGuard(snapshot, {} as never),
    );
    const destination = await firstValueFrom(result as ReturnType<typeof of>);
    expect(TestBed.inject(Router).serializeUrl(destination)).toBe('/platform/auth/configuration');
    expect(auth.hasPermission).toHaveBeenCalledWith(BusinessModule.INVENTORY, 'EXECUTE');
  });
});
