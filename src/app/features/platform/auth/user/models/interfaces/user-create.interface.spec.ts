import { describe, it, expect } from 'vitest';
import type { UserCreate } from '@features/platform/auth/user/models/interfaces/user-create.interface';

describe('UserCreate interface', () => {
  it('should have all required properties', () => {
    const user: UserCreate = {
      firstName: 'Test',
      lastName: 'User',
      address: null,
      phone: null,
      roleId: 'role-1',
      departmentId: 'department-1',
      email: 'test@example.com',
      password: 'secret123',
      userName: 'testuser',
    };

    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('secret123');
    expect(user.userName).toBe('testuser');
    expect(user.roleId).toBe('role-1');
    expect(user.departmentId).toBe('department-1');
  });
});
