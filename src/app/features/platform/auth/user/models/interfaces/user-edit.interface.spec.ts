import { describe, it, expect } from 'vitest';
import type { UserEdit } from '@features/platform/auth/user/models/interfaces/user-edit.interface';

describe('UserEdit interface', () => {
  it('should have all required properties', () => {
    const user: UserEdit = {
      firstName: 'Test',
      lastName: 'User',
      address: null,
      phone: null,
      roleId: 'role-1',
      departmentId: 'department-1',
      userName: 'testuser',
      active: true,
    };

    expect(user.userName).toBe('testuser');
    expect(user.roleId).toBe('role-1');
    expect(user.departmentId).toBe('department-1');
    expect(user.active).toBe(true);
  });
});
