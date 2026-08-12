import { describe, it, expect } from 'vitest';
import type {
  RegisterUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangeUsernameRequest,
  ChangePasswordRequest,
  ChangeCommissionDeductionRequest,
} from '@features/auth/models/interfaces/auth-request.interface';

describe('RegisterUserRequest interface', () => {
  it('should have all required properties', () => {
    const req: RegisterUserRequest = {
      email: 'test@example.com',
      password: 'secret123',
    };

    expect(req.email).toBe('test@example.com');
    expect(req.password).toBe('secret123');
  });
});

describe('LoginRequest interface', () => {
  it('should have all required properties', () => {
    const req: LoginRequest = {
      email: 'test@example.com',
      password: 'secret123',
    };

    expect(req.email).toBe('test@example.com');
    expect(req.password).toBe('secret123');
  });
});

describe('RefreshTokenRequest interface', () => {
  it('should have all required properties', () => {
    const req: RefreshTokenRequest = {
      refreshToken: 'refresh-token-123',
    };

    expect(req.refreshToken).toBe('refresh-token-123');
  });
});

describe('LogoutRequest interface', () => {
  it('should have all required properties', () => {
    const req: LogoutRequest = {
      refreshToken: 'refresh-token-123',
    };

    expect(req.refreshToken).toBe('refresh-token-123');
  });
});

describe('ChangeUsernameRequest interface', () => {
  it('should have all required properties', () => {
    const req: ChangeUsernameRequest = {
      username: 'newusername',
    };

    expect(req.username).toBe('newusername');
  });
});

describe('ChangePasswordRequest interface', () => {
  it('should have all required properties', () => {
    const req: ChangePasswordRequest = {
      newPassword: 'newpassword123',
    };

    expect(req.newPassword).toBe('newpassword123');
  });
});

describe('ChangeCommissionDeductionRequest interface', () => {
  it('should have all required properties', () => {
    const req: ChangeCommissionDeductionRequest = {
      commissionDeductionPercentage: 15.5,
    };

    expect(req.commissionDeductionPercentage).toBe(15.5);
  });
});
