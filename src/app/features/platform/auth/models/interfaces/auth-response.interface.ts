import { UserResponse } from '@features/platform/auth/models/interfaces/user.interface';

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  entity: UserResponse;
}
