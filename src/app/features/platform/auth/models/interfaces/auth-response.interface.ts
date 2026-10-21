import { UserResponse } from '@features/platform/auth/models/interfaces/user.interface';

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  entity: UserResponse;
}

export interface MfaChallengeResponse {
  mfaRequired: true;
  challengeToken: string;
  expiresIn: number;
}

export type LoginResponse = AuthenticationResponse | MfaChallengeResponse;

export function requiresMfa(response: LoginResponse): response is MfaChallengeResponse {
  return 'mfaRequired' in response && response.mfaRequired === true;
}
