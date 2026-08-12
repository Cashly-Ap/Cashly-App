import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, switchMap, catchError, filter, take } from 'rxjs/operators';
import { AuthApiService } from '@features/auth/services/api';
import { AUTH_HTTP_ERRORS, AUTH_DEFAULT_ERROR_MESSAGE } from '@features/auth/messages';
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
import { BusinessModule } from '@features/users/models/enums';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(AuthApiService);

  currentUser = signal<UserResponse | null>(null);
  accessToken = signal<string | null>(null);
  refreshToken = signal<string | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    this.loadAuthFromStorage();
  }

  register(request: RegisterUserRequest): Observable<UserResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.apiService.register(request).pipe(
      tap({
        next: (apiResponse) => {
          const current = this.currentUser();
          const updated: UserResponse = {
            ...(current ?? ({} as UserResponse)),
            userName: apiResponse.userName,
          };
          this.currentUser.set(updated);
          this.saveCurrentUserToStorage(updated);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
        },
      }),
    );
  }

  login(request: LoginRequest): Observable<AuthenticationResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.apiService.login(request).pipe(
      tap({
        next: (response) => {
          this.setAuthState(response);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
        },
      }),
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.apiService.changePassword(request).pipe(
      tap({
        next: () => {
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
        },
      }),
    );
  }

  changeUsername(request: ChangeUsernameRequest): Observable<UserResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.apiService.changeUsername(request).pipe(
      tap({
        next: (apiResponse) => {
          const current = this.currentUser();
          const updated: UserResponse = {
            ...(current ?? ({} as UserResponse)),
            userName: apiResponse.userName,
          };
          this.currentUser.set(updated);
          this.saveCurrentUserToStorage(updated);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
        },
      }),
    );
  }

  changeCommissionDeduction(request: ChangeCommissionDeductionRequest): Observable<UserResponse> {
    this.loading.set(true);
    this.error.set(null);

    return this.apiService.changeCommissionDeduction(request).pipe(
      tap({
        next: (apiResponse) => {
          const current = this.currentUser();
          const updated: UserResponse = {
            ...(current ?? ({} as UserResponse)),
            userName: apiResponse.userName,
          };
          this.currentUser.set(updated);
          this.saveCurrentUserToStorage(updated);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(this.getErrorMessage(err));
          this.loading.set(false);
        },
      }),
    );
  }

  isAuthenticated(): boolean {
    return this.accessToken() !== null;
  }

  isOperators(): boolean {
    return this.currentUser()?.role === 'OPERATOR';
  }

  isAdministration(): boolean {
    return this.currentUser()?.role === 'ADMIN';
  }

  isSuperAdmin(): boolean {
    const role = this.currentUser()?.role;
    return role === 'SUPER_ADMIN';
  }

  hasModulePermission(module: BusinessModule): boolean {
    if (this.isSuperAdmin()) return true;
    return this.currentUser()?.modulePermissions?.includes(module) ?? false;
  }

  refresh(request: RefreshTokenRequest): Observable<AuthenticationResponse> {
    return this.apiService.refresh(request).pipe(
      tap({
        next: (response) => {
          this.setAuthState(response);
        },
      }),
    );
  }

  logout(request: LogoutRequest): Observable<void> {
    return this.apiService.logout(request).pipe(
      tap({
        next: () => {
          this.clearAuthState();
        },
      }),
    );
  }

  refreshTokenSilently(): Observable<AuthenticationResponse> {
    const currentRefreshToken = this.refreshToken();
    if (!currentRefreshToken) {
      return new Observable((subscriber) => {
        subscriber.error(new Error('No refresh token available'));
      });
    }

    return this.apiService.refresh({ refreshToken: currentRefreshToken }).pipe(
      tap({
        next: (response) => {
          this.setAuthState(response);
        },
      }),
    );
  }

  getUserType(): string | null {
    return this.currentUser()?.type ?? null;
  }

  getMerchantId(): string | null {
    return null;
  }

  setAuthState(response: AuthenticationResponse): void {
    this.currentUser.set(response.entity);
    this.accessToken.set(response.accessToken);
    this.refreshToken.set(response.refreshToken);
    this.saveAuthToStorage(response);
  }

  clearAuthState(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.clearAuthFromStorage();
    this.clearTokenRefreshTimer();
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearTokenRefreshTimer();

    const refreshTime = expiresIn - 60000;

    this.tokenExpirationTimer = setTimeout(() => {
      const currentRefreshToken = this.refreshToken();
      if (currentRefreshToken) {
        this.refreshTokenSilently().subscribe({
          error: () => {
            this.clearAuthState();
          },
        });
      }
    }, refreshTime);
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  private saveAuthToStorage(response: AuthenticationResponse): void {
    const expirationTime = Date.now() + response.expiresIn;

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response.entity));
    localStorage.setItem('tokenExpiresAt', expirationTime.toString());
  }

  private loadAuthFromStorage(): void {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('currentUser');
      const expiresAtStr = localStorage.getItem('tokenExpiresAt');

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);

        if (!user || typeof user !== 'object') {
          this.clearAuthFromStorage();
          return;
        }

        this.accessToken.set(accessToken);
        this.refreshToken.set(refreshToken);
        this.currentUser.set(user);

        if (expiresAtStr) {
          const expiresAt = parseInt(expiresAtStr, 10);
          const timeRemaining = expiresAt - Date.now();

          if (timeRemaining > 60000) {
            this.scheduleTokenRefresh(timeRemaining);
          } else if (timeRemaining > 0) {
            this.refreshTokenSilently().subscribe({
              error: () => {
                this.clearAuthState();
              },
            });
          } else {
            this.clearAuthState();
          }
        }
      }
    } catch {
      this.clearAuthFromStorage();
    }
  }

  private clearAuthFromStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('tokenExpiresAt');
  }

  private saveCurrentUserToStorage(user: UserResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getErrorMessage(err: unknown): string {
    const httpError = err as { status?: number };
    const status = httpError.status ?? -1;

    return AUTH_HTTP_ERRORS[status] ?? AUTH_DEFAULT_ERROR_MESSAGE;
  }
}
