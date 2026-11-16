import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthApiService } from '@features/platform/auth/services/api/auth-api.service';
import { AuthenticationResponse } from '@features/platform/auth/models/interfaces/auth-response.interface';
import { ACCESS_REFRESH_REQUEST } from '@features/platform/auth/authorization/models/access.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { CurrentAccess } from '@features/platform/auth/authorization/models/access.model';
describe('Current role authorization', () => {
  let auth: AuthService;
  let authorization: AuthorizationService;
  let http: HttpTestingController;
  const access: CurrentAccess = {
    roleId: 'r',
    roleName: 'Custom role',
    departmentId: 'd',
    systemAdministrator: false,
    permissions: {},
  };
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    authorization = TestBed.inject(AuthorizationService);
    http = TestBed.inject(HttpTestingController);
  });
  it('denies missing grants for every registered module', () => {
    auth.currentAccess.set(access);
    for (const module of Object.values(BusinessModule))
      expect(authorization.can(module)).toBe(false);
  });
  it('supports independent permissions per module', () => {
    auth.currentAccess.set({
      ...access,
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ'] },
    });
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS)).toBe(true);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'CREATE')).toBe(false);
    auth.currentAccess.set({
      ...access,
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['CREATE'] },
    });
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'CREATE')).toBe(true);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS)).toBe(false);
    auth.currentAccess.set({
      ...access,
      permissions: { [BusinessModule.DASHBOARD]: ['READ'] },
    });
    expect(authorization.can(BusinessModule.DASHBOARD)).toBe(true);
    expect(authorization.can(BusinessModule.DASHBOARD, 'CREATE')).toBe(false);
  });
  it('maps legacy grants to unique codes and never trusts a custom role name', () => {
    auth.currentUser.set({
      role: 'SUPER_ADMIN',
    } as never);
    auth.currentAccess.set({
      ...access,
      roleName: 'SUPER_ADMIN',
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['UPDATE'] },
    });
    expect(auth.isSuperAdmin()).toBe(false);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'UPDATE')).toBe(true);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'READ')).toBe(false);
  });
  it('replaces existing grants on a server refresh and fails closed', () => {
    auth.currentAccess.set({
      ...access,
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ', 'CREATE'] },
    });
    auth.refreshAccess().subscribe();
    http
      .expectOne('/api/auth/access')
      .flush({ ...access, permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ'] } });
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'CREATE')).toBe(false);
    auth.refreshAccess().subscribe({ error: () => undefined });
    http.expectOne('/api/auth/access').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS)).toBe(false);
    http.verify();
  });
  it('silent token refresh reloads current grants before completing without allowing access-fetch refresh recursion', () => {
    const response = {
      accessToken: 'new-token',
      refreshToken: 'refresh',
      expiresIn: 3600000,
      tokenType: 'Bearer',
      entity: { id: 'u' },
    } as AuthenticationResponse;
    auth.setAuthState(response);
    auth.currentAccess.set({
      ...access,
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ'] },
    });
    vi.spyOn(TestBed.inject(AuthApiService), 'refresh').mockReturnValue(of(response));
    let completed = false;
    auth.refreshTokenSilently().subscribe(() => (completed = true));
    expect(completed).toBe(false);
    const request = http.expectOne('/api/auth/access');
    expect(request.request.context.get(ACCESS_REFRESH_REQUEST)).toBe(true);
    request.flush({
      ...access,
      permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ', 'CREATE'] },
    });
    expect(completed).toBe(true);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS, 'CREATE')).toBe(true);
    auth.clearAuthState();
    http.verify();
  });
  it('restores an expired stored access session through its valid refresh token before loading access', () => {
    const response = {
      accessToken: 'renewed',
      refreshToken: 'valid-refresh',
      expiresIn: 3600000,
      tokenType: 'Bearer',
      entity: { id: 'u' },
    } as AuthenticationResponse;
    auth.setAuthState(response);
    localStorage.setItem('tokenExpiresAt', String(Date.now() - 1));
    const refresh = vi
      .spyOn(TestBed.inject(AuthApiService), 'refresh')
      .mockReturnValue(of(response));
    let completed = false;
    auth.ensureAccess().subscribe(() => (completed = true));
    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'valid-refresh' });
    http
      .expectOne('/api/auth/access')
      .flush({ ...access, permissions: { [BusinessModule.CATALOG_PRODUCTS]: ['READ'] } });
    expect(completed).toBe(true);
    expect(authorization.can(BusinessModule.CATALOG_PRODUCTS)).toBe(true);
    auth.clearAuthState();
    http.verify();
  });
});
