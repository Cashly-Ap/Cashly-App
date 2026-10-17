import { describe, it, expect } from 'vitest';
import type { UserCreate } from '@features/users/models/interfaces/user-create.interface';
import { UserType } from '@features/users/models/enums/user-type.enum';

describe('UserCreate interface', () => {
  it('should have all required properties', () => {
    const user: UserCreate = {
      email: 'test@example.com',
      password: 'secret123',
      userName: 'testuser',
      role: UserType.OPERATOR,
      active: true,
    };

    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('secret123');
    expect(user.userName).toBe('testuser');
    expect(user.role).toBe(UserType.OPERATOR);
    expect(user.active).toBe(true);
  });

  it('should accept all UserType values', () => {
    const roles: UserType[] = [UserType.OPERATOR, UserType.ADMIN, UserType.SUPER_ADMIN];

    roles.forEach((role) => {
      const user: UserCreate = {
        email: 'test@example.com',
        password: 'secret123',
        userName: 'testuser',
        role,
        active: true,
      };
      expect(user.role).toBe(role);
    });
  });
});
