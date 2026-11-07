import { describe, expect, it } from 'vitest';
import {
  isPermissionCode,
  legacyPermission,
  normalizePermissions,
} from '@features/platform/auth/authorization/models/legacy-permission';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

describe('legacy permissions', () => {
  it('translates a legacy module matrix into permission codes', () => {
    expect(normalizePermissions({ USERS: ['READ', 'UPDATE'] })).toEqual([
      'USERS_VIEW_LIST',
      'USERS_EDIT',
    ]);
  });

  it('maps the company module to its own permission codes', () => {
    expect(normalizePermissions({ COMPANY: ['READ', 'UPDATE'] })).toEqual([
      'COMPANY_VIEW',
      'COMPANY_EDIT',
    ]);
  });

  it('ignores legacy actions without a company permission code', () => {
    expect(normalizePermissions({ COMPANY: ['READ', 'DELETE'] })).toEqual(['COMPANY_VIEW']);
  });

  it('ignores unknown legacy modules instead of producing malformed codes', () => {
    expect(normalizePermissions({ UNKNOWN: ['READ'] })).toEqual([]);
  });

  it('keeps an explicit permission code list untouched', () => {
    expect(normalizePermissions(['COMPANY_VIEW', 'COMPANY_VIEW', 'USERS_EDIT'])).toEqual([
      'COMPANY_VIEW',
      'USERS_EDIT',
    ]);
  });

  it('resolves the company permissions through the legacy helper', () => {
    expect(legacyPermission(BusinessModule.USERS, 'UPDATE')).toBe('USERS_EDIT');
    expect(normalizePermissions({ COMPANY: ['UPDATE'] })).toContain('COMPANY_EDIT');
  });

  it('distinguishes permission codes from module keys', () => {
    expect(isPermissionCode('COMPANY_EDIT')).toBe(true);
    expect(isPermissionCode(BusinessModule.USERS)).toBe(false);
  });
});
