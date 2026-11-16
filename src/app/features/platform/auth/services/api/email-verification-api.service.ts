import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface EmailVerificationConfirmation {
  emailVerified: boolean;
}

export type EmailVerificationFailure =
  | 'EMAIL_VERIFICATION_INVALID'
  | 'EMAIL_VERIFICATION_EXPIRED'
  | 'EMAIL_VERIFICATION_USED'
  | 'EMAIL_VERIFICATION_RATE_LIMITED';

@Injectable({ providedIn: 'root' })
export class EmailVerificationApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/auth/email-verification`;

  confirm(token: string): Observable<EmailVerificationConfirmation> {
    return this.http.post<EmailVerificationConfirmation>(`${this.url}/confirm`, { token });
  }

  resend(): Observable<void> {
    return this.http.post<void>(`${this.url}/resend`, {});
  }
}
