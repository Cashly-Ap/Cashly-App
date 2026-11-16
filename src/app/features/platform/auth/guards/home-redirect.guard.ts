import { map, catchError, of } from 'rxjs';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';

import { authorizedDestination } from '@features/platform/auth/routing/authorized-destination';

export const homeRedirectGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/platform/auth/login']);
    return false;
  }

  const area = route.pathFromRoot
    .map((snapshot) => snapshot.data['navigationArea'])
    .reverse()
    .find(Boolean) as string | undefined;
  return authService.ensureAccess().pipe(
    map(() => router.createUrlTree([authorizedDestination(authService, area)])),
    catchError(() => of(router.createUrlTree(['/platform/auth/login']))),
  );
};
