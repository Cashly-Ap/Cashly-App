import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

export interface MfaStatus {
  enabled: boolean;
  recoveryCodesRemaining: number;
}
export interface MfaSetup {
  secret: string;
  otpauthUri: string;
  expiresIn: number;
}

@Injectable({ providedIn: 'root' })
export class MfaApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth/mfa`;
  status() {
    return this.http.get<MfaStatus>(this.url);
  }
  setup(password: string) {
    return this.http.post<MfaSetup>(`${this.url}/setup`, { password });
  }
  enable(code: string) {
    return this.http.post<{ recoveryCodes: string[] }>(`${this.url}/enable`, { code });
  }
  disable(password: string, code: string) {
    return this.http.post<void>(`${this.url}/disable`, { password, code });
  }
}
