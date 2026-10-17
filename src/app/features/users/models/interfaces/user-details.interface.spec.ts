import { describe, it, expect } from 'vitest';
import type { UserDetails } from '@features/users/models/interfaces/user-details.interface';
import { UserType } from '@features/users/models/enums/user-type.enum';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

describe('UserDetails interface', () => {
  it('should have all required properties', () => {
    const user: UserDetails = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'testuser',
      role: UserType.OPERATOR,
      active: true,
      emailVerified: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
      modulePermissions: [BusinessModule.INVENTORY],
    };

    expect(user.id).toBe('u-001');
    expect(user.email).toBe('test@example.com');
    expect(user.userName).toBe('testuser');
    expect(user.role).toBe(UserType.OPERATOR);
    expect(user.active).toBe(true);
    expect(user.emailVerified).toBe(true);
    expect(user.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(user.updatedAt).toBe('2025-01-02T00:00:00Z');
    expect(user.modulePermissions).toEqual([BusinessModule.INVENTORY]);
  });

  it('should accept all UserType values', () => {
    const roles: UserType[] = [UserType.OPERATOR, UserType.ADMIN, UserType.SUPER_ADMIN];

    roles.forEach((role) => {
      const user: UserDetails = {
        id: 'u-001',
        email: 'test@example.com',
        userName: 'testuser',
        role,
        active: true,
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        modulePermissions: [],
      };
      expect(user.role).toBe(role);
    });
  });
});
