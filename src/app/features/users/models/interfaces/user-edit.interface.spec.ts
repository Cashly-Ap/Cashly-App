import { describe, it, expect } from 'vitest';
import type { UserEdit } from '@features/users/models/interfaces/user-edit.interface';
import { UserType } from '@features/users/models/enums';

describe('UserEdit interface', () => {
  it('should have all required properties', () => {
    const user: UserEdit = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'testuser',
      role: UserType.OPERATOR,
      active: true,
    };

    expect(user.id).toBe('u-001');
    expect(user.email).toBe('test@example.com');
    expect(user.userName).toBe('testuser');
    expect(user.role).toBe(UserType.OPERATOR);
    expect(user.active).toBe(true);
  });

  it('should accept all UserType values', () => {
    const roles: UserType[] = [UserType.OPERATOR, UserType.ADMIN, UserType.SUPER_ADMIN];

    roles.forEach((role) => {
      const user: UserEdit = {
        id: 'u-001',
        email: 'test@example.com',
        userName: 'testuser',
        role,
        active: true,
      };
      expect(user.role).toBe(role);
    });
  });
});
