import { describe, it, expect } from 'vitest';
import type { AuthenticationResponse } from '@features/platform/auth/models/interfaces/auth-response.interface';
import type { UserResponse } from '@features/platform/auth/models/interfaces/user.interface';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

describe('AuthenticationResponse interface', () => {
  it('should have all required properties', () => {
    const userEntity: UserResponse = {
      id: 'u-001',
      email: 'test@example.com',
      userName: 'testuser',
      type: 'OPERATOR',
      role: 'OPERATOR',
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      modulePermissions: [BusinessModule.INVENTORY_WAREHOUSES],
    };

    const response: AuthenticationResponse = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      tokenType: 'Bearer',
      expiresIn: 3600,
      entity: userEntity,
    };

    expect(response.accessToken).toBe('access-token-123');
    expect(response.refreshToken).toBe('refresh-token-456');
    expect(response.tokenType).toBe('Bearer');
    expect(response.expiresIn).toBe(3600);
    expect(response.entity).toBe(userEntity);
    expect(response.entity.id).toBe('u-001');
  });
});
