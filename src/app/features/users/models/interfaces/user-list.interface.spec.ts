import { describe, it, expect } from 'vitest';
import type { UserList } from './user-list.interface';
import { UserType, BusinessModule } from '@features/users/models/enums';

describe('UserList interface', () => {
  it('should have all required properties', () => {
    const user: UserList = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'testuser',
      role: UserType.OPERATOR,
      active: true,
      emailVerified: true,
      createdAt: '2025-01-01T00:00:00Z',
      modulePermissions: [BusinessModule.INVENTORY],
    };

    expect(user.id).toBe('u-001');
    expect(user.email).toBe('test@example.com');
    expect(user.userName).toBe('testuser');
    expect(user.role).toBe(UserType.OPERATOR);
    expect(user.active).toBe(true);
    expect(user.emailVerified).toBe(true);
    expect(user.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(user.modulePermissions).toEqual([BusinessModule.INVENTORY]);
  });

  it('should accept all UserType values', () => {
    const roles: UserType[] = [UserType.OPERATOR, UserType.ADMIN, UserType.SUPER_ADMIN];

    roles.forEach((role) => {
      const user: UserList = {
        id: 'u-001',
        email: 'test@example.com',
        userName: 'testuser',
        role,
        active: true,
        emailVerified: true,
        createdAt: '2025-01-01T00:00:00Z',
        modulePermissions: [],
      };
      expect(user.role).toBe(role);
    });
  });

  it('should accept multiple module permissions', () => {
    const user: UserList = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'admin',
      role: UserType.ADMIN,
      active: true,
      emailVerified: true,
      createdAt: '2025-01-01T00:00:00Z',
      modulePermissions: [
        BusinessModule.USERS,
        BusinessModule.INVENTORY,
        BusinessModule.SALES,
        BusinessModule.FINANCE,
      ],
    };

    expect(user.modulePermissions).toHaveLength(4);
    expect(user.modulePermissions).toContain(BusinessModule.USERS);
    expect(user.modulePermissions).toContain(BusinessModule.INVENTORY);
  });
});
