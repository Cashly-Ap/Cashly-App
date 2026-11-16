import { describe, it, expect } from 'vitest';
import { UserMapper } from '@features/platform/auth/user/services/mappers/user.mapper';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';
import { UserEdit } from '@features/platform/auth/user/models/interfaces/user-edit.interface';
import { UserType } from '@features/platform/auth/user/models/enums/user-type.enum';

describe('UserMapper', () => {
  const mockUserDetails: UserDetails = {
    firstName: 'Test',
    lastName: 'User',
    address: null,
    phone: null,
    roleId: 'role-1',
    departmentId: 'department-1',
    id: 'user-001',
    email: 'john@example.com',
    userName: 'John Doe',
    role: UserType.ADMIN,
    active: true,
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
  };

  describe('toList', () => {
    it('should map UserDetails to UserList', () => {
      const result = UserMapper.toList(mockUserDetails);

      expect(result.id).toBe('user-001');
      expect(result.email).toBe('john@example.com');
      expect(result.userName).toBe('John Doe');
      expect(result.role).toBe(UserType.ADMIN);
      expect(result.active).toBe(true);
      expect(result.emailVerified).toBe(true);
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should not include updatedAt in UserList', () => {
      const result = UserMapper.toList(mockUserDetails);
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('toListArray', () => {
    it('should map an array of UserDetails to UserList', () => {
      const users: UserDetails[] = [
        mockUserDetails,
        {
          ...mockUserDetails,
          id: 'user-002',
          userName: 'Jane Doe',
        },
      ];

      const result = UserMapper.toListArray(users);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('user-001');
      expect(result[1].id).toBe('user-002');
      expect(result[1].userName).toBe('Jane Doe');
    });

    it('should return empty array for empty input', () => {
      const result = UserMapper.toListArray([]);
      expect(result).toEqual([]);
    });
  });

  describe('toEdit', () => {
    it('should map UserDetails to UserEdit', () => {
      const result = UserMapper.toEdit(mockUserDetails);

      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('email');
      expect(result.userName).toBe('John Doe');
      expect(result.roleId).toBe('role-1');
      expect(result).not.toHaveProperty('role');
      expect(result.active).toBe(true);
    });

    it('should not include emailVerified, createdAt, or updatedAt', () => {
      const result = UserMapper.toEdit(mockUserDetails);
      expect(result).not.toHaveProperty('emailVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });
});
