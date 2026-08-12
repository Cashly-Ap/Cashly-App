import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  RegisterUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  ChangeUsernameRequest,
  ChangePasswordRequest,
  ChangeCommissionDeductionRequest,
  UserResponse,
  AuthenticationResponse,
} from '@features/auth/models';

const AUTH_API_ROUTES = {
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  CHANGE_USERNAME: '/auth/change-username',
  CHANGE_PASSWORD: '/auth/change-password',
  CHANGE_COMMISSION_DEDUCTION: '/auth/change-commission-deduction',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  register(request: RegisterUserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}${AUTH_API_ROUTES.REGISTER}`, request);
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}${AUTH_API_ROUTES.LOGIN}`,
      request,
    );
  }

  refresh(request: RefreshTokenRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(
      `${this.baseUrl}${AUTH_API_ROUTES.REFRESH}`,
      request,
    );
  }

  logout(request: LogoutRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}${AUTH_API_ROUTES.LOGOUT}`, request);
  }

  changeUsername(request: ChangeUsernameRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.baseUrl}${AUTH_API_ROUTES.CHANGE_USERNAME}`,
      request,
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}${AUTH_API_ROUTES.CHANGE_PASSWORD}`, {
      password: request.newPassword,
    });
  }

  changeCommissionDeduction(request: ChangeCommissionDeductionRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.baseUrl}${AUTH_API_ROUTES.CHANGE_COMMISSION_DEDUCTION}`,
      request,
    );
  }
}
