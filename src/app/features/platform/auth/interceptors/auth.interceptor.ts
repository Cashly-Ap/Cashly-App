import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import { AUTH_SESSION_MESSAGES } from '@features/platform/auth/messages/error-messages';

const isAuthEndpoint = (url: string): boolean => {
  return (
    url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')
  );
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const messageService = inject(MessageService);

  const handleError = (error: HttpErrorResponse) => {
    if (!isPlatformBrowser(platformId)) {
      return throwError(() => error);
    }

    if (isAuthEndpoint(req.url)) {
      return throwError(() => error);
    }

    if (error.status === 0 || error.status === 504 || error.status === 503) {
      messageService.add({
        severity: 'error',
        summary: AUTH_SESSION_MESSAGES.connectionError.summary,
        detail: AUTH_SESSION_MESSAGES.connectionError.detail,
        life: 5000,
      });
      authService.clearAuthState();
      router.navigate(['/platform/auth/login']);
      return throwError(() => error);
    }

    if (error.status === 401) {
      const refreshToken = authService.refreshToken();

      if (refreshToken) {
        return authService.refreshTokenSilently().pipe(
          switchMap((response) => {
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            messageService.add({
              severity: 'warn',
              summary: AUTH_SESSION_MESSAGES.expired.summary,
              detail: AUTH_SESSION_MESSAGES.expired.detail,
              life: 5000,
            });
            authService.clearAuthState();
            router.navigate(['/platform/auth/login']);
            return throwError(() => refreshError);
          }),
        );
      }

      messageService.add({
        severity: 'warn',
        summary: AUTH_SESSION_MESSAGES.expired.summary,
        detail: AUTH_SESSION_MESSAGES.expired.detail,
        life: 5000,
      });
      authService.clearAuthState();
      router.navigate(['/platform/auth/login']);
      return throwError(() => error);
    }

    if (error.status >= 500) {
      messageService.add({
        severity: 'error',
        summary: AUTH_SESSION_MESSAGES.serverError.summary,
        detail: AUTH_SESSION_MESSAGES.serverError.detail,
        life: 5000,
      });
    }

    return throwError(() => error);
  };

  if (isPlatformBrowser(platformId)) {
    const token = authService.accessToken();

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(clonedRequest).pipe(catchError(handleError));
    }
  }

  return next(req).pipe(catchError(handleError));
};
