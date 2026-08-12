import { describe, it, expect } from 'vitest';
import { UserMapper } from './user.mapper';
import { UserDetails, UserList, UserEdit } from '../../models/interfaces';
import { UserType, BusinessModule } from '../../models/enums';

describe('UserMapper', () => {
  const mockUserDetails: UserDetails = {
    id: 'user-001',
    email: 'john@example.com',
    userName: 'John Doe',
    role: UserType.ADMIN,
    active: true,
    emailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    modulePermissions: [BusinessModule.USERS, BusinessModule.SALES],
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
      expect(result.modulePermissions).toEqual([BusinessModule.USERS, BusinessModule.SALES]);
    });

    it('should default modulePermissions to empty array when undefined', () => {
      const userWithoutPermissions = {
        ...mockUserDetails,
        modulePermissions: undefined as unknown as BusinessModule[],
      };
      const result = UserMapper.toList(userWithoutPermissions);
      expect(result.modulePermissions).toEqual([]);
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

      expect(result.id).toBe('user-001');
      expect(result.email).toBe('john@example.com');
      expect(result.userName).toBe('John Doe');
      expect(result.role).toBe(UserType.ADMIN);
      expect(result.active).toBe(true);
    });

    it('should not include emailVerified, createdAt, updatedAt, or modulePermissions', () => {
      const result = UserMapper.toEdit(mockUserDetails);
      expect(result).not.toHaveProperty('emailVerified');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(result).not.toHaveProperty('modulePermissions');
    });
  });
});
