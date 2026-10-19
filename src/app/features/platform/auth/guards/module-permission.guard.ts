import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/application/auth-application.service';
import { BusinessModule } from '../user/models/enums/business-module.enum';
import { PermissionAction } from '../authorization/models/access.model';

export const modulePermissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/platform/auth/login']);

  const module = [...route.pathFromRoot]
    .reverse()
    .map((snapshot) => snapshot.data['module'])
    .find(Boolean) as BusinessModule | undefined;
  if (!module) return true;

  const path = route.routeConfig?.path ?? '';
  const action = (route.data['action'] ??
    (path === 'new' ? 'CREATE' : path.includes('edit') ? 'UPDATE' : 'READ')) as PermissionAction;
  const requiredPermissions = (route.data['requiredPermissions'] ?? []) as string[];

  return auth.ensureAccess().pipe(
    map(() => {
      const extraGrants = requiredPermissions.every((grant) => {
        const [owner, required] = grant.split(':');
        return auth.hasPermission(owner as BusinessModule, required as PermissionAction);
      });
      return (
        (auth.hasPermission(module, action) && extraGrants) ||
        router.createUrlTree(['/platform/auth/configuration'])
      );
    }),
    catchError(() => of(router.createUrlTree(['/platform/auth/login']))),
  );
};
