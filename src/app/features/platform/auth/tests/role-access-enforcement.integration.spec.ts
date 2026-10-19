import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthApiService } from '../services/api/auth-api.service';
import { AuthService } from '../services/application/auth-application.service';
import { CurrentAccess, PermissionAction } from '../authorization/models/access.model';
import { UserResponse } from '../models/interfaces/user.interface';
import { BusinessModule } from '../user/models/enums/business-module.enum';

const actions: PermissionAction[] = [
  'READ',
  'CREATE',
  'UPDATE',
  'DELETE',
  'EXPORT',
  'IMPORT',
  'EXECUTE',
];

function access(grants: PermissionAction[], administrator = false): CurrentAccess {
  return {
    roleId: 'assigned-role',
    roleName: 'Assigned role',
    departmentId: 'department',
    systemAdministrator: administrator,
    permissions: { [BusinessModule.USERS]: grants },
  };
}

describe('authoritative role permissions', () => {
  let auth: AuthService;
  const get = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { get } },
        { provide: AuthApiService, useValue: {} },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it.each(actions)('denies %s until authoritative access exists', (action) => {
    expect(auth.hasPermission(BusinessModule.USERS, action)).toBe(false);
  });

  it('does not infer access from a legacy SUPER_ADMIN user label', () => {
    auth.currentUser.set({ role: 'SUPER_ADMIN' } as UserResponse);
    expect(auth.hasModulePermission(BusinessModule.USERS)).toBe(false);
  });

  it('does not bypass declared grants for an administrator access flag', () => {
    auth.currentAccess.set(access([], true));
    expect(auth.hasPermission(BusinessModule.USERS, 'UPDATE')).toBe(false);
  });

  it('allows reading with an assigned READ grant', () => {
    auth.currentAccess.set(access(['READ']));
    expect(auth.hasModulePermission(BusinessModule.USERS)).toBe(true);
  });

  it.each(actions.filter((action) => action !== 'READ'))(
    'denies %s for a read-only role',
    (action) => {
      auth.currentAccess.set(access(['READ']));
      expect(auth.hasPermission(BusinessModule.USERS, action)).toBe(false);
    },
  );

  it('denies UPDATE if the prerequisite READ grant is missing', () => {
    auth.currentAccess.set(access(['UPDATE']));
    expect(auth.hasPermission(BusinessModule.USERS, 'UPDATE')).toBe(false);
  });

  it('honors assigned grants regardless of the legacy user role label', () => {
    auth.currentUser.set({ role: 'OPERATOR' } as UserResponse);
    auth.currentAccess.set(access(['READ', 'UPDATE']));
    expect(auth.hasPermission(BusinessModule.USERS, 'UPDATE')).toBe(true);
  });

  it('does not reuse grants for a different module', () => {
    auth.currentAccess.set(access(['READ', 'UPDATE']));
    expect(auth.hasPermission(BusinessModule.ROLES, 'UPDATE')).toBe(false);
  });

  it('applies revocation on the next authoritative refresh', async () => {
    auth.currentAccess.set(access(['READ', 'UPDATE']));
    get.mockReturnValue(of(access(['READ'])));
    await firstValueFrom(auth.ensureAccess());
    expect(auth.hasPermission(BusinessModule.USERS, 'UPDATE')).toBe(false);
  });

  it('clears previous grants when authoritative access cannot be refreshed', async () => {
    auth.currentAccess.set(access(['READ', 'UPDATE']));
    get.mockReturnValue(throwError(() => new Error('Access unavailable')));
    await firstValueFrom(auth.ensureAccess()).catch(() => undefined);
    expect(auth.hasModulePermission(BusinessModule.USERS)).toBe(false);
  });
});
