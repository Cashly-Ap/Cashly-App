import { UserResponse } from '@features/auth/models/interfaces/user';

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  entity: UserResponse;
}
