import { describe, it, expect } from 'vitest';
import type { User, UserResponse } from './user.interface';
import { BusinessModule } from '@features/users/models/enums';

describe('User interface', () => {
  it('should have all required properties', () => {
    const user: User = {
      id: 'u-001',
      email: 'test@example.com',
      active: true,
      emailVerified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    };

    expect(user.id).toBe('u-001');
    expect(user.email).toBe('test@example.com');
    expect(user.active).toBe(true);
    expect(user.emailVerified).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow optional password', () => {
    const userWithPassword: User = {
      id: 'u-001',
      email: 'test@example.com',
      password: 'secret',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(userWithPassword.password).toBe('secret');

    const userWithoutPassword: User = {
      id: 'u-001',
      email: 'test@example.com',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(userWithoutPassword.password).toBeUndefined();
  });
});

describe('UserResponse interface', () => {
  it('should have all required properties', () => {
    const response: UserResponse = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'testuser',
      type: 'OPERATOR',
      role: 'OPERATOR',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      modulePermissions: [BusinessModule.INVENTORY, BusinessModule.SALES],
    };

    expect(response.id).toBe('u-001');
    expect(response.email).toBe('test@example.com');
    expect(response.userName).toBe('testuser');
    expect(response.type).toBe('OPERATOR');
    expect(response.role).toBe('OPERATOR');
    expect(response.active).toBe(true);
    expect(response.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(response.modulePermissions).toHaveLength(2);
  });

  it('should accept all UserType values', () => {
    const types: Array<'OPERATOR' | 'ADMIN' | 'SUPER_ADMIN'> = [
      'OPERATOR',
      'ADMIN',
      'SUPER_ADMIN',
    ];

    types.forEach((type) => {
      const response: UserResponse = {
        id: 'u-001',
        email: 'test@example.com',
        userName: 'testuser',
        type,
        role: type,
        active: true,
        createdAt: '2025-01-01T00:00:00Z',
        modulePermissions: [],
      };
      expect(response.type).toBe(type);
      expect(response.role).toBe(type);
    });
  });
});
